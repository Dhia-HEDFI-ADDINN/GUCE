package cm.guce.procedure.application.service;

import cm.guce.common.domain.exception.ResourceNotFoundException;
import cm.guce.common.domain.exception.ValidationException;
import cm.guce.common.security.SecurityUtils;
import cm.guce.procedure.application.dto.ProcedureDto;
import cm.guce.procedure.application.mapper.ProcedureMapper;
import cm.guce.procedure.domain.model.Procedure;
import cm.guce.procedure.domain.port.ProcedureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service de gestion des procédures.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcedureService {

    private final ProcedureRepository procedureRepository;
    private final ProcedureMapper procedureMapper;

    /**
     * Récupère toutes les procédures publiées.
     */
    public List<ProcedureDto.Summary> findPublished() {
        log.debug("Fetching published procedures");
        return procedureMapper.toSummaryList(procedureRepository.findPublished());
    }

    /**
     * Récupère les procédures publiées par catégorie.
     */
    public List<ProcedureDto.Summary> findPublishedByCategory(Procedure.ProcedureCategory category) {
        log.debug("Fetching published procedures for category: {}", category);
        return procedureMapper.toSummaryList(procedureRepository.findPublishedByCategory(category));
    }

    /**
     * Récupère une procédure par son ID.
     */
    public ProcedureDto.Response findById(UUID id) {
        log.debug("Fetching procedure by id: {}", id);
        Procedure procedure = procedureRepository.findByIdWithSteps(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", id));
        return procedureMapper.toResponse(procedure);
    }

    /**
     * Récupère une procédure par son code.
     */
    public ProcedureDto.Response findByCode(String code) {
        log.debug("Fetching procedure by code: {}", code);
        Procedure procedure = procedureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", code));
        return procedureMapper.toResponse(procedure);
    }

    /**
     * Recherche de procédures.
     */
    public Page<ProcedureDto.Summary> search(String query, Pageable pageable) {
        log.debug("Searching procedures with query: {}", query);
        return procedureRepository.search(query, pageable)
                .map(procedureMapper::toSummary);
    }

    /**
     * Crée une nouvelle procédure.
     */
    @Transactional
    public ProcedureDto.Response create(ProcedureDto.CreateRequest request) {
        log.info("Creating procedure: {}", request.getCode());

        validateCreate(request);

        Procedure procedure = procedureMapper.toEntity(request);
        procedure.setTenantId(SecurityUtils.getCurrentTenantId().orElse("default"));
        procedure.setStatus(Procedure.ProcedureStatus.DRAFT);
        procedure.setVersionNumber(1);

        procedure = procedureRepository.save(procedure);
        log.info("Procedure created with id: {}", procedure.getId());

        return procedureMapper.toResponse(procedure);
    }

    /**
     * Met à jour une procédure.
     */
    @Transactional
    public ProcedureDto.Response update(UUID id, ProcedureDto.UpdateRequest request) {
        log.info("Updating procedure: {}", id);

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", id));

        if (procedure.getStatus() == Procedure.ProcedureStatus.PUBLISHED) {
            throw new ValidationException("Une procédure publiée ne peut pas être modifiée directement. Créez une nouvelle version.");
        }

        procedureMapper.updateEntity(request, procedure);
        procedure = procedureRepository.save(procedure);

        log.info("Procedure updated: {}", procedure.getId());
        return procedureMapper.toResponse(procedure);
    }

    /**
     * Publie une procédure.
     */
    @Transactional
    public ProcedureDto.Response publish(UUID id) {
        log.info("Publishing procedure: {}", id);

        Procedure procedure = procedureRepository.findByIdWithSteps(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", id));

        validateForPublish(procedure);

        procedure.setStatus(Procedure.ProcedureStatus.PUBLISHED);
        procedure.setPublishedVersion(procedure.getVersionNumber());
        procedure = procedureRepository.save(procedure);

        log.info("Procedure published: {}", procedure.getId());
        return procedureMapper.toResponse(procedure);
    }

    /**
     * Archive une procédure.
     */
    @Transactional
    public void archive(UUID id) {
        log.info("Archiving procedure: {}", id);

        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", id));

        procedure.setStatus(Procedure.ProcedureStatus.ARCHIVED);
        procedure.setIsActive(false);
        procedureRepository.save(procedure);

        log.info("Procedure archived: {}", id);
    }

    /**
     * Crée une nouvelle version d'une procédure.
     */
    @Transactional
    public ProcedureDto.Response createNewVersion(UUID id) {
        log.info("Creating new version of procedure: {}", id);

        Procedure original = procedureRepository.findByIdWithSteps(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procédure", id));

        // Marquer l'ancienne version comme dépréciée
        original.setStatus(Procedure.ProcedureStatus.DEPRECATED);
        procedureRepository.save(original);

        // Créer la nouvelle version
        Procedure newVersion = procedureMapper.cloneProcedure(original);
        newVersion.setId(null);
        newVersion.setVersionNumber(original.getVersionNumber() + 1);
        newVersion.setStatus(Procedure.ProcedureStatus.DRAFT);
        newVersion.setPublishedVersion(null);

        newVersion = procedureRepository.save(newVersion);
        log.info("New version created: {} v{}", newVersion.getCode(), newVersion.getVersionNumber());

        return procedureMapper.toResponse(newVersion);
    }

    private void validateCreate(ProcedureDto.CreateRequest request) {
        ValidationException validationException = new ValidationException("Erreur de validation");

        if (procedureRepository.existsByCode(request.getCode())) {
            validationException.addFieldError("code", "Ce code de procédure existe déjà");
        }

        if (validationException.hasErrors()) {
            throw validationException;
        }
    }

    private void validateForPublish(Procedure procedure) {
        ValidationException validationException = new ValidationException("La procédure n'est pas prête à être publiée");

        if (procedure.getSteps() == null || procedure.getSteps().isEmpty()) {
            validationException.addFieldError("steps", "La procédure doit avoir au moins une étape");
        }

        if (procedure.getBpmnProcessId() == null || procedure.getBpmnProcessId().isBlank()) {
            validationException.addFieldError("bpmnProcessId", "Le processus BPMN doit être défini");
        }

        if (validationException.hasErrors()) {
            throw validationException;
        }
    }
}
