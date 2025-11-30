package cm.guce.procedure.application.service;

import cm.guce.common.domain.exception.BusinessRuleException;
import cm.guce.common.domain.exception.ResourceNotFoundException;
import cm.guce.common.security.SecurityUtils;
import cm.guce.common.util.StringUtils;
import cm.guce.procedure.application.dto.ImportDeclarationDto;
import cm.guce.procedure.domain.model.*;
import cm.guce.procedure.domain.model.ImportDeclaration.*;
import cm.guce.procedure.domain.port.ImportDeclarationRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de gestion des Déclarations d'Importation (DI).
 * Implémente les règles métier GUCE Cameroun pour le routage SGS/Douane,
 * le calcul des taxes et la gestion du cycle de vie des DI.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImportDeclarationService {

    private final ImportDeclarationRepository repository;
    private final ZeebeClient zeebeClient;

    // Constantes des règles métier
    private static final BigDecimal SGS_THRESHOLD_XAF = new BigDecimal("1000000");
    private static final BigDecimal BANK_PAYMENT_THRESHOLD_XAF = new BigDecimal("2000000");
    private static final BigDecimal SGS_RATE = new BigDecimal("0.0095"); // 0.95%
    private static final BigDecimal SGS_MINIMUM_FEE = new BigDecimal("110000");
    private static final BigDecimal CUSTOMS_INSPECTION_FEE = new BigDecimal("6000");
    private static final BigDecimal FISCAL_STAMP = new BigDecimal("1500");
    private static final int VALIDITY_MONTHS = 9;
    private static final int PROROGATION_MONTHS = 3;

    // BPMN Process IDs
    private static final String BPMN_DI_CLASSIQUE = "import-declaration-classique";
    private static final String BPMN_DI_GROUPAGE = "import-declaration-groupage";
    private static final String BPMN_DI_MEDICAMENTS = "import-declaration-medicaments";
    private static final String BPMN_DI_TRANSIT = "import-declaration-transit";

    // ========================================
    // LECTURE
    // ========================================

    /**
     * Récupère une DI par son ID.
     */
    public ImportDeclarationDto.Response findById(UUID id) {
        log.debug("Fetching import declaration by id: {}", id);
        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));
        return toResponse(declaration);
    }

    /**
     * Récupère une DI par sa référence.
     */
    public ImportDeclarationDto.Response findByReference(String reference) {
        log.debug("Fetching import declaration by reference: {}", reference);
        ImportDeclaration declaration = repository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", reference));
        return toResponse(declaration);
    }

    /**
     * Récupère les DI d'un importateur.
     */
    public Page<ImportDeclarationDto.Summary> findByImporter(String importerNiu, Pageable pageable) {
        log.debug("Fetching import declarations for importer: {}", importerNiu);
        return repository.findByImporterNiu(importerNiu, pageable)
                .map(this::toSummary);
    }

    /**
     * Récupère les DI par statut.
     */
    public Page<ImportDeclarationDto.Summary> findByStatus(ImportDeclarationStatus status, Pageable pageable) {
        log.debug("Fetching import declarations with status: {}", status);
        return repository.findByStatus(status, pageable)
                .map(this::toSummary);
    }

    /**
     * Récupère les DI routées vers SGS.
     */
    public Page<ImportDeclarationDto.Summary> findSgsDeclarations(Pageable pageable) {
        log.debug("Fetching SGS import declarations");
        return repository.findByRoutingDestination(RoutingDestination.SGS, pageable)
                .map(this::toSummary);
    }

    /**
     * Récupère les DI routées vers la Douane.
     */
    public Page<ImportDeclarationDto.Summary> findCustomsDeclarations(Pageable pageable) {
        log.debug("Fetching Customs import declarations");
        return repository.findByRoutingDestination(RoutingDestination.CUSTOMS, pageable)
                .map(this::toSummary);
    }

    /**
     * Recherche de DI.
     */
    public Page<ImportDeclarationDto.Summary> search(String query, Pageable pageable) {
        log.debug("Searching import declarations with query: {}", query);
        return repository.search(query, pageable)
                .map(this::toSummary);
    }

    // ========================================
    // CRÉATION
    // ========================================

    /**
     * Crée une nouvelle Déclaration d'Importation (brouillon).
     */
    @Transactional
    public ImportDeclarationDto.Response create(ImportDeclarationDto.CreateRequest request) {
        log.info("Creating import declaration for importer: {}", request.getImporterNiu());

        ImportDeclaration declaration = new ImportDeclaration();

        // Générer la référence
        declaration.setReference(generateReference(request.getImportType()));
        declaration.setStatus(ImportDeclarationStatus.DRAFT);
        declaration.setImportType(request.getImportType());
        declaration.setTenantId(SecurityUtils.getCurrentTenantId().orElse("default"));

        // Importateur
        declaration.setImporterNiu(request.getImporterNiu());
        declaration.setImporterName(request.getImporterName());
        declaration.setImporterAddress(request.getImporterAddress());
        declaration.setImporterPhone(request.getImporterPhone());
        declaration.setImporterEmail(request.getImporterEmail());
        declaration.setImporterCountry("CM");
        declaration.setImporterContactPerson(request.getImporterContactPerson());

        // CAD
        declaration.setCadId(request.getCadId());
        declaration.setCadNiu(request.getCadNiu());
        declaration.setCadName(request.getCadName());
        declaration.setCadAgreementNumber(request.getCadAgreementNumber());

        // Fournisseur
        declaration.setSupplierName(request.getSupplierName());
        declaration.setSupplierReference(request.getSupplierReference());
        declaration.setSupplierAddress(request.getSupplierAddress());
        declaration.setSupplierPostalBox(request.getSupplierPostalBox());
        declaration.setSupplierCountry(request.getSupplierCountry());
        declaration.setSupplierCity(request.getSupplierCity());
        declaration.setSupplierPhone(request.getSupplierPhone());
        declaration.setSupplierEmail(request.getSupplierEmail());

        // Informations générales
        declaration.setOriginCountry(request.getOriginCountry());
        declaration.setProvenanceCountry(request.getProvenanceCountry());
        declaration.setDestinationCountry("CM");
        declaration.setUnloadingPlace(request.getUnloadingPlace());
        declaration.setTransportMode(request.getTransportMode());

        // Facture proforma
        declaration.setProformaNumber(request.getProformaNumber());
        declaration.setProformaDate(request.getProformaDate());
        declaration.setCurrency(request.getCurrency());
        declaration.setIncoterm(request.getIncoterm());

        // Valeurs
        declaration.setFobCharges(request.getFobCharges());
        declaration.setFreightAmount(request.getFreightAmount());
        declaration.setInsuranceAmount(request.getInsuranceAmount());
        declaration.setExchangeRate(request.getExchangeRate());
        declaration.setIsPviExempt(request.getIsPviExempt());

        // Extension médicaments
        declaration.setIsMedication(request.getIsMedication());
        if (Boolean.TRUE.equals(request.getIsMedication())) {
            declaration.setCustomsOfficeCode(request.getCustomsOfficeCode());
            declaration.setAoiNumber(request.getAoiNumber());
            declaration.setMinsanteAgreementDate(request.getMinsanteAgreementDate());
            declaration.setMinsanteAgreementNumber(request.getMinsanteAgreementNumber());
            declaration.setPharmacistName(request.getPharmacistName());
            declaration.setPharmacistPhone(request.getPharmacistPhone());
        }

        declaration.setObservation(request.getObservation());

        // Ajouter les marchandises
        if (request.getItems() != null) {
            int itemNumber = 1;
            for (ImportDeclarationDto.ItemRequest itemRequest : request.getItems()) {
                ImportDeclarationItem item = createItem(itemRequest, itemNumber++);
                declaration.addItem(item);
            }
        }

        // Recalculer les totaux et déterminer le routage préliminaire
        declaration.recalculateTotals();
        declaration.setRoutingDestination(declaration.determineRouting());
        declaration.setInspectionFee(declaration.calculateInspectionFee());
        declaration.setTotalFees(declaration.calculateTotalFees());
        declaration.setPaymentChannel(declaration.determinePaymentChannel());

        declaration = repository.save(declaration);
        log.info("Import declaration created with reference: {}", declaration.getReference());

        return toResponse(declaration);
    }

    // ========================================
    // MISE À JOUR
    // ========================================

    /**
     * Met à jour une DI (brouillon uniquement).
     */
    @Transactional
    public ImportDeclarationDto.Response update(UUID id, ImportDeclarationDto.UpdateRequest request) {
        log.info("Updating import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        if (declaration.getStatus() != ImportDeclarationStatus.DRAFT) {
            throw new BusinessRuleException("Seuls les brouillons peuvent être modifiés");
        }

        // Mise à jour des champs modifiables
        if (request.getImporterAddress() != null) declaration.setImporterAddress(request.getImporterAddress());
        if (request.getImporterPhone() != null) declaration.setImporterPhone(request.getImporterPhone());
        if (request.getImporterEmail() != null) declaration.setImporterEmail(request.getImporterEmail());
        if (request.getImporterContactPerson() != null) declaration.setImporterContactPerson(request.getImporterContactPerson());

        if (request.getSupplierReference() != null) declaration.setSupplierReference(request.getSupplierReference());
        if (request.getSupplierAddress() != null) declaration.setSupplierAddress(request.getSupplierAddress());
        if (request.getSupplierPostalBox() != null) declaration.setSupplierPostalBox(request.getSupplierPostalBox());
        if (request.getSupplierPhone() != null) declaration.setSupplierPhone(request.getSupplierPhone());
        if (request.getSupplierEmail() != null) declaration.setSupplierEmail(request.getSupplierEmail());

        if (request.getFobCharges() != null) declaration.setFobCharges(request.getFobCharges());
        if (request.getFreightAmount() != null) declaration.setFreightAmount(request.getFreightAmount());
        if (request.getInsuranceAmount() != null) declaration.setInsuranceAmount(request.getInsuranceAmount());
        if (request.getExchangeRate() != null) declaration.setExchangeRate(request.getExchangeRate());
        if (request.getIsPviExempt() != null) declaration.setIsPviExempt(request.getIsPviExempt());
        if (request.getObservation() != null) declaration.setObservation(request.getObservation());

        // Mise à jour des marchandises
        if (request.getItems() != null) {
            declaration.getItems().clear();
            int itemNumber = 1;
            for (ImportDeclarationDto.ItemRequest itemRequest : request.getItems()) {
                ImportDeclarationItem item = createItem(itemRequest, itemNumber++);
                declaration.addItem(item);
            }
        }

        // Recalculer les totaux
        declaration.recalculateTotals();
        declaration.setRoutingDestination(declaration.determineRouting());
        declaration.setInspectionFee(declaration.calculateInspectionFee());
        declaration.setTotalFees(declaration.calculateTotalFees());
        declaration.setPaymentChannel(declaration.determinePaymentChannel());

        declaration = repository.save(declaration);
        log.info("Import declaration updated: {}", declaration.getReference());

        return toResponse(declaration);
    }

    // ========================================
    // SOUMISSION
    // ========================================

    /**
     * Soumet une DI pour traitement.
     */
    @Transactional
    public ImportDeclarationDto.Response submit(UUID id) {
        log.info("Submitting import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        if (declaration.getStatus() != ImportDeclarationStatus.DRAFT) {
            throw new BusinessRuleException("Seuls les brouillons peuvent être soumis");
        }

        // Validation des pièces obligatoires
        validateMandatoryDocuments(declaration);

        // Soumettre la déclaration
        declaration.submit();

        // Démarrer le processus Camunda approprié
        String bpmnProcessId = getBpmnProcessId(declaration.getImportType());
        Map<String, Object> variables = buildProcessVariables(declaration);

        try {
            ProcessInstanceEvent processInstance = zeebeClient.newCreateInstanceCommand()
                    .bpmnProcessId(bpmnProcessId)
                    .latestVersion()
                    .variables(variables)
                    .send()
                    .join();

            declaration.setProcessInstanceId(String.valueOf(processInstance.getProcessInstanceKey()));
        } catch (Exception e) {
            log.warn("Could not start workflow process, continuing without it: {}", e.getMessage());
        }

        declaration = repository.save(declaration);
        log.info("Import declaration submitted: {} - Routing: {}",
                declaration.getReference(), declaration.getRoutingDestination());

        return toResponse(declaration);
    }

    // ========================================
    // PAIEMENT
    // ========================================

    /**
     * Enregistre le paiement d'une DI.
     */
    @Transactional
    public ImportDeclarationDto.Response recordPayment(UUID id, String paymentReference) {
        log.info("Recording payment for import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        if (declaration.getStatus() != ImportDeclarationStatus.SUBMITTED &&
            declaration.getStatus() != ImportDeclarationStatus.PENDING_PAYMENT) {
            throw new BusinessRuleException("Cette DI ne peut pas recevoir de paiement dans son état actuel");
        }

        declaration.markAsPaid(paymentReference);
        declaration = repository.save(declaration);

        log.info("Payment recorded for import declaration: {}", declaration.getReference());
        return toResponse(declaration);
    }

    // ========================================
    // VALIDATION
    // ========================================

    /**
     * Valide une DI (par SGS ou Douane).
     */
    @Transactional
    public ImportDeclarationDto.Response validate(UUID id) {
        log.info("Validating import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        String currentUser = SecurityUtils.getCurrentUserId().orElse("system");

        // Vérifier si médicament et visa technique requis
        if (Boolean.TRUE.equals(declaration.getIsMedication()) &&
            declaration.getVisaTechniqueNumber() == null) {
            throw new BusinessRuleException("Le visa technique MINSANTE est requis pour les médicaments");
        }

        declaration.validate(currentUser);
        declaration = repository.save(declaration);

        log.info("Import declaration validated: {}", declaration.getReference());
        return toResponse(declaration);
    }

    /**
     * Rejette une DI.
     */
    @Transactional
    public ImportDeclarationDto.Response reject(UUID id, String reason) {
        log.info("Rejecting import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        String currentUser = SecurityUtils.getCurrentUserId().orElse("system");
        declaration.reject(currentUser, reason);
        declaration = repository.save(declaration);

        log.info("Import declaration rejected: {}", declaration.getReference());
        return toResponse(declaration);
    }

    // ========================================
    // VISA TECHNIQUE (MÉDICAMENTS)
    // ========================================

    /**
     * Enregistre le visa technique MINSANTE pour une DI de médicaments.
     */
    @Transactional
    public ImportDeclarationDto.Response signVisaTechnique(UUID id, ImportDeclarationDto.VisaTechniqueRequest request) {
        log.info("Signing visa technique for import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        if (!Boolean.TRUE.equals(declaration.getIsMedication())) {
            throw new BusinessRuleException("Cette DI n'est pas une importation de médicaments");
        }

        if (declaration.getStatus() != ImportDeclarationStatus.PENDING_VISA_TECHNIQUE) {
            throw new BusinessRuleException("Cette DI n'est pas en attente de visa technique");
        }

        declaration.setVisaTechniqueNumber(request.getVisaTechniqueNumber());
        declaration.setVisaTechniqueDate(request.getVisaTechniqueDate());
        declaration.setStatus(ImportDeclarationStatus.VISA_TECHNIQUE_SIGNED);

        declaration = repository.save(declaration);
        log.info("Visa technique signed for import declaration: {}", declaration.getReference());

        return toResponse(declaration);
    }

    // ========================================
    // PROROGATION
    // ========================================

    /**
     * Proroge une DI expirée (+3 mois).
     */
    @Transactional
    public ImportDeclarationDto.Response prorogateDI(UUID id, ImportDeclarationDto.ProrogationRequest request) {
        log.info("Prorogating import declaration: {}", id);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        if (!declaration.canBeProrogated()) {
            throw new BusinessRuleException("Cette DI ne peut pas être prorogée. " +
                    "Condition: DI expirée et non encore prorogée.");
        }

        declaration.prorogateDI();
        declaration = repository.save(declaration);

        log.info("Import declaration prorogated: {} - New validity: {}",
                declaration.getReference(), declaration.getProrogationEndDate());
        return toResponse(declaration);
    }

    // ========================================
    // AMENDEMENT (MODIFICATION)
    // ========================================

    /**
     * Crée un amendement d'une DI validée.
     * Règle: La valeur FOB ne peut pas diminuer.
     */
    @Transactional
    public ImportDeclarationDto.Response createAmendment(UUID id, ImportDeclarationDto.AmendmentRequest request) {
        log.info("Creating amendment for import declaration: {}", id);

        ImportDeclaration original = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        if (original.getStatus() != ImportDeclarationStatus.VALIDATED) {
            throw new BusinessRuleException("Seules les DI validées peuvent être modifiées");
        }

        // Calculer la nouvelle valeur FOB
        BigDecimal newTotalFobValue = calculateNewFobValue(original, request);

        // Règle RM02: Interdiction de diminuer la valeur FOB
        if (newTotalFobValue.compareTo(original.getTotalFobValue()) < 0) {
            throw new BusinessRuleException("La valeur FOB ne peut pas être diminuée lors d'un amendement");
        }

        // Créer l'amendement (même référence, incrémenter le compteur)
        original.setIsAmendment(true);
        original.setAmendmentCount(original.getAmendmentCount() + 1);
        original.setAmendmentReason(request.getAmendmentReason());

        // Mettre à jour les valeurs si augmentation
        if (request.getAdditionalFobCharges() != null) {
            original.setFobCharges(original.getFobCharges().add(request.getAdditionalFobCharges()));
        }
        if (request.getAdditionalFreightAmount() != null) {
            original.setFreightAmount(original.getFreightAmount().add(request.getAdditionalFreightAmount()));
        }
        if (request.getAdditionalInsuranceAmount() != null) {
            original.setInsuranceAmount(original.getInsuranceAmount().add(request.getAdditionalInsuranceAmount()));
        }

        // Mettre à jour les marchandises si fournies
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            original.getItems().clear();
            int itemNumber = 1;
            for (ImportDeclarationDto.ItemRequest itemRequest : request.getItems()) {
                ImportDeclarationItem item = createItem(itemRequest, itemNumber++);
                original.addItem(item);
            }
        }

        // Recalculer les totaux
        original.recalculateTotals();

        // Vérifier à nouveau que la valeur n'a pas diminué
        if (original.getTotalFobValue().compareTo(newTotalFobValue) < 0) {
            throw new BusinessRuleException("La valeur FOB résultante ne peut pas être inférieure à l'original");
        }

        original = repository.save(original);
        log.info("Amendment created for import declaration: {} - Amendment #{}",
                original.getReference(), original.getAmendmentCount());

        return toResponse(original);
    }

    // ========================================
    // COTATION (Attribution à un CAD)
    // ========================================

    /**
     * Cote un dossier à un CAD (max 1 CAD par dossier).
     */
    @Transactional
    public ImportDeclarationDto.Response assignToCad(UUID id, UUID cadId, String cadNiu, String cadName) {
        log.info("Assigning import declaration {} to CAD: {}", id, cadNiu);

        ImportDeclaration declaration = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Déclaration d'importation", id));

        // Règle RM04: Un dossier NE peut PAS être coté à deux CAD simultanément
        if (declaration.getCadId() != null && !declaration.getCadId().equals(cadId)) {
            throw new BusinessRuleException("Ce dossier est déjà coté à un autre CAD");
        }

        declaration.setCadId(cadId);
        declaration.setCadNiu(cadNiu);
        declaration.setCadName(cadName);

        declaration = repository.save(declaration);
        log.info("Import declaration assigned to CAD: {} -> {}", declaration.getReference(), cadNiu);

        return toResponse(declaration);
    }

    // ========================================
    // CALCULS ET SIMULATIONS
    // ========================================

    /**
     * Simule le routage et les frais sans créer de DI.
     */
    public ImportDeclarationDto.RoutingResult simulateRouting(BigDecimal totalFobValueXaf,
            boolean hasUsedVehicles, boolean hasPoultry, boolean hasEggs, boolean isPviExempt) {

        ImportDeclarationDto.RoutingResult result = new ImportDeclarationDto.RoutingResult();

        // Déterminer le routage
        RoutingDestination destination;
        String routingReason;
        boolean hasSpecialMerchandise = hasUsedVehicles || hasPoultry || hasEggs;

        if (hasSpecialMerchandise) {
            destination = RoutingDestination.CUSTOMS;
            routingReason = "Marchandise spéciale (véhicules d'occasion, poussins ou œufs)";
        } else if (totalFobValueXaf.compareTo(SGS_THRESHOLD_XAF) > 0) {
            destination = RoutingDestination.SGS;
            routingReason = "Valeur FOB > 1 000 000 FCFA";
        } else {
            destination = RoutingDestination.CUSTOMS;
            routingReason = "Valeur FOB <= 1 000 000 FCFA";
        }

        result.setDestination(destination);
        result.setDestinationLabel(destination == RoutingDestination.SGS ? "SGS" : "Douane");
        result.setRoutingReason(routingReason);
        result.setHasSpecialMerchandise(hasSpecialMerchandise);

        // Calculer les frais
        BigDecimal inspectionFee;
        if (isPviExempt) {
            inspectionFee = BigDecimal.ZERO;
        } else if (destination == RoutingDestination.SGS) {
            BigDecimal calculated = totalFobValueXaf.multiply(SGS_RATE).setScale(0, RoundingMode.HALF_UP);
            inspectionFee = calculated.max(SGS_MINIMUM_FEE);
        } else {
            inspectionFee = CUSTOMS_INSPECTION_FEE;
        }

        result.setInspectionFee(inspectionFee);
        result.setFiscalStamp(FISCAL_STAMP);
        result.setTotalFees(inspectionFee.add(FISCAL_STAMP));

        // Déterminer le canal de paiement
        PaymentChannel paymentChannel = totalFobValueXaf.compareTo(BANK_PAYMENT_THRESHOLD_XAF) >= 0
                ? PaymentChannel.BANK_PAYONLINE : PaymentChannel.CAMPOST;
        result.setPaymentChannel(paymentChannel);
        result.setPaymentChannelLabel(paymentChannel == PaymentChannel.BANK_PAYONLINE
                ? "Banque (PayOnline)" : "Campost / CNCC");

        return result;
    }

    /**
     * Calcule les frais détaillés.
     */
    public ImportDeclarationDto.FeeCalculation calculateFees(BigDecimal totalFobValueXaf,
            RoutingDestination destination, boolean isPviExempt) {

        ImportDeclarationDto.FeeCalculation calc = new ImportDeclarationDto.FeeCalculation();
        calc.setTotalFobValueXaf(totalFobValueXaf);

        if (isPviExempt) {
            calc.setInspectionFeeApplied(BigDecimal.ZERO);
            calc.setCalculationDetails("Exempté du Programme de Vérification des Importations (PVI)");
        } else if (destination == RoutingDestination.SGS) {
            calc.setInspectionFeeRate(SGS_RATE);
            BigDecimal calculated = totalFobValueXaf.multiply(SGS_RATE).setScale(0, RoundingMode.HALF_UP);
            calc.setInspectionFeeCalculated(calculated);
            calc.setInspectionFeeMinimum(SGS_MINIMUM_FEE);
            calc.setInspectionFeeApplied(calculated.max(SGS_MINIMUM_FEE));
            calc.setCalculationDetails(String.format(
                    "SGS: MAX(0.95%% × %s FCFA, 110 000 FCFA) = %s FCFA",
                    totalFobValueXaf.toPlainString(),
                    calc.getInspectionFeeApplied().toPlainString()));
        } else {
            calc.setInspectionFeeApplied(CUSTOMS_INSPECTION_FEE);
            calc.setCalculationDetails("Douane: Taxe fixe de 6 000 FCFA");
        }

        calc.setFiscalStamp(FISCAL_STAMP);
        calc.setTotalFees(calc.getInspectionFeeApplied().add(FISCAL_STAMP));

        return calc;
    }

    // ========================================
    // STATISTIQUES
    // ========================================

    /**
     * Génère les statistiques des DI.
     */
    public ImportDeclarationDto.Statistics getStatistics() {
        String tenantId = SecurityUtils.getCurrentTenantId().orElse("default");
        ImportDeclarationDto.Statistics stats = new ImportDeclarationDto.Statistics();

        // Par routage
        stats.setTotalSgsDeclarations(repository.countByRoutingDestinationAndTenant(
                RoutingDestination.SGS, tenantId));
        stats.setTotalCustomsDeclarations(repository.countByRoutingDestinationAndTenant(
                RoutingDestination.CUSTOMS, tenantId));

        // Par statut
        stats.setTotalDraft(repository.countByStatusAndTenant(ImportDeclarationStatus.DRAFT, tenantId));
        stats.setTotalSubmitted(repository.countByStatusAndTenant(ImportDeclarationStatus.SUBMITTED, tenantId));
        stats.setTotalPendingPayment(repository.countByStatusAndTenant(ImportDeclarationStatus.PENDING_PAYMENT, tenantId));
        stats.setTotalValidated(repository.countByStatusAndTenant(ImportDeclarationStatus.VALIDATED, tenantId));
        stats.setTotalRejected(repository.countByStatusAndTenant(ImportDeclarationStatus.REJECTED, tenantId));
        stats.setTotalExpired(repository.countByStatusAndTenant(ImportDeclarationStatus.EXPIRED, tenantId));

        // Par mode de transport
        stats.setTotalMaritime(repository.countByTransportModeAndTenant(TransportMode.MARITIME, tenantId));
        stats.setTotalAerien(repository.countByTransportModeAndTenant(TransportMode.AERIEN, tenantId));
        stats.setTotalRoutier(repository.countByTransportModeAndTenant(TransportMode.ROUTIER, tenantId));
        stats.setTotalFerroviaire(repository.countByTransportModeAndTenant(TransportMode.FERROVIAIRE, tenantId));
        stats.setTotalMultimodal(repository.countByTransportModeAndTenant(TransportMode.MULTIMODAL, tenantId));

        // Par type d'importation
        stats.setTotalClassique(repository.countByImportTypeAndTenant(ImportType.CLASSIQUE, tenantId));
        stats.setTotalGroupage(repository.countByImportTypeAndTenant(ImportType.GROUPAGE, tenantId));
        stats.setTotalMedicaments(repository.countByImportTypeAndTenant(ImportType.MEDICAMENTS, tenantId));
        stats.setTotalTransit(repository.countByImportTypeAndTenant(ImportType.TRANSIT, tenantId));

        return stats;
    }

    // ========================================
    // MÉTHODES PRIVÉES
    // ========================================

    private String generateReference(ImportType importType) {
        String prefix = switch (importType) {
            case CLASSIQUE -> "DI";
            case GROUPAGE -> "DIG";
            case MEDICAMENTS -> "DIM";
            case TRANSIT -> "DIT";
        };
        return StringUtils.generateReference(prefix);
    }

    private String getBpmnProcessId(ImportType importType) {
        return switch (importType) {
            case CLASSIQUE -> BPMN_DI_CLASSIQUE;
            case GROUPAGE -> BPMN_DI_GROUPAGE;
            case MEDICAMENTS -> BPMN_DI_MEDICAMENTS;
            case TRANSIT -> BPMN_DI_TRANSIT;
        };
    }

    private ImportDeclarationItem createItem(ImportDeclarationDto.ItemRequest request, int itemNumber) {
        ImportDeclarationItem item = new ImportDeclarationItem();
        item.setItemNumber(itemNumber);
        item.setHsCode(request.getHsCode());
        item.setHsCodeDescription(request.getHsCodeDescription());
        item.setDesignation(request.getDesignation());
        item.setDescription(request.getDescription());
        item.setQuantity(request.getQuantity());
        item.setUnitOfMeasure(request.getUnitOfMeasure());
        item.setNetWeight(request.getNetWeight());
        item.setGrossWeight(request.getGrossWeight());
        item.setUnitFobValue(request.getUnitFobValue());
        item.setBrand(request.getBrand());
        item.setModel(request.getModel());
        item.setSerialNumber(request.getSerialNumber());
        item.setManufacturingYear(request.getManufacturingYear());

        // Véhicules d'occasion
        item.setIsUsedVehicle(request.getIsUsedVehicle());
        item.setVehicleRegistration(request.getVehicleRegistration());
        item.setVehicleChassisNumber(request.getVehicleChassisNumber());
        item.setVehicleEngineNumber(request.getVehicleEngineNumber());
        item.setVehicleFirstRegistrationDate(request.getVehicleFirstRegistrationDate());
        item.setVehicleMileage(request.getVehicleMileage());

        // Aviculture
        item.setIsPoultryChicks(request.getIsPoultryChicks());
        item.setIsEggs(request.getIsEggs());
        item.setPoultryQuantity(request.getPoultryQuantity());
        item.setSanitaryCertificate(request.getSanitaryCertificate());

        // Médicaments
        item.setIsMedication(request.getIsMedication());
        item.setMedicationAmmNumber(request.getMedicationAmmNumber());
        item.setMedicationDci(request.getMedicationDci());
        item.setMedicationDosage(request.getMedicationDosage());
        item.setMedicationForm(request.getMedicationForm());
        item.setMedicationExpiryDate(request.getMedicationExpiryDate());
        item.setMedicationBatchNumber(request.getMedicationBatchNumber());

        // Calculer la valeur FOB
        item.calculateFobValue();

        return item;
    }

    private void validateMandatoryDocuments(ImportDeclaration declaration) {
        // Vérifier la présence des documents obligatoires
        boolean hasProforma = declaration.getDocuments().stream()
                .anyMatch(d -> d.getDocumentType() == ImportDeclarationDocument.DocumentType.FACTURE_PROFORMA);

        if (!hasProforma) {
            log.warn("Missing mandatory document: Facture proforma for declaration {}", declaration.getReference());
            // Note: En production, cela devrait lever une exception
        }

        // Pour les médicaments, vérifier AMM ou dérogation
        if (Boolean.TRUE.equals(declaration.getIsMedication())) {
            boolean hasAmm = declaration.getDocuments().stream()
                    .anyMatch(d -> d.getDocumentType() == ImportDeclarationDocument.DocumentType.AMM ||
                                   d.getDocumentType() == ImportDeclarationDocument.DocumentType.DEROGATION_MINSANTE);
            if (!hasAmm) {
                log.warn("Missing AMM or derogation for medication import: {}", declaration.getReference());
            }
        }
    }

    private Map<String, Object> buildProcessVariables(ImportDeclaration declaration) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("declarationId", declaration.getId().toString());
        variables.put("declarationReference", declaration.getReference());
        variables.put("importerNiu", declaration.getImporterNiu());
        variables.put("importerName", declaration.getImporterName());
        variables.put("importType", declaration.getImportType().name());
        variables.put("routingDestination", declaration.getRoutingDestination().name());
        variables.put("totalFobValueXaf", declaration.getTotalFobValueXaf());
        variables.put("totalFees", declaration.getTotalFees());
        variables.put("isMedication", declaration.getIsMedication());
        variables.put("tenantId", declaration.getTenantId());
        return variables;
    }

    private BigDecimal calculateNewFobValue(ImportDeclaration original, ImportDeclarationDto.AmendmentRequest request) {
        BigDecimal newFobValue = original.getTotalFobValue();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            newFobValue = request.getItems().stream()
                    .map(item -> item.getUnitFobValue().multiply(item.getQuantity()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return newFobValue;
    }

    private ImportDeclarationDto.Response toResponse(ImportDeclaration declaration) {
        ImportDeclarationDto.Response response = new ImportDeclarationDto.Response();
        response.setId(declaration.getId());
        response.setReference(declaration.getReference());
        response.setStatus(declaration.getStatus());
        response.setStatusLabel(getStatusLabel(declaration.getStatus()));
        response.setImportType(declaration.getImportType());
        response.setRoutingDestination(declaration.getRoutingDestination());
        response.setProcessInstanceId(declaration.getProcessInstanceId());

        response.setImporterNiu(declaration.getImporterNiu());
        response.setImporterName(declaration.getImporterName());
        response.setImporterAddress(declaration.getImporterAddress());
        response.setImporterPhone(declaration.getImporterPhone());
        response.setImporterEmail(declaration.getImporterEmail());

        response.setCadId(declaration.getCadId());
        response.setCadNiu(declaration.getCadNiu());
        response.setCadName(declaration.getCadName());

        response.setSupplierName(declaration.getSupplierName());
        response.setSupplierCountry(declaration.getSupplierCountry());
        response.setSupplierCity(declaration.getSupplierCity());

        response.setOriginCountry(declaration.getOriginCountry());
        response.setProvenanceCountry(declaration.getProvenanceCountry());
        response.setDestinationCountry(declaration.getDestinationCountry());
        response.setUnloadingPlace(declaration.getUnloadingPlace());
        response.setTransportMode(declaration.getTransportMode());

        response.setProformaNumber(declaration.getProformaNumber());
        response.setProformaDate(declaration.getProformaDate());
        response.setCurrency(declaration.getCurrency());
        response.setIncoterm(declaration.getIncoterm());

        response.setTotalFobValue(declaration.getTotalFobValue());
        response.setFobCharges(declaration.getFobCharges());
        response.setFreightAmount(declaration.getFreightAmount());
        response.setInsuranceAmount(declaration.getInsuranceAmount());
        response.setTotalAmountCurrency(declaration.getTotalAmountCurrency());
        response.setExchangeRate(declaration.getExchangeRate());
        response.setTotalFobValueXaf(declaration.getTotalFobValueXaf());
        response.setTotalAmountXaf(declaration.getTotalAmountXaf());

        response.setInspectionFee(declaration.getInspectionFee());
        response.setFiscalStamp(declaration.getFiscalStamp());
        response.setTotalFees(declaration.getTotalFees());
        response.setIsPviExempt(declaration.getIsPviExempt());

        response.setPaymentChannel(declaration.getPaymentChannel());
        response.setPaymentReference(declaration.getPaymentReference());
        response.setPaymentDate(declaration.getPaymentDate());
        response.setIsPaid(declaration.getIsPaid());

        response.setValidityStartDate(declaration.getValidityStartDate());
        response.setValidityEndDate(declaration.getValidityEndDate());
        response.setIsProrogated(declaration.getIsProrogated());
        response.setProrogationEndDate(declaration.getProrogationEndDate());

        response.setIsAmendment(declaration.getIsAmendment());
        response.setOriginalReference(declaration.getOriginalReference());
        response.setAmendmentCount(declaration.getAmendmentCount());

        response.setIsMedication(declaration.getIsMedication());
        response.setVisaTechniqueNumber(declaration.getVisaTechniqueNumber());
        response.setVisaTechniqueDate(declaration.getVisaTechniqueDate());

        response.setSubmittedAt(declaration.getSubmittedAt());
        response.setValidatedAt(declaration.getValidatedAt());
        response.setValidatedBy(declaration.getValidatedBy());

        response.setCreatedAt(declaration.getCreatedAt());
        response.setUpdatedAt(declaration.getUpdatedAt());

        // Items
        if (declaration.getItems() != null) {
            response.setItems(declaration.getItems().stream()
                    .map(this::toItemResponse)
                    .collect(Collectors.toList()));
        }

        // Documents
        if (declaration.getDocuments() != null) {
            response.setDocuments(declaration.getDocuments().stream()
                    .map(this::toDocumentResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private ImportDeclarationDto.Summary toSummary(ImportDeclaration declaration) {
        ImportDeclarationDto.Summary summary = new ImportDeclarationDto.Summary();
        summary.setId(declaration.getId());
        summary.setReference(declaration.getReference());
        summary.setStatus(declaration.getStatus());
        summary.setStatusLabel(getStatusLabel(declaration.getStatus()));
        summary.setImportType(declaration.getImportType());
        summary.setRoutingDestination(declaration.getRoutingDestination());
        summary.setImporterName(declaration.getImporterName());
        summary.setImporterNiu(declaration.getImporterNiu());
        summary.setSupplierCountry(declaration.getSupplierCountry());
        summary.setTransportMode(declaration.getTransportMode());
        summary.setTotalFobValueXaf(declaration.getTotalFobValueXaf());
        summary.setTotalFees(declaration.getTotalFees());
        summary.setIsPaid(declaration.getIsPaid());
        summary.setValidityEndDate(declaration.getValidityEndDate());
        summary.setSubmittedAt(declaration.getSubmittedAt());
        summary.setCreatedAt(declaration.getCreatedAt());
        return summary;
    }

    private ImportDeclarationDto.ItemResponse toItemResponse(ImportDeclarationItem item) {
        ImportDeclarationDto.ItemResponse response = new ImportDeclarationDto.ItemResponse();
        response.setId(item.getId());
        response.setItemNumber(item.getItemNumber());
        response.setHsCode(item.getHsCode());
        response.setHsCodeDescription(item.getHsCodeDescription());
        response.setDesignation(item.getDesignation());
        response.setDescription(item.getDescription());
        response.setQuantity(item.getQuantity());
        response.setUnitOfMeasure(item.getUnitOfMeasure());
        response.setNetWeight(item.getNetWeight());
        response.setUnitFobValue(item.getUnitFobValue());
        response.setFobValue(item.getFobValue());
        response.setIsUsedVehicle(item.getIsUsedVehicle());
        response.setIsPoultryChicks(item.getIsPoultryChicks());
        response.setIsEggs(item.getIsEggs());
        response.setIsMedication(item.getIsMedication());
        return response;
    }

    private ImportDeclarationDto.DocumentResponse toDocumentResponse(ImportDeclarationDocument doc) {
        ImportDeclarationDto.DocumentResponse response = new ImportDeclarationDto.DocumentResponse();
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

    private String getStatusLabel(ImportDeclarationStatus status) {
        return switch (status) {
            case DRAFT -> "Brouillon";
            case SUBMITTED -> "Soumise";
            case PENDING_PAYMENT -> "En attente de paiement";
            case PAID -> "Payée";
            case PROCESSING_SGS -> "En traitement SGS";
            case PROCESSING_CUSTOMS -> "En traitement Douane";
            case PENDING_VISA_TECHNIQUE -> "En attente visa technique";
            case VISA_TECHNIQUE_SIGNED -> "Visa technique signé";
            case VALIDATED -> "Validée";
            case EXPIRED -> "Expirée";
            case PROROGATED -> "Prorogée";
            case REJECTED -> "Rejetée";
            case CANCELLED -> "Annulée";
        };
    }
}
