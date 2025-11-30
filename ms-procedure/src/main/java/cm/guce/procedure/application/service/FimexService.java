package cm.guce.procedure.application.service;

import cm.guce.common.domain.exception.BusinessRuleException;
import cm.guce.common.domain.exception.ResourceNotFoundException;
import cm.guce.common.security.SecurityUtils;
import cm.guce.common.util.StringUtils;
import cm.guce.procedure.application.dto.FimexDto;
import cm.guce.procedure.domain.model.FimexDocument;
import cm.guce.procedure.domain.model.FimexInscription;
import cm.guce.procedure.domain.model.FimexInscription.*;
import cm.guce.procedure.domain.port.FimexRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des inscriptions FIMEX.
 * Implémente le workflow d'inscription et de renouvellement au Fichier
 * des Importateurs/Exportateurs du Cameroun.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FimexService {

    private final FimexRepository repository;
    private final ZeebeClient zeebeClient;

    // Constantes des frais
    private static final BigDecimal CNCC_FEE = new BigDecimal("10000");
    private static final BigDecimal MINCOM_FEE = new BigDecimal("15000");
    private static final BigDecimal TOTAL_FEES = new BigDecimal("25000");

    // BPMN Process IDs
    private static final String BPMN_FIMEX_INSCRIPTION = "fimex-inscription";
    private static final String BPMN_FIMEX_RENOUVELLEMENT = "fimex-renouvellement";

    // ========================================
    // LECTURE
    // ========================================

    /**
     * Récupère une inscription FIMEX par son ID.
     */
    public FimexDto.Response findById(UUID id) {
        log.debug("Fetching FIMEX inscription by id: {}", id);
        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));
        return toResponse(inscription);
    }

    /**
     * Récupère une inscription FIMEX par sa référence.
     */
    public FimexDto.Response findByReference(String reference) {
        log.debug("Fetching FIMEX inscription by reference: {}", reference);
        FimexInscription inscription = repository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", reference));
        return toResponse(inscription);
    }

    /**
     * Récupère les inscriptions FIMEX d'un exportateur/importateur.
     */
    public Page<FimexDto.Summary> findByNiu(String niu, Pageable pageable) {
        log.debug("Fetching FIMEX inscriptions for NIU: {}", niu);
        return repository.findByNiu(niu, pageable)
                .map(this::toSummary);
    }

    /**
     * Récupère les inscriptions FIMEX par statut.
     */
    public Page<FimexDto.Summary> findByStatus(FimexStatus status, Pageable pageable) {
        log.debug("Fetching FIMEX inscriptions by status: {}", status);
        return repository.findByStatus(status, pageable)
                .map(this::toSummary);
    }

    /**
     * Récupère les inscriptions en attente de traitement.
     */
    public Page<FimexDto.Summary> findPendingProcessing(Pageable pageable) {
        log.debug("Fetching pending FIMEX inscriptions");
        return repository.findByStatusIn(
                List.of(FimexStatus.ALL_PAID, FimexStatus.COMPLEMENT_PROVIDED), pageable)
                .map(this::toSummary);
    }

    /**
     * Recherche d'inscriptions FIMEX.
     */
    public Page<FimexDto.Summary> search(String query, Pageable pageable) {
        log.debug("Searching FIMEX inscriptions with query: {}", query);
        return repository.search(query, pageable)
                .map(this::toSummary);
    }

    /**
     * Vérifie la validité d'un certificat FIMEX.
     */
    public FimexDto.CertificateInfo verifyCertificate(String certificateNumber) {
        log.debug("Verifying FIMEX certificate: {}", certificateNumber);

        FimexInscription inscription = repository.findByCertificateNumber(certificateNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Certificat FIMEX", certificateNumber));

        FimexDto.CertificateInfo info = new FimexDto.CertificateInfo();
        info.setCertificateNumber(inscription.getCertificateNumber());
        info.setCompanyName(inscription.getCompanyName());
        info.setNiu(inscription.getNiu());
        info.setIssueDate(inscription.getCertificateIssueDate());
        info.setExpiryDate(inscription.getCertificateExpiryDate());

        LocalDate today = LocalDate.now();
        boolean isValid = inscription.getStatus() == FimexStatus.SIGNED &&
                          inscription.getCertificateExpiryDate() != null &&
                          !inscription.getCertificateExpiryDate().isBefore(today);

        info.setValid(isValid);

        if (inscription.getCertificateExpiryDate() != null) {
            info.setDaysUntilExpiry((int) ChronoUnit.DAYS.between(today, inscription.getCertificateExpiryDate()));
        }

        return info;
    }

    // ========================================
    // CRÉATION
    // ========================================

    /**
     * Crée une nouvelle demande d'inscription FIMEX (brouillon).
     */
    @Transactional
    public FimexDto.Response create(FimexDto.CreateRequest request) {
        log.info("Creating FIMEX inscription for NIU: {}", request.getNiu());

        // Vérifier si une inscription active existe déjà
        if (request.getRequestType() == RequestType.INSCRIPTION) {
            Optional<FimexInscription> existing = repository.findActiveByNiu(request.getNiu());
            if (existing.isPresent()) {
                throw new BusinessRuleException(
                        "Une inscription FIMEX active existe déjà pour ce NIU. " +
                        "Utilisez le renouvellement si nécessaire.");
            }
        }

        FimexInscription inscription = new FimexInscription();

        // Générer la référence
        String prefix = request.getRequestType() == RequestType.INSCRIPTION ? "FIMEX-INS" : "FIMEX-REN";
        inscription.setReference(StringUtils.generateReference(prefix));
        inscription.setStatus(FimexStatus.DRAFT);
        inscription.setRequestType(request.getRequestType());
        inscription.setTenantId(SecurityUtils.getCurrentTenantId().orElse("default"));

        // Informations société
        inscription.setNiu(request.getNiu());
        inscription.setCompanyName(request.getCompanyName());
        inscription.setCniSsn(request.getCniSsn());
        inscription.setLegalForm(request.getLegalForm());
        inscription.setCountryOfBirth(request.getCountryOfBirth());
        inscription.setNationality(request.getNationality());
        inscription.setAnnualRevenue(request.getAnnualRevenue());
        inscription.setMainActivity(request.getMainActivity());
        inscription.setCommercialRegisterNumber(request.getCommercialRegisterNumber());
        inscription.setEmail(request.getEmail());
        inscription.setPhone(request.getPhone());
        inscription.setAddress(request.getAddress());
        inscription.setPostalBox(request.getPostalBox());
        inscription.setCity(request.getCity());
        inscription.setRegion(request.getRegion());

        // Représentant légal
        inscription.setLegalRepName(request.getLegalRepName());
        inscription.setLegalRepTitle(request.getLegalRepTitle());
        inscription.setLegalRepCni(request.getLegalRepCni());
        inscription.setLegalRepPhone(request.getLegalRepPhone());
        inscription.setLegalRepEmail(request.getLegalRepEmail());

        // Produits
        inscription.setMainProducts(request.getMainProducts());
        inscription.setHsCodes(request.getHsCodes());
        inscription.setExportDestinations(request.getExportDestinations());
        inscription.setImportOrigins(request.getImportOrigins());

        // Frais
        inscription.setRegistrationFee(CNCC_FEE);
        inscription.setProcessingFee(MINCOM_FEE);
        inscription.setTotalFees(TOTAL_FEES);

        // Renouvellement
        if (request.getRequestType() == RequestType.RENOUVELLEMENT) {
            inscription.setPreviousCertificateNumber(request.getPreviousCertificateNumber());
            inscription.setPreviousCertificateExpiry(request.getPreviousCertificateExpiry());
        }

        inscription = repository.save(inscription);
        log.info("FIMEX inscription created with reference: {}", inscription.getReference());

        return toResponse(inscription);
    }

    // ========================================
    // MISE À JOUR
    // ========================================

    /**
     * Met à jour une inscription FIMEX (brouillon uniquement).
     */
    @Transactional
    public FimexDto.Response update(UUID id, FimexDto.UpdateRequest request) {
        log.info("Updating FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.DRAFT &&
            inscription.getStatus() != FimexStatus.COMPLEMENT_REQUESTED) {
            throw new BusinessRuleException("Cette demande ne peut plus être modifiée");
        }

        // Mise à jour des champs modifiables
        if (request.getAddress() != null) inscription.setAddress(request.getAddress());
        if (request.getPostalBox() != null) inscription.setPostalBox(request.getPostalBox());
        if (request.getPhone() != null) inscription.setPhone(request.getPhone());
        if (request.getEmail() != null) inscription.setEmail(request.getEmail());
        if (request.getLegalRepName() != null) inscription.setLegalRepName(request.getLegalRepName());
        if (request.getLegalRepTitle() != null) inscription.setLegalRepTitle(request.getLegalRepTitle());
        if (request.getLegalRepPhone() != null) inscription.setLegalRepPhone(request.getLegalRepPhone());
        if (request.getLegalRepEmail() != null) inscription.setLegalRepEmail(request.getLegalRepEmail());
        if (request.getMainProducts() != null) inscription.setMainProducts(request.getMainProducts());
        if (request.getHsCodes() != null) inscription.setHsCodes(request.getHsCodes());
        if (request.getExportDestinations() != null) inscription.setExportDestinations(request.getExportDestinations());
        if (request.getImportOrigins() != null) inscription.setImportOrigins(request.getImportOrigins());

        inscription = repository.save(inscription);
        log.info("FIMEX inscription updated: {}", inscription.getReference());

        return toResponse(inscription);
    }

    // ========================================
    // WORKFLOW
    // ========================================

    /**
     * Soumet une demande d'inscription FIMEX.
     */
    @Transactional
    public FimexDto.Response submit(UUID id) {
        log.info("Submitting FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.DRAFT) {
            throw new BusinessRuleException("Seuls les brouillons peuvent être soumis");
        }

        // Valider les documents obligatoires
        validateMandatoryDocuments(inscription);

        inscription.submit();

        // Démarrer le processus Camunda
        String bpmnProcessId = inscription.getRequestType() == RequestType.INSCRIPTION ?
                BPMN_FIMEX_INSCRIPTION : BPMN_FIMEX_RENOUVELLEMENT;

        try {
            Map<String, Object> variables = buildProcessVariables(inscription);
            ProcessInstanceEvent processInstance = zeebeClient.newCreateInstanceCommand()
                    .bpmnProcessId(bpmnProcessId)
                    .latestVersion()
                    .variables(variables)
                    .send()
                    .join();

            inscription.setProcessInstanceId(String.valueOf(processInstance.getProcessInstanceKey()));
        } catch (Exception e) {
            log.warn("Could not start workflow process: {}", e.getMessage());
        }

        inscription = repository.save(inscription);
        log.info("FIMEX inscription submitted: {}", inscription.getReference());

        return toResponse(inscription);
    }

    /**
     * Enregistre le paiement CNCC (10 000 FCFA).
     */
    @Transactional
    public FimexDto.Response recordCnccPayment(UUID id, String paymentReference) {
        log.info("Recording CNCC payment for FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        inscription.recordCnccPayment(paymentReference);
        inscription = repository.save(inscription);

        log.info("CNCC payment recorded for FIMEX inscription: {}", inscription.getReference());
        return toResponse(inscription);
    }

    /**
     * Enregistre le paiement MINCOMMERCE (15 000 FCFA).
     */
    @Transactional
    public FimexDto.Response recordMincomPayment(UUID id, String paymentReference) {
        log.info("Recording MINCOMMERCE payment for FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (!Boolean.TRUE.equals(inscription.getIsCnccPaid())) {
            throw new BusinessRuleException("Le paiement CNCC doit être effectué avant le paiement MINCOMMERCE");
        }

        inscription.recordMincomPayment(paymentReference);
        inscription = repository.save(inscription);

        log.info("MINCOMMERCE payment recorded for FIMEX inscription: {}", inscription.getReference());
        return toResponse(inscription);
    }

    /**
     * Démarre le traitement d'une demande FIMEX.
     */
    @Transactional
    public FimexDto.Response startProcessing(UUID id) {
        log.info("Starting processing of FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.ALL_PAID &&
            inscription.getStatus() != FimexStatus.COMPLEMENT_PROVIDED) {
            throw new BusinessRuleException("Cette demande ne peut pas être traitée dans son état actuel");
        }

        String currentUser = SecurityUtils.getCurrentUserId().orElse("system");
        inscription.startProcessing(currentUser);
        inscription = repository.save(inscription);

        log.info("Processing started for FIMEX inscription: {}", inscription.getReference());
        return toResponse(inscription);
    }

    /**
     * Demande un complément d'information.
     */
    @Transactional
    public FimexDto.Response requestComplement(UUID id, FimexDto.ComplementRequest request) {
        log.info("Requesting complement for FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.PROCESSING) {
            throw new BusinessRuleException("Cette demande n'est pas en cours de traitement");
        }

        inscription.requestComplement(request.getReason());
        inscription = repository.save(inscription);

        log.info("Complement requested for FIMEX inscription: {}", inscription.getReference());
        return toResponse(inscription);
    }

    /**
     * Fournit le complément d'information.
     */
    @Transactional
    public FimexDto.Response provideComplement(UUID id) {
        log.info("Providing complement for FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.COMPLEMENT_REQUESTED) {
            throw new BusinessRuleException("Aucun complément n'a été demandé pour cette inscription");
        }

        inscription.provideComplement();
        inscription = repository.save(inscription);

        log.info("Complement provided for FIMEX inscription: {}", inscription.getReference());
        return toResponse(inscription);
    }

    /**
     * Approuve une demande FIMEX.
     */
    @Transactional
    public FimexDto.Response approve(UUID id) {
        log.info("Approving FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.PROCESSING) {
            throw new BusinessRuleException("Cette demande n'est pas en cours de traitement");
        }

        String currentUser = SecurityUtils.getCurrentUserId().orElse("system");
        inscription.approve(currentUser);
        inscription = repository.save(inscription);

        log.info("FIMEX inscription approved: {}", inscription.getReference());
        return toResponse(inscription);
    }

    /**
     * Signe le certificat FIMEX.
     */
    @Transactional
    public FimexDto.Response signCertificate(UUID id, FimexDto.SignatureRequest request) {
        log.info("Signing certificate for FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        if (inscription.getStatus() != FimexStatus.APPROVED) {
            throw new BusinessRuleException("Cette demande n'a pas été approuvée");
        }

        String currentUser = SecurityUtils.getCurrentUserId().orElse("system");
        String certificateNumber = inscription.generateCertificateNumber();
        inscription.signCertificate(currentUser, certificateNumber);

        // Notifier la SGS
        inscription.notifySgs();

        inscription = repository.save(inscription);
        log.info("Certificate signed for FIMEX inscription: {} - Certificate: {}",
                inscription.getReference(), certificateNumber);

        return toResponse(inscription);
    }

    /**
     * Rejette une demande FIMEX.
     */
    @Transactional
    public FimexDto.Response reject(UUID id, FimexDto.RejectionRequest request) {
        log.info("Rejecting FIMEX inscription: {}", id);

        FimexInscription inscription = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription FIMEX", id));

        String currentUser = SecurityUtils.getCurrentUserId().orElse("system");
        inscription.reject(currentUser, request.getReason());
        inscription = repository.save(inscription);

        log.info("FIMEX inscription rejected: {}", inscription.getReference());
        return toResponse(inscription);
    }

    // ========================================
    // STATISTIQUES
    // ========================================

    /**
     * Génère les statistiques des inscriptions FIMEX.
     */
    public FimexDto.Statistics getStatistics() {
        String tenantId = SecurityUtils.getCurrentTenantId().orElse("default");
        FimexDto.Statistics stats = new FimexDto.Statistics();

        // Par statut
        stats.setTotalDraft(repository.countByStatusAndTenant(FimexStatus.DRAFT, tenantId));
        stats.setTotalSubmitted(repository.countByStatusAndTenant(FimexStatus.SUBMITTED, tenantId));
        stats.setTotalProcessing(repository.countByStatusAndTenant(FimexStatus.PROCESSING, tenantId));
        stats.setTotalComplementRequested(repository.countByStatusAndTenant(FimexStatus.COMPLEMENT_REQUESTED, tenantId));
        stats.setTotalApproved(repository.countByStatusAndTenant(FimexStatus.APPROVED, tenantId));
        stats.setTotalSigned(repository.countByStatusAndTenant(FimexStatus.SIGNED, tenantId));
        stats.setTotalRejected(repository.countByStatusAndTenant(FimexStatus.REJECTED, tenantId));
        stats.setTotalExpired(repository.countByStatusAndTenant(FimexStatus.EXPIRED, tenantId));

        return stats;
    }

    // ========================================
    // MÉTHODES PRIVÉES
    // ========================================

    private void validateMandatoryDocuments(FimexInscription inscription) {
        List<FimexDocument.DocumentType> mandatoryTypes = Arrays.stream(FimexDocument.DocumentType.values())
                .filter(FimexDocument.DocumentType::isMandatory)
                .toList();

        Set<FimexDocument.DocumentType> providedTypes = inscription.getDocuments().stream()
                .map(FimexDocument::getDocumentType)
                .collect(Collectors.toSet());

        List<String> missingDocs = mandatoryTypes.stream()
                .filter(type -> !providedTypes.contains(type))
                .map(FimexDocument.DocumentType::getLabel)
                .toList();

        if (!missingDocs.isEmpty()) {
            log.warn("Missing mandatory documents for FIMEX inscription {}: {}",
                    inscription.getReference(), missingDocs);
            // Note: En production, cela devrait lever une exception
        }
    }

    private Map<String, Object> buildProcessVariables(FimexInscription inscription) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("inscriptionId", inscription.getId().toString());
        variables.put("reference", inscription.getReference());
        variables.put("niu", inscription.getNiu());
        variables.put("companyName", inscription.getCompanyName());
        variables.put("requestType", inscription.getRequestType().name());
        variables.put("totalFees", inscription.getTotalFees());
        variables.put("tenantId", inscription.getTenantId());
        return variables;
    }

    private FimexDto.Response toResponse(FimexInscription inscription) {
        FimexDto.Response response = new FimexDto.Response();
        response.setId(inscription.getId());
        response.setReference(inscription.getReference());
        response.setRequestType(inscription.getRequestType());
        response.setStatus(inscription.getStatus());
        response.setStatusLabel(getStatusLabel(inscription.getStatus()));
        response.setProcessInstanceId(inscription.getProcessInstanceId());

        response.setNiu(inscription.getNiu());
        response.setCompanyName(inscription.getCompanyName());
        response.setCniSsn(inscription.getCniSsn());
        response.setLegalForm(inscription.getLegalForm());
        response.setNationality(inscription.getNationality());
        response.setAnnualRevenue(inscription.getAnnualRevenue());
        response.setMainActivity(inscription.getMainActivity());
        response.setCommercialRegisterNumber(inscription.getCommercialRegisterNumber());
        response.setEmail(inscription.getEmail());
        response.setPhone(inscription.getPhone());
        response.setAddress(inscription.getAddress());
        response.setCity(inscription.getCity());
        response.setRegion(inscription.getRegion());

        response.setLegalRepName(inscription.getLegalRepName());
        response.setLegalRepTitle(inscription.getLegalRepTitle());
        response.setLegalRepCni(inscription.getLegalRepCni());
        response.setLegalRepPhone(inscription.getLegalRepPhone());
        response.setLegalRepEmail(inscription.getLegalRepEmail());

        response.setMainProducts(inscription.getMainProducts());
        response.setHsCodes(inscription.getHsCodes());
        response.setExportDestinations(inscription.getExportDestinations());
        response.setImportOrigins(inscription.getImportOrigins());

        response.setRegistrationFee(inscription.getRegistrationFee());
        response.setProcessingFee(inscription.getProcessingFee());
        response.setTotalFees(inscription.getTotalFees());
        response.setCnccPaymentRef(inscription.getCnccPaymentRef());
        response.setIsCnccPaid(inscription.getIsCnccPaid());
        response.setMincomPaymentRef(inscription.getMincomPaymentRef());
        response.setIsMincomPaid(inscription.getIsMincomPaid());

        response.setSubmittedAt(inscription.getSubmittedAt());
        response.setProcessedBy(inscription.getProcessedBy());
        response.setProcessedAt(inscription.getProcessedAt());
        response.setSignedBy(inscription.getSignedBy());
        response.setSignedAt(inscription.getSignedAt());
        response.setRejectionReason(inscription.getRejectionReason());

        response.setComplementRequested(inscription.getComplementRequested());
        response.setComplementRequestReason(inscription.getComplementRequestReason());
        response.setComplementRequestDate(inscription.getComplementRequestDate());

        response.setCertificateNumber(inscription.getCertificateNumber());
        response.setCertificateIssueDate(inscription.getCertificateIssueDate());
        response.setCertificateExpiryDate(inscription.getCertificateExpiryDate());
        response.setIsSgsNotified(inscription.getIsSgsNotified());

        response.setCreatedAt(inscription.getCreatedAt());
        response.setUpdatedAt(inscription.getUpdatedAt());

        if (inscription.getDocuments() != null) {
            response.setDocuments(inscription.getDocuments().stream()
                    .map(this::toDocumentResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private FimexDto.Summary toSummary(FimexInscription inscription) {
        FimexDto.Summary summary = new FimexDto.Summary();
        summary.setId(inscription.getId());
        summary.setReference(inscription.getReference());
        summary.setRequestType(inscription.getRequestType());
        summary.setStatus(inscription.getStatus());
        summary.setStatusLabel(getStatusLabel(inscription.getStatus()));
        summary.setNiu(inscription.getNiu());
        summary.setCompanyName(inscription.getCompanyName());
        summary.setLegalForm(inscription.getLegalForm());
        summary.setMainActivity(inscription.getMainActivity());
        summary.setRegion(inscription.getRegion());
        summary.setIsCnccPaid(inscription.getIsCnccPaid());
        summary.setIsMincomPaid(inscription.getIsMincomPaid());
        summary.setCertificateNumber(inscription.getCertificateNumber());
        summary.setCertificateExpiryDate(inscription.getCertificateExpiryDate());
        summary.setSubmittedAt(inscription.getSubmittedAt());
        summary.setCreatedAt(inscription.getCreatedAt());
        return summary;
    }

    private FimexDto.DocumentResponse toDocumentResponse(FimexDocument doc) {
        FimexDto.DocumentResponse response = new FimexDto.DocumentResponse();
        response.setId(doc.getId());
        response.setDocumentType(doc.getDocumentType());
        response.setDocumentName(doc.getDocumentName());
        response.setFileName(doc.getFileName());
        response.setFileSize(doc.getFileSize());
        response.setIsMandatory(doc.getIsMandatory());
        response.setIsVerified(doc.getIsVerified());
        response.setRejectionReason(doc.getRejectionReason());
        return response;
    }

    private String getStatusLabel(FimexStatus status) {
        return switch (status) {
            case DRAFT -> "Brouillon";
            case SUBMITTED -> "Soumise";
            case PENDING_CNCC_PAYMENT -> "En attente paiement CNCC";
            case CNCC_PAID -> "CNCC payé";
            case PENDING_MINCOM_PAYMENT -> "En attente paiement MINCOMMERCE";
            case ALL_PAID -> "Tous les frais payés";
            case PROCESSING -> "En traitement";
            case COMPLEMENT_REQUESTED -> "Complément demandé";
            case COMPLEMENT_PROVIDED -> "Complément fourni";
            case APPROVED -> "Approuvée";
            case SIGNED -> "Certificat signé";
            case REJECTED -> "Rejetée";
            case EXPIRED -> "Expirée";
            case CANCELLED -> "Annulée";
        };
    }
}
