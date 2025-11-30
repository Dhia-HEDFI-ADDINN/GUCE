package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entité Déclaration d'Importation (DI) - Conforme aux spécifications GUCE Cameroun.
 *
 * Gère les déclarations d'importation avec routage automatique vers SGS ou Douane
 * selon les règles métier définies dans les spécifications fonctionnelles.
 */
@Entity
@Table(name = "import_declaration", indexes = {
        @Index(name = "idx_import_decl_reference", columnList = "reference"),
        @Index(name = "idx_import_decl_importer", columnList = "importer_niu"),
        @Index(name = "idx_import_decl_status", columnList = "status"),
        @Index(name = "idx_import_decl_routing", columnList = "routing_destination"),
        @Index(name = "idx_import_decl_type", columnList = "import_type")
})
@Getter
@Setter
@NoArgsConstructor
public class ImportDeclaration extends BaseEntity {

    // ========================================
    // RÉFÉRENCE ET STATUT
    // ========================================

    @Column(name = "reference", nullable = false, unique = true, length = 30)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ImportDeclarationStatus status = ImportDeclarationStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "import_type", nullable = false)
    private ImportType importType = ImportType.CLASSIQUE;

    @Enumerated(EnumType.STRING)
    @Column(name = "routing_destination")
    private RoutingDestination routingDestination;

    @Column(name = "process_instance_id")
    private String processInstanceId;

    // ========================================
    // INFORMATIONS IMPORTATEUR
    // ========================================

    @Column(name = "importer_niu", nullable = false, length = 30)
    private String importerNiu;

    @Column(name = "importer_name", nullable = false, length = 100)
    private String importerName;

    @Column(name = "importer_address", length = 200)
    private String importerAddress;

    @Column(name = "importer_phone", length = 30)
    private String importerPhone;

    @Column(name = "importer_email", length = 100)
    private String importerEmail;

    @Column(name = "importer_country", length = 3)
    private String importerCountry;

    @Column(name = "importer_contact_person", length = 100)
    private String importerContactPerson;

    // ========================================
    // INFORMATIONS CAD (Commissionnaire Agréé en Douane)
    // ========================================

    @Column(name = "cad_id")
    private UUID cadId;

    @Column(name = "cad_niu", length = 30)
    private String cadNiu;

    @Column(name = "cad_name", length = 100)
    private String cadName;

    @Column(name = "cad_agreement_number", length = 50)
    private String cadAgreementNumber;

    // ========================================
    // INFORMATIONS FOURNISSEUR
    // ========================================

    @Column(name = "supplier_name", nullable = false, length = 100)
    private String supplierName;

    @Column(name = "supplier_reference", length = 50)
    private String supplierReference;

    @Column(name = "supplier_address", length = 200)
    private String supplierAddress;

    @Column(name = "supplier_postal_box", length = 50)
    private String supplierPostalBox;

    @Column(name = "supplier_country", nullable = false, length = 3)
    private String supplierCountry;

    @Column(name = "supplier_city", length = 100)
    private String supplierCity;

    @Column(name = "supplier_phone", length = 30)
    private String supplierPhone;

    @Column(name = "supplier_email", length = 100)
    private String supplierEmail;

    // ========================================
    // INFORMATIONS GÉNÉRALES DE L'IMPORTATION
    // ========================================

    @Column(name = "origin_country", nullable = false, length = 3)
    private String originCountry;

    @Column(name = "provenance_country", nullable = false, length = 3)
    private String provenanceCountry;

    @Column(name = "destination_country", nullable = false, length = 3)
    private String destinationCountry = "CM";

    @Column(name = "unloading_place", nullable = false, length = 100)
    private String unloadingPlace;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_mode", nullable = false)
    private TransportMode transportMode;

    // ========================================
    // INFORMATIONS FACTURE PROFORMA
    // ========================================

    @Column(name = "proforma_number", nullable = false, length = 50)
    private String proformaNumber;

    @Column(name = "proforma_date", nullable = false)
    private LocalDate proformaDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false, length = 3)
    private Currency currency = Currency.EUR;

    @Enumerated(EnumType.STRING)
    @Column(name = "incoterm", nullable = false)
    private Incoterm incoterm = Incoterm.FOB;

    // ========================================
    // VALEURS ET MONTANTS (en devise d'origine)
    // ========================================

    @Column(name = "total_fob_value", precision = 18, scale = 2)
    private BigDecimal totalFobValue;

    @Column(name = "fob_charges", precision = 18, scale = 2)
    private BigDecimal fobCharges = BigDecimal.ZERO;

    @Column(name = "freight_amount", precision = 18, scale = 2)
    private BigDecimal freightAmount = BigDecimal.ZERO;

    @Column(name = "insurance_amount", precision = 18, scale = 2)
    private BigDecimal insuranceAmount = BigDecimal.ZERO;

    @Column(name = "total_amount_currency", precision = 18, scale = 2)
    private BigDecimal totalAmountCurrency;

    @Column(name = "exchange_rate", precision = 12, scale = 6)
    private BigDecimal exchangeRate;

    // ========================================
    // VALEURS EN FCFA
    // ========================================

    @Column(name = "total_fob_value_xaf", precision = 18, scale = 2)
    private BigDecimal totalFobValueXaf;

    @Column(name = "total_amount_xaf", precision = 18, scale = 2)
    private BigDecimal totalAmountXaf;

    // ========================================
    // TAXES ET FRAIS
    // ========================================

    @Column(name = "inspection_fee", precision = 18, scale = 2)
    private BigDecimal inspectionFee;

    @Column(name = "fiscal_stamp", precision = 18, scale = 2)
    private BigDecimal fiscalStamp = new BigDecimal("1500");

    @Column(name = "total_fees", precision = 18, scale = 2)
    private BigDecimal totalFees;

    @Column(name = "is_pvi_exempt")
    private Boolean isPviExempt = false;

    // ========================================
    // PAIEMENT
    // ========================================

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_channel")
    private PaymentChannel paymentChannel;

    @Column(name = "payment_reference", length = 50)
    private String paymentReference;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "is_paid")
    private Boolean isPaid = false;

    // ========================================
    // VALIDITÉ ET PROROGATION
    // ========================================

    @Column(name = "validity_start_date")
    private LocalDate validityStartDate;

    @Column(name = "validity_end_date")
    private LocalDate validityEndDate;

    @Column(name = "is_prorogated")
    private Boolean isProrogated = false;

    @Column(name = "prorogation_date")
    private LocalDate prorogationDate;

    @Column(name = "prorogation_end_date")
    private LocalDate prorogationEndDate;

    // ========================================
    // MODIFICATION (AMENDEMENT)
    // ========================================

    @Column(name = "is_amendment")
    private Boolean isAmendment = false;

    @Column(name = "original_reference", length = 30)
    private String originalReference;

    @Column(name = "amendment_reason", columnDefinition = "TEXT")
    private String amendmentReason;

    @Column(name = "amendment_count")
    private Integer amendmentCount = 0;

    // ========================================
    // EXTENSION MÉDICAMENTS (si applicable)
    // ========================================

    @Column(name = "is_medication")
    private Boolean isMedication = false;

    @Column(name = "customs_office_code", length = 20)
    private String customsOfficeCode;

    @Column(name = "aoi_number", length = 20)
    private String aoiNumber;

    @Column(name = "minsante_agreement_date")
    private LocalDate minsanteAgreementDate;

    @Column(name = "minsante_agreement_number", length = 20)
    private String minsanteAgreementNumber;

    @Column(name = "pharmacist_name", length = 100)
    private String pharmacistName;

    @Column(name = "pharmacist_phone", length = 30)
    private String pharmacistPhone;

    @Column(name = "visa_technique_number", length = 30)
    private String visaTechniqueNumber;

    @Column(name = "visa_technique_date")
    private LocalDate visaTechniqueDate;

    // ========================================
    // TRAITEMENT
    // ========================================

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @Column(name = "validated_by", length = 100)
    private String validatedBy;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejected_by", length = 100)
    private String rejectedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "observation", columnDefinition = "TEXT")
    private String observation;

    // ========================================
    // RELATIONS
    // ========================================

    @OneToMany(mappedBy = "importDeclaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImportDeclarationItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "importDeclaration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImportDeclarationDocument> documents = new ArrayList<>();

    // ========================================
    // ENUMS
    // ========================================

    public enum ImportDeclarationStatus {
        DRAFT,                    // Brouillon
        SUBMITTED,                // Soumise
        PENDING_PAYMENT,          // En attente de paiement
        PAID,                     // Payée
        PROCESSING_SGS,           // En traitement SGS
        PROCESSING_CUSTOMS,       // En traitement Douane
        PENDING_VISA_TECHNIQUE,   // En attente visa technique (médicaments)
        VISA_TECHNIQUE_SIGNED,    // Visa technique signé
        VALIDATED,                // Validée
        EXPIRED,                  // Expirée
        PROROGATED,               // Prorogée
        REJECTED,                 // Rejetée
        CANCELLED                 // Annulée
    }

    public enum ImportType {
        CLASSIQUE,      // Importation classique
        GROUPAGE,       // Groupage
        MEDICAMENTS,    // Médicaments (nécessite visa technique)
        TRANSIT         // Transit (marchandise de passage)
    }

    public enum RoutingDestination {
        SGS,            // Valeur FOB > 1M FCFA et marchandise standard
        CUSTOMS         // Valeur FOB <= 1M FCFA OU véhicules d'occasion/poussins/œufs
    }

    public enum TransportMode {
        MARITIME,
        AERIEN,
        ROUTIER,
        FERROVIAIRE,
        MULTIMODAL
    }

    public enum Incoterm {
        FOB,    // Free On Board
        CIF,    // Cost, Insurance and Freight
        FAS,    // Free Alongside Ship
        CFR,    // Cost and Freight
        CIP,    // Carriage and Insurance Paid
        CPT,    // Carriage Paid To
        DAP,    // Delivered At Place
        DPU,    // Delivered at Place Unloaded
        DDP,    // Delivered Duty Paid
        EXW,    // Ex Works
        FCA     // Free Carrier
    }

    public enum Currency {
        XAF, EUR, USD, GBP, CHF, CNY, JPY
    }

    public enum PaymentChannel {
        BANK_PAYONLINE,     // Banque (PayOnline) - Valeur >= 2M FCFA
        CAMPOST,            // Campost - Valeur < 2M FCFA
        CNCC,               // CNCC - Valeur < 2M FCFA
        CAISSE_GUCE         // Caisse GUCE
    }

    // ========================================
    // MÉTHODES MÉTIER
    // ========================================

    /**
     * Calcule le montant total selon l'INCOTERM sélectionné.
     */
    public BigDecimal calculateTotalAmountByIncoterm() {
        BigDecimal total = totalFobValue != null ? totalFobValue : BigDecimal.ZERO;
        BigDecimal charges = fobCharges != null ? fobCharges : BigDecimal.ZERO;
        BigDecimal freight = freightAmount != null ? freightAmount : BigDecimal.ZERO;
        BigDecimal insurance = insuranceAmount != null ? insuranceAmount : BigDecimal.ZERO;

        switch (incoterm) {
            case FOB:
                return total.add(charges);
            case CIF:
            case CFR:
            case CIP:
            case CPT:
            case DAP:
            case DPU:
            case DDP:
                return total.add(charges).add(freight).add(insurance);
            case FAS:
                return total;
            case EXW:
            case FCA:
                return total.add(charges);
            default:
                return total;
        }
    }

    /**
     * Détermine le routage automatique (SGS ou Douane) selon les règles métier.
     */
    public RoutingDestination determineRouting() {
        // Règle RM02: Véhicules d'occasion, poussins, œufs → DOUANE
        if (containsSpecialMerchandise()) {
            return RoutingDestination.CUSTOMS;
        }

        // Règle RM01/RM02: Valeur FOB > 1M FCFA → SGS, sinon DOUANE
        BigDecimal threshold = new BigDecimal("1000000");
        if (totalFobValueXaf != null && totalFobValueXaf.compareTo(threshold) > 0) {
            return RoutingDestination.SGS;
        }

        return RoutingDestination.CUSTOMS;
    }

    /**
     * Vérifie si la déclaration contient des marchandises spéciales (véhicules occasion, poussins, œufs).
     */
    public boolean containsSpecialMerchandise() {
        if (items == null || items.isEmpty()) {
            return false;
        }
        return items.stream().anyMatch(item ->
            item.isUsedVehicle() || item.isPoultryChicks() || item.isEggs());
    }

    /**
     * Calcule la taxe d'inspection selon le routage.
     */
    public BigDecimal calculateInspectionFee() {
        if (isPviExempt != null && isPviExempt) {
            return BigDecimal.ZERO;
        }

        if (routingDestination == RoutingDestination.SGS) {
            // Règle RM04: SGS = MAX(0.95% × Valeur FOB, 110 000 FCFA)
            BigDecimal percentage = totalFobValueXaf.multiply(new BigDecimal("0.0095"));
            BigDecimal minimum = new BigDecimal("110000");
            return percentage.max(minimum);
        } else {
            // Règle RM05: Douane = 6 000 FCFA
            return new BigDecimal("6000");
        }
    }

    /**
     * Calcule le total des frais (inspection + timbre fiscal).
     */
    public BigDecimal calculateTotalFees() {
        BigDecimal inspection = calculateInspectionFee();
        BigDecimal stamp = fiscalStamp != null ? fiscalStamp : new BigDecimal("1500");
        return inspection.add(stamp);
    }

    /**
     * Détermine le canal de paiement approprié.
     */
    public PaymentChannel determinePaymentChannel() {
        // Règle RM06: Valeur < 2M FCFA → Campost/CNCC, sinon Banque
        BigDecimal threshold = new BigDecimal("2000000");
        if (totalFobValueXaf != null && totalFobValueXaf.compareTo(threshold) >= 0) {
            return PaymentChannel.BANK_PAYONLINE;
        }
        return PaymentChannel.CAMPOST;
    }

    /**
     * Vérifie si la DI peut être prorogée.
     */
    public boolean canBeProrogated() {
        // Règle RM02-03: Prorogation possible UNE SEULE FOIS sur DI EXPIRÉE
        return status == ImportDeclarationStatus.EXPIRED && !isProrogated;
    }

    /**
     * Proroge la DI (validité +3 mois).
     */
    public void prorogateDI() {
        if (!canBeProrogated()) {
            throw new IllegalStateException("Cette DI ne peut pas être prorogée");
        }
        this.isProrogated = true;
        this.prorogationDate = LocalDate.now();
        this.prorogationEndDate = LocalDate.now().plusMonths(3);
        this.status = ImportDeclarationStatus.PROROGATED;
    }

    /**
     * Soumet la déclaration.
     */
    public void submit() {
        this.status = ImportDeclarationStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
        this.routingDestination = determineRouting();
        this.inspectionFee = calculateInspectionFee();
        this.totalFees = calculateTotalFees();
        this.paymentChannel = determinePaymentChannel();

        // Validité initiale: 9 mois
        this.validityStartDate = LocalDate.now();
        this.validityEndDate = LocalDate.now().plusMonths(9);
    }

    /**
     * Marque le paiement effectué.
     */
    public void markAsPaid(String paymentRef) {
        this.isPaid = true;
        this.paymentReference = paymentRef;
        this.paymentDate = LocalDateTime.now();
        this.status = ImportDeclarationStatus.PAID;

        // Route vers le bon organisme
        if (routingDestination == RoutingDestination.SGS) {
            this.status = ImportDeclarationStatus.PROCESSING_SGS;
        } else {
            this.status = ImportDeclarationStatus.PROCESSING_CUSTOMS;
        }

        // Si médicament, en attente de visa technique
        if (isMedication != null && isMedication) {
            this.status = ImportDeclarationStatus.PENDING_VISA_TECHNIQUE;
        }
    }

    /**
     * Valide la déclaration.
     */
    public void validate(String validator) {
        this.status = ImportDeclarationStatus.VALIDATED;
        this.validatedAt = LocalDateTime.now();
        this.validatedBy = validator;
    }

    /**
     * Rejette la déclaration.
     */
    public void reject(String rejector, String reason) {
        this.status = ImportDeclarationStatus.REJECTED;
        this.rejectedAt = LocalDateTime.now();
        this.rejectedBy = rejector;
        this.rejectionReason = reason;
    }

    /**
     * Ajoute une marchandise.
     */
    public void addItem(ImportDeclarationItem item) {
        items.add(item);
        item.setImportDeclaration(this);
        recalculateTotals();
    }

    /**
     * Recalcule les totaux.
     */
    public void recalculateTotals() {
        this.totalFobValue = items.stream()
                .map(item -> item.getFobValue() != null ? item.getFobValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmountCurrency = calculateTotalAmountByIncoterm();

        if (exchangeRate != null) {
            this.totalFobValueXaf = totalFobValue.multiply(exchangeRate);
            this.totalAmountXaf = totalAmountCurrency.multiply(exchangeRate);
        }
    }
}
