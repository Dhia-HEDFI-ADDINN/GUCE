package cm.guce.procedure.application.dto;

import cm.guce.common.application.dto.BaseDto;
import cm.guce.procedure.domain.model.FimexDocument;
import cm.guce.procedure.domain.model.FimexInscription.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs pour les inscriptions FIMEX.
 * Conforme aux spécifications fonctionnelles GUCE - DA_FIMEX_Exportation.
 */
public class FimexDto {

    // ========================================
    // RESPONSE DTOs
    // ========================================

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Response extends BaseDto {
        private String reference;
        private RequestType requestType;
        private FimexStatus status;
        private String statusLabel;
        private String processInstanceId;

        // Informations société
        private String niu;
        private String companyName;
        private String cniSsn;
        private LegalForm legalForm;
        private String nationality;
        private BigDecimal annualRevenue;
        private String mainActivity;
        private String commercialRegisterNumber;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String region;

        // Représentant légal
        private String legalRepName;
        private String legalRepTitle;
        private String legalRepCni;
        private String legalRepPhone;
        private String legalRepEmail;

        // Produits
        private String mainProducts;
        private String hsCodes;
        private String exportDestinations;
        private String importOrigins;

        // Frais
        private BigDecimal registrationFee;
        private BigDecimal processingFee;
        private BigDecimal totalFees;
        private String cnccPaymentRef;
        private Boolean isCnccPaid;
        private String mincomPaymentRef;
        private Boolean isMincomPaid;

        // Traitement
        private LocalDateTime submittedAt;
        private String processedBy;
        private LocalDateTime processedAt;
        private String signedBy;
        private LocalDateTime signedAt;
        private String rejectionReason;

        // Complément
        private Boolean complementRequested;
        private String complementRequestReason;
        private LocalDateTime complementRequestDate;

        // Certificat
        private String certificateNumber;
        private LocalDate certificateIssueDate;
        private LocalDate certificateExpiryDate;
        private Boolean isSgsNotified;

        // Documents
        private List<DocumentResponse> documents;
    }

    @Data
    public static class Summary {
        private UUID id;
        private String reference;
        private RequestType requestType;
        private FimexStatus status;
        private String statusLabel;
        private String niu;
        private String companyName;
        private LegalForm legalForm;
        private String mainActivity;
        private String region;
        private Boolean isCnccPaid;
        private Boolean isMincomPaid;
        private String certificateNumber;
        private LocalDate certificateExpiryDate;
        private LocalDateTime submittedAt;
        private LocalDateTime createdAt;
    }

    @Data
    public static class DocumentResponse {
        private UUID id;
        private FimexDocument.DocumentType documentType;
        private String documentName;
        private String fileName;
        private Long fileSize;
        private Boolean isMandatory;
        private Boolean isVerified;
        private String rejectionReason;
    }

    // ========================================
    // REQUEST DTOs
    // ========================================

    @Data
    public static class CreateRequest {
        @NotNull(message = "Le type de demande est obligatoire")
        private RequestType requestType = RequestType.INSCRIPTION;

        // Informations société
        @NotBlank(message = "Le NIU est obligatoire")
        @Size(max = 30)
        private String niu;

        @NotBlank(message = "Le nom de la société est obligatoire")
        @Size(max = 100)
        private String companyName;

        @Size(max = 20)
        private String cniSsn;

        @NotNull(message = "La forme juridique est obligatoire")
        private LegalForm legalForm;

        @Size(max = 3)
        private String countryOfBirth;

        @Size(max = 50)
        private String nationality;

        @DecimalMin(value = "0")
        private BigDecimal annualRevenue;

        @Size(max = 200)
        private String mainActivity;

        @NotBlank(message = "Le numéro du registre de commerce est obligatoire")
        @Size(max = 50)
        private String commercialRegisterNumber;

        @NotBlank(message = "L'email est obligatoire")
        @Email
        @Size(max = 100)
        private String email;

        @Size(max = 30)
        private String phone;

        @Size(max = 200)
        private String address;

        @Size(max = 50)
        private String postalBox;

        @Size(max = 100)
        private String city;

        @Size(max = 100)
        private String region;

        // Représentant légal
        @NotBlank(message = "Le nom du représentant légal est obligatoire")
        @Size(max = 100)
        private String legalRepName;

        @Size(max = 100)
        private String legalRepTitle;

        @Size(max = 30)
        private String legalRepCni;

        @Size(max = 30)
        private String legalRepPhone;

        @Email
        @Size(max = 100)
        private String legalRepEmail;

        // Produits
        private String mainProducts;
        private String hsCodes;
        private String exportDestinations;
        private String importOrigins;

        // Renouvellement
        private String previousCertificateNumber;
        private LocalDate previousCertificateExpiry;
    }

    @Data
    public static class UpdateRequest {
        // Mise à jour des informations modifiables
        @Size(max = 200)
        private String address;

        @Size(max = 50)
        private String postalBox;

        @Size(max = 30)
        private String phone;

        @Email
        @Size(max = 100)
        private String email;

        @Size(max = 100)
        private String legalRepName;

        @Size(max = 100)
        private String legalRepTitle;

        @Size(max = 30)
        private String legalRepPhone;

        @Email
        @Size(max = 100)
        private String legalRepEmail;

        private String mainProducts;
        private String hsCodes;
        private String exportDestinations;
        private String importOrigins;
    }

    @Data
    public static class ComplementRequest {
        @NotBlank(message = "Le motif de demande de complément est obligatoire")
        private String reason;
    }

    @Data
    public static class SignatureRequest {
        private String observations;
    }

    @Data
    public static class RejectionRequest {
        @NotBlank(message = "Le motif de rejet est obligatoire")
        private String reason;
    }

    // ========================================
    // STATISTICS
    // ========================================

    @Data
    public static class Statistics {
        // Par statut
        private long totalDraft;
        private long totalSubmitted;
        private long totalPendingPayment;
        private long totalProcessing;
        private long totalComplementRequested;
        private long totalApproved;
        private long totalSigned;
        private long totalRejected;
        private long totalExpired;

        // Par région
        private List<RegionStatistic> byRegion;

        // Par forme juridique
        private List<LegalFormStatistic> byLegalForm;

        // Par secteur d'activité
        private List<ActivityStatistic> byActivity;

        // Délais
        private Double averageProcessingDays;
        private long certificatesIssuedThisMonth;
        private long pendingMoreThanXDays;

        // Chiffre d'affaires total
        private BigDecimal totalAnnualRevenue;
    }

    @Data
    public static class RegionStatistic {
        private String region;
        private long count;
        private BigDecimal totalRevenue;
    }

    @Data
    public static class LegalFormStatistic {
        private LegalForm legalForm;
        private long count;
    }

    @Data
    public static class ActivityStatistic {
        private String activity;
        private long count;
    }

    @Data
    public static class CertificateInfo {
        private String certificateNumber;
        private String companyName;
        private String niu;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private boolean isValid;
        private int daysUntilExpiry;
    }
}
