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

/**
 * Entité Inscription au Fichier des Importateurs/Exportateurs (FIMEX).
 *
 * Conforme aux spécifications fonctionnelles GUCE - DA_FIMEX_Exportation.
 * Gère le processus d'inscription et de renouvellement FIMEX.
 */
@Entity
@Table(name = "fimex_inscription", indexes = {
        @Index(name = "idx_fimex_reference", columnList = "reference"),
        @Index(name = "idx_fimex_niu", columnList = "niu"),
        @Index(name = "idx_fimex_status", columnList = "status"),
        @Index(name = "idx_fimex_type", columnList = "request_type")
})
@Getter
@Setter
@NoArgsConstructor
public class FimexInscription extends BaseEntity {

    // ========================================
    // RÉFÉRENCE ET STATUT
    // ========================================

    @Column(name = "reference", nullable = false, unique = true, length = 30)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private RequestType requestType = RequestType.INSCRIPTION;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FimexStatus status = FimexStatus.DRAFT;

    @Column(name = "process_instance_id")
    private String processInstanceId;

    // ========================================
    // INFORMATIONS EXPORTATEUR/IMPORTATEUR
    // ========================================

    @Column(name = "niu", nullable = false, length = 30)
    private String niu;

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;

    @Column(name = "cni_ssn", length = 20)
    private String cniSsn;

    @Enumerated(EnumType.STRING)
    @Column(name = "legal_form", nullable = false)
    private LegalForm legalForm;

    @Column(name = "country_of_birth", length = 3)
    private String countryOfBirth;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "annual_revenue", precision = 18, scale = 2)
    private BigDecimal annualRevenue;

    @Column(name = "main_activity", length = 200)
    private String mainActivity;

    @Column(name = "commercial_register_number", nullable = false, length = 50)
    private String commercialRegisterNumber;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "address", length = 200)
    private String address;

    @Column(name = "postal_box", length = 50)
    private String postalBox;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "region", length = 100)
    private String region;

    // ========================================
    // INFORMATIONS REPRÉSENTANT LÉGAL
    // ========================================

    @Column(name = "legal_rep_name", length = 100)
    private String legalRepName;

    @Column(name = "legal_rep_title", length = 100)
    private String legalRepTitle;

    @Column(name = "legal_rep_cni", length = 30)
    private String legalRepCni;

    @Column(name = "legal_rep_phone", length = 30)
    private String legalRepPhone;

    @Column(name = "legal_rep_email", length = 100)
    private String legalRepEmail;

    // ========================================
    // PRODUITS EXPORTÉS/IMPORTÉS
    // ========================================

    @Column(name = "main_products", columnDefinition = "TEXT")
    private String mainProducts;

    @Column(name = "hs_codes", columnDefinition = "TEXT")
    private String hsCodes;

    @Column(name = "export_destinations", columnDefinition = "TEXT")
    private String exportDestinations;

    @Column(name = "import_origins", columnDefinition = "TEXT")
    private String importOrigins;

    // ========================================
    // FRAIS
    // ========================================

    @Column(name = "registration_fee", precision = 10, scale = 2)
    private BigDecimal registrationFee = new BigDecimal("10000"); // CNCC

    @Column(name = "processing_fee", precision = 10, scale = 2)
    private BigDecimal processingFee = new BigDecimal("15000"); // MINCOMMERCE

    @Column(name = "total_fees", precision = 10, scale = 2)
    private BigDecimal totalFees = new BigDecimal("25000");

    @Column(name = "cncc_payment_ref", length = 50)
    private String cnccPaymentRef;

    @Column(name = "cncc_payment_date")
    private LocalDateTime cnccPaymentDate;

    @Column(name = "is_cncc_paid")
    private Boolean isCnccPaid = false;

    @Column(name = "mincom_payment_ref", length = 50)
    private String mincomPaymentRef;

    @Column(name = "mincom_payment_date")
    private LocalDateTime mincomPaymentDate;

    @Column(name = "is_mincom_paid")
    private Boolean isMincomPaid = false;

    // ========================================
    // TRAITEMENT
    // ========================================

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "signed_by", length = 100)
    private String signedBy;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "rejected_by", length = 100)
    private String rejectedBy;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    // ========================================
    // COMPLÉMENT D'INFORMATION
    // ========================================

    @Column(name = "complement_requested")
    private Boolean complementRequested = false;

    @Column(name = "complement_request_reason", columnDefinition = "TEXT")
    private String complementRequestReason;

    @Column(name = "complement_request_date")
    private LocalDateTime complementRequestDate;

    @Column(name = "complement_response_date")
    private LocalDateTime complementResponseDate;

    // ========================================
    // CERTIFICAT
    // ========================================

    @Column(name = "certificate_number", length = 30)
    private String certificateNumber;

    @Column(name = "certificate_issue_date")
    private LocalDate certificateIssueDate;

    @Column(name = "certificate_expiry_date")
    private LocalDate certificateExpiryDate;

    @Column(name = "certificate_file_path", length = 500)
    private String certificateFilePath;

    @Column(name = "is_sgs_notified")
    private Boolean isSgsNotified = false;

    @Column(name = "sgs_notification_date")
    private LocalDateTime sgsNotificationDate;

    // ========================================
    // RENOUVELLEMENT
    // ========================================

    @Column(name = "previous_certificate_number", length = 30)
    private String previousCertificateNumber;

    @Column(name = "previous_certificate_expiry")
    private LocalDate previousCertificateExpiry;

    // ========================================
    // RELATIONS
    // ========================================

    @OneToMany(mappedBy = "fimexInscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FimexDocument> documents = new ArrayList<>();

    // ========================================
    // ENUMS
    // ========================================

    public enum RequestType {
        INSCRIPTION,    // Inscription initiale
        RENOUVELLEMENT  // Renouvellement
    }

    public enum FimexStatus {
        DRAFT,                      // Brouillon
        SUBMITTED,                  // Soumise
        PENDING_CNCC_PAYMENT,       // En attente paiement CNCC (10 000 FCFA)
        CNCC_PAID,                  // CNCC payé
        PENDING_MINCOM_PAYMENT,     // En attente paiement MINCOMMERCE (15 000 FCFA)
        ALL_PAID,                   // Tous les frais payés
        PROCESSING,                 // En traitement MINCOMMERCE
        COMPLEMENT_REQUESTED,       // Complément d'information demandé
        COMPLEMENT_PROVIDED,        // Complément fourni
        APPROVED,                   // Approuvé - En attente signature
        SIGNED,                     // Certificat signé
        REJECTED,                   // Rejetée
        EXPIRED,                    // Expirée
        CANCELLED                   // Annulée
    }

    public enum LegalForm {
        SA,         // Société Anonyme
        SARL,       // Société à Responsabilité Limitée
        SAS,        // Société par Actions Simplifiée
        SNC,        // Société en Nom Collectif
        EI,         // Entreprise Individuelle
        GIE,        // Groupement d'Intérêt Économique
        COOPERATIVE,
        ASSOCIATION,
        OTHER
    }

    // ========================================
    // MÉTHODES MÉTIER
    // ========================================

    /**
     * Soumet la demande d'inscription FIMEX.
     */
    public void submit() {
        this.status = FimexStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }

    /**
     * Enregistre le paiement CNCC (10 000 FCFA).
     */
    public void recordCnccPayment(String paymentRef) {
        this.isCnccPaid = true;
        this.cnccPaymentRef = paymentRef;
        this.cnccPaymentDate = LocalDateTime.now();

        if (status == FimexStatus.SUBMITTED || status == FimexStatus.PENDING_CNCC_PAYMENT) {
            this.status = FimexStatus.CNCC_PAID;
        }

        checkAllPaymentsReceived();
    }

    /**
     * Enregistre le paiement MINCOMMERCE (15 000 FCFA).
     */
    public void recordMincomPayment(String paymentRef) {
        this.isMincomPaid = true;
        this.mincomPaymentRef = paymentRef;
        this.mincomPaymentDate = LocalDateTime.now();

        if (status == FimexStatus.CNCC_PAID || status == FimexStatus.PENDING_MINCOM_PAYMENT) {
            checkAllPaymentsReceived();
        }
    }

    private void checkAllPaymentsReceived() {
        if (Boolean.TRUE.equals(isCnccPaid) && Boolean.TRUE.equals(isMincomPaid)) {
            this.status = FimexStatus.ALL_PAID;
        }
    }

    /**
     * Démarre le traitement MINCOMMERCE.
     */
    public void startProcessing(String processor) {
        this.status = FimexStatus.PROCESSING;
        this.processedBy = processor;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * Demande un complément d'information.
     */
    public void requestComplement(String reason) {
        this.status = FimexStatus.COMPLEMENT_REQUESTED;
        this.complementRequested = true;
        this.complementRequestReason = reason;
        this.complementRequestDate = LocalDateTime.now();
    }

    /**
     * Fournit le complément d'information.
     */
    public void provideComplement() {
        this.status = FimexStatus.COMPLEMENT_PROVIDED;
        this.complementResponseDate = LocalDateTime.now();
    }

    /**
     * Approuve la demande.
     */
    public void approve(String processor) {
        this.status = FimexStatus.APPROVED;
        this.processedBy = processor;
        this.processedAt = LocalDateTime.now();
    }

    /**
     * Signe le certificat.
     */
    public void signCertificate(String signatory, String certificateNumber) {
        this.status = FimexStatus.SIGNED;
        this.signedBy = signatory;
        this.signedAt = LocalDateTime.now();
        this.certificateNumber = certificateNumber;
        this.certificateIssueDate = LocalDate.now();
        this.certificateExpiryDate = LocalDate.now().plusYears(1); // Validité 1 an
    }

    /**
     * Rejette la demande.
     */
    public void reject(String rejector, String reason) {
        this.status = FimexStatus.REJECTED;
        this.rejectedBy = rejector;
        this.rejectedAt = LocalDateTime.now();
        this.rejectionReason = reason;
    }

    /**
     * Notifie la SGS du certificat émis.
     */
    public void notifySgs() {
        this.isSgsNotified = true;
        this.sgsNotificationDate = LocalDateTime.now();
    }

    /**
     * Ajoute un document.
     */
    public void addDocument(FimexDocument document) {
        documents.add(document);
        document.setFimexInscription(this);
    }

    /**
     * Génère le numéro de certificat.
     */
    public String generateCertificateNumber() {
        return "FIMEX-" + java.time.Year.now().getValue() + "-" +
               String.format("%06d", System.currentTimeMillis() % 1000000);
    }
}
