package cm.guce.procedure.application.service;

import cm.guce.common.domain.exception.BusinessRuleException;
import cm.guce.common.domain.exception.ResourceNotFoundException;
import cm.guce.common.domain.model.EntityStatus;
import cm.guce.common.security.SecurityUtils;
import cm.guce.common.util.StringUtils;
import cm.guce.procedure.application.dto.DeclarationDto;
import cm.guce.procedure.application.mapper.DeclarationMapper;
import cm.guce.procedure.domain.model.Declaration;
import cm.guce.procedure.domain.model.Procedure;
import cm.guce.procedure.domain.port.DeclarationRepository;
import cm.guce.procedure.domain.port.ProcedureRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service de gestion des déclarations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeclarationService {

    private final DeclarationRepository declarationRepository;
    private final ProcedureRepository procedureRepository;
    private final DeclarationMapper declarationMapper;
    private final ZeebeClient zeebeClient;

    /**
     * Récupère une déclaration par son ID.
     */
    public DeclarationDto.Response findById(UUID id) {
        log.debug("Fetching declaration by id: {}", id);
        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration", id));
        return declarationMapper.toResponse(declaration);
    }

    /**
     * Récupère une déclaration par sa référence.
     */
    public DeclarationDto.Response findByReference(String reference) {
        log.debug("Fetching declaration by reference: {}", reference);
        Declaration declaration = declarationRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration", reference));
        return declarationMapper.toResponse(declaration);
    }

    /**
     * Récupère les déclarations d'un opérateur.
     */
    public Page<DeclarationDto.Summary> findByOperator(UUID operatorId, Pageable pageable) {
        log.debug("Fetching declarations for operator: {}", operatorId);
        return declarationRepository.findByOperatorId(operatorId, pageable)
                .map(declarationMapper::toSummary);
    }

    /**
     * Récupère les déclarations par statut.
     */
    public Page<DeclarationDto.Summary> findByStatus(EntityStatus status, Pageable pageable) {
        log.debug("Fetching declarations with status: {}", status);
        return declarationRepository.findByStatus(status, pageable)
                .map(declarationMapper::toSummary);
    }

    /**
     * Recherche de déclarations.
     */
    public Page<DeclarationDto.Summary> search(String query, Pageable pageable) {
        log.debug("Searching declarations with query: {}", query);
        return declarationRepository.search(query, pageable)
                .map(declarationMapper::toSummary);
    }

    /**
     * Crée une nouvelle déclaration (brouillon).
     */
    @Transactional
    public DeclarationDto.Response create(DeclarationDto.CreateRequest request) {
        log.info("Creating declaration for procedure: {}", request.getProcedureCode());

        Procedure procedure = procedureRepository.findByCode(request.getProcedureCode())
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", request.getProcedureCode()));

        if (procedure.getStatus() != Procedure.ProcedureStatus.PUBLISHED) {
            throw new BusinessRuleException("La procédure n'est pas publiée");
        }

        Declaration declaration = declarationMapper.toEntity(request);
        declaration.setReference(generateReference(procedure.getCode()));
        declaration.setProcedure(procedure);
        declaration.setProcedureCode(procedure.getCode());
        declaration.setStatus(EntityStatus.DRAFT);
        declaration.setTenantId(SecurityUtils.getCurrentTenantId().orElse("default"));

        if (procedure.getExpectedDurationHours() != null) {
            declaration.setExpectedCompletionDate(
                    LocalDateTime.now().plusHours(procedure.getExpectedDurationHours()));
        }

        declaration = declarationRepository.save(declaration);
        log.info("Declaration created with reference: {}", declaration.getReference());

        return declarationMapper.toResponse(declaration);
    }

    /**
     * Met à jour une déclaration (brouillon uniquement).
     */
    @Transactional
    public DeclarationDto.Response update(UUID id, DeclarationDto.UpdateRequest request) {
        log.info("Updating declaration: {}", id);

        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration", id));

        if (declaration.getStatus() != EntityStatus.DRAFT) {
            throw new BusinessRuleException("Seuls les brouillons peuvent être modifiés");
        }

        declarationMapper.updateEntity(request, declaration);
        declaration = declarationRepository.save(declaration);

        log.info("Declaration updated: {}", declaration.getReference());
        return declarationMapper.toResponse(declaration);
    }

    /**
     * Soumet une déclaration pour traitement.
     */
    @Transactional
    public DeclarationDto.Response submit(UUID id) {
        log.info("Submitting declaration: {}", id);

        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration", id));

        if (declaration.getStatus() != EntityStatus.DRAFT) {
            throw new BusinessRuleException("Seuls les brouillons peuvent être soumis");
        }

        Procedure procedure = declaration.getProcedure();

        // Démarrer le processus Camunda
        Map<String, Object> variables = buildProcessVariables(declaration);

        ProcessInstanceEvent processInstance = zeebeClient.newCreateInstanceCommand()
                .bpmnProcessId(procedure.getBpmnProcessId())
                .latestVersion()
                .variables(variables)
                .send()
                .join();

        declaration.setProcessInstanceId(String.valueOf(processInstance.getProcessInstanceKey()));
        declaration.submit();

        // Définir la première étape
        if (!procedure.getSteps().isEmpty()) {
            declaration.setCurrentStep(procedure.getSteps().get(0).getCode());
            declaration.setCurrentStepName(procedure.getSteps().get(0).getNameFr());
        }

        declaration = declarationRepository.save(declaration);
        log.info("Declaration submitted: {} - Process Instance: {}",
                declaration.getReference(), declaration.getProcessInstanceId());

        return declarationMapper.toResponse(declaration);
    }

    /**
     * Approuve une tâche de la déclaration.
     */
    @Transactional
    public DeclarationDto.Response approveTask(UUID id, DeclarationDto.TaskAction action) {
        log.info("Approving task for declaration: {}", id);

        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration", id));

        // Compléter la tâche dans Camunda
        Map<String, Object> variables = new HashMap<>();
        variables.put("approved", true);
        variables.put("comment", action.getComment());
        variables.put("approvedBy", SecurityUtils.getCurrentUserId().orElse("unknown"));

        // Dans une vraie implémentation, on récupérerait la tâche active et on la compléterait
        // zeebeClient.newCompleteCommand(taskKey).variables(variables).send().join();

        declaration = declarationRepository.save(declaration);
        log.info("Task approved for declaration: {}", declaration.getReference());

        return declarationMapper.toResponse(declaration);
    }

    /**
     * Rejette une déclaration.
     */
    @Transactional
    public DeclarationDto.Response reject(UUID id, String reason) {
        log.info("Rejecting declaration: {}", id);

        Declaration declaration = declarationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration", id));

        declaration.reject(reason);
        declaration = declarationRepository.save(declaration);

        log.info("Declaration rejected: {}", declaration.getReference());
        return declarationMapper.toResponse(declaration);
    }

    /**
     * Génère les statistiques des déclarations.
     */
    public DeclarationDto.Statistics getStatistics() {
        String tenantId = SecurityUtils.getCurrentTenantId().orElse("default");

        DeclarationDto.Statistics stats = new DeclarationDto.Statistics();
        stats.setTotalDraft(declarationRepository.countByStatusAndTenant(EntityStatus.DRAFT, tenantId));
        stats.setTotalSubmitted(declarationRepository.countByStatusAndTenant(EntityStatus.SUBMITTED, tenantId));
        stats.setTotalInProgress(declarationRepository.countByStatusAndTenant(EntityStatus.IN_PROGRESS, tenantId));
        stats.setTotalApproved(declarationRepository.countByStatusAndTenant(EntityStatus.APPROVED, tenantId));
        stats.setTotalRejected(declarationRepository.countByStatusAndTenant(EntityStatus.REJECTED, tenantId));

        return stats;
    }

    private String generateReference(String procedureCode) {
        return StringUtils.generateReference(procedureCode);
    }

    private Map<String, Object> buildProcessVariables(Declaration declaration) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("declarationId", declaration.getId().toString());
        variables.put("declarationReference", declaration.getReference());
        variables.put("operatorId", declaration.getOperatorId().toString());
        variables.put("operatorName", declaration.getOperatorName());
        variables.put("procedureCode", declaration.getProcedureCode());
        variables.put("tenantId", declaration.getTenantId());

        if (declaration.getDataJson() != null) {
            variables.put("declarationData", declaration.getDataJson());
        }

        return variables;
    }
}
