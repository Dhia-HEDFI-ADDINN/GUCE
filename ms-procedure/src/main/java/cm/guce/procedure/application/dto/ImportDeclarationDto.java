package cm.guce.procedure.application.dto;

import cm.guce.common.application.dto.BaseDto;
import cm.guce.procedure.domain.model.ImportDeclaration.*;
import cm.guce.procedure.domain.model.ImportDeclarationDocument;
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
 * DTOs pour les Déclarations d'Importation.
 * Conforme aux spécifications fonctionnelles GUCE Cameroun.
 */
public class ImportDeclarationDto {

    // ========================================
    // RESPONSE DTOs
    // ========================================

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Response extends BaseDto {
        private String reference;
        private ImportDeclarationStatus status;
        private String statusLabel;
        private ImportType importType;
        private RoutingDestination routingDestination;
        private String processInstanceId;

        // Importateur
        private String importerNiu;
        private String importerName;
        private String importerAddress;
        private String importerPhone;
        private String importerEmail;

        // CAD
        private UUID cadId;
        private String cadNiu;
        private String cadName;

        // Fournisseur
        private String supplierName;
        private String supplierCountry;
        private String supplierCity;

        // Informations générales
        private String originCountry;
        private String provenanceCountry;
        private String destinationCountry;
        private String unloadingPlace;
        private TransportMode transportMode;

        // Facture
        private String proformaNumber;
        private LocalDate proformaDate;
        private Currency currency;
        private Incoterm incoterm;

        // Valeurs
        private BigDecimal totalFobValue;
        private BigDecimal fobCharges;
        private BigDecimal freightAmount;
        private BigDecimal insuranceAmount;
        private BigDecimal totalAmountCurrency;
        private BigDecimal exchangeRate;
        private BigDecimal totalFobValueXaf;
        private BigDecimal totalAmountXaf;

        // Taxes
        private BigDecimal inspectionFee;
        private BigDecimal fiscalStamp;
        private BigDecimal totalFees;
        private Boolean isPviExempt;

        // Paiement
        private PaymentChannel paymentChannel;
        private String paymentReference;
        private LocalDateTime paymentDate;
        private Boolean isPaid;

        // Validité
        private LocalDate validityStartDate;
        private LocalDate validityEndDate;
        private Boolean isProrogated;
        private LocalDate prorogationEndDate;

        // Amendment
        private Boolean isAmendment;
        private String originalReference;
        private Integer amendmentCount;

        // Médicaments
        private Boolean isMedication;
        private String visaTechniqueNumber;
        private LocalDate visaTechniqueDate;

        // Dates
        private LocalDateTime submittedAt;
        private LocalDateTime validatedAt;
        private String validatedBy;

        // Relations
        private List<ItemResponse> items;
        private List<DocumentResponse> documents;
    }

    @Data
    public static class Summary {
        private UUID id;
        private String reference;
        private ImportDeclarationStatus status;
        private String statusLabel;
        private ImportType importType;
        private RoutingDestination routingDestination;
        private String importerName;
        private String importerNiu;
        private String supplierCountry;
        private TransportMode transportMode;
        private BigDecimal totalFobValueXaf;
        private BigDecimal totalFees;
        private Boolean isPaid;
        private LocalDate validityEndDate;
        private LocalDateTime submittedAt;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ItemResponse {
        private UUID id;
        private Integer itemNumber;
        private String hsCode;
        private String hsCodeDescription;
        private String designation;
        private String description;
        private BigDecimal quantity;
        private String unitOfMeasure;
        private BigDecimal netWeight;
        private BigDecimal unitFobValue;
        private BigDecimal fobValue;
        private Boolean isUsedVehicle;
        private Boolean isPoultryChicks;
        private Boolean isEggs;
        private Boolean isMedication;
    }

    @Data
    public static class DocumentResponse {
        private UUID id;
        private ImportDeclarationDocument.DocumentType documentType;
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
        @NotNull(message = "Le type d'importation est obligatoire")
        private ImportType importType;

        // Importateur
        @NotBlank(message = "Le NIU de l'importateur est obligatoire")
        @Size(max = 30)
        private String importerNiu;

        @NotBlank(message = "Le nom de l'importateur est obligatoire")
        @Size(max = 100)
        private String importerName;

        @Size(max = 200)
        private String importerAddress;

        @NotBlank(message = "Le téléphone de l'importateur est obligatoire")
        @Size(max = 30)
        private String importerPhone;

        @Email
        @Size(max = 100)
        private String importerEmail;

        @Size(max = 100)
        private String importerContactPerson;

        // CAD (optionnel)
        private UUID cadId;
        private String cadNiu;
        private String cadName;
        private String cadAgreementNumber;

        // Fournisseur
        @NotBlank(message = "Le nom du fournisseur est obligatoire")
        @Size(max = 100)
        private String supplierName;

        @Size(max = 50)
        private String supplierReference;

        @Size(max = 200)
        private String supplierAddress;

        @Size(max = 50)
        private String supplierPostalBox;

        @NotBlank(message = "Le pays du fournisseur est obligatoire")
        @Size(max = 3)
        private String supplierCountry;

        @NotBlank(message = "La ville du fournisseur est obligatoire")
        @Size(max = 100)
        private String supplierCity;

        @Size(max = 30)
        private String supplierPhone;

        @Email
        @Size(max = 100)
        private String supplierEmail;

        // Informations générales
        @NotBlank(message = "Le pays d'origine est obligatoire")
        @Size(max = 3)
        private String originCountry;

        @NotBlank(message = "Le pays de provenance est obligatoire")
        @Size(max = 3)
        private String provenanceCountry;

        @NotBlank(message = "Le lieu de déchargement est obligatoire")
        @Size(max = 100)
        private String unloadingPlace;

        @NotNull(message = "Le mode de transport est obligatoire")
        private TransportMode transportMode;

        // Facture proforma
        @NotBlank(message = "Le numéro de facture proforma est obligatoire")
        @Size(max = 50)
        private String proformaNumber;

        @NotNull(message = "La date de facture proforma est obligatoire")
        private LocalDate proformaDate;

        @NotNull(message = "La devise est obligatoire")
        private Currency currency;

        @NotNull(message = "L'INCOTERM est obligatoire")
        private Incoterm incoterm;

        // Valeurs
        @NotNull(message = "Les frais de mise FOB sont obligatoires")
        @DecimalMin(value = "0")
        private BigDecimal fobCharges;

        @DecimalMin(value = "0")
        private BigDecimal freightAmount;

        @DecimalMin(value = "0")
        private BigDecimal insuranceAmount;

        @NotNull(message = "Le taux de change est obligatoire")
        @DecimalMin(value = "0.000001")
        private BigDecimal exchangeRate;

        // Exemption PVI
        private Boolean isPviExempt = false;

        // Extension médicaments
        private Boolean isMedication = false;
        private String customsOfficeCode;
        private String aoiNumber;
        private LocalDate minsanteAgreementDate;
        private String minsanteAgreementNumber;
        private String pharmacistName;
        private String pharmacistPhone;

        // Marchandises
        @NotEmpty(message = "Au moins une marchandise est requise")
        @Valid
        private List<ItemRequest> items;

        private String observation;
    }

    @Data
    public static class ItemRequest {
        @NotBlank(message = "Le code tarifaire est obligatoire")
        @Size(max = 12)
        private String hsCode;

        private String hsCodeDescription;

        @NotBlank(message = "La désignation est obligatoire")
        @Size(max = 200)
        private String designation;

        private String description;

        @NotNull(message = "La quantité est obligatoire")
        @DecimalMin(value = "0.001")
        private BigDecimal quantity;

        @Size(max = 20)
        private String unitOfMeasure;

        @DecimalMin(value = "0")
        private BigDecimal netWeight;

        @DecimalMin(value = "0")
        private BigDecimal grossWeight;

        @NotNull(message = "La valeur FOB unitaire est obligatoire")
        @DecimalMin(value = "0")
        private BigDecimal unitFobValue;

        private String brand;
        private String model;
        private String serialNumber;
        private Integer manufacturingYear;

        // Véhicules d'occasion
        private Boolean isUsedVehicle = false;
        private String vehicleRegistration;
        private String vehicleChassisNumber;
        private String vehicleEngineNumber;
        private String vehicleFirstRegistrationDate;
        private Integer vehicleMileage;

        // Aviculture
        private Boolean isPoultryChicks = false;
        private Boolean isEggs = false;
        private Integer poultryQuantity;
        private String sanitaryCertificate;

        // Médicaments
        private Boolean isMedication = false;
        private String medicationAmmNumber;
        private String medicationDci;
        private String medicationDosage;
        private String medicationForm;
        private String medicationExpiryDate;
        private String medicationBatchNumber;
    }

    @Data
    public static class UpdateRequest {
        // Seuls certains champs sont modifiables avant soumission
        private String importerAddress;
        private String importerPhone;
        private String importerEmail;
        private String importerContactPerson;

        private String supplierReference;
        private String supplierAddress;
        private String supplierPostalBox;
        private String supplierPhone;
        private String supplierEmail;

        private BigDecimal fobCharges;
        private BigDecimal freightAmount;
        private BigDecimal insuranceAmount;
        private BigDecimal exchangeRate;

        private Boolean isPviExempt;

        @Valid
        private List<ItemRequest> items;

        private String observation;
    }

    @Data
    public static class AmendmentRequest {
        // Pour les amendements (modifications post-validation)
        // Règle: La valeur FOB ne peut pas diminuer

        @NotBlank(message = "L'objet de la modification est obligatoire")
        private String amendmentReason;

        @Valid
        private List<ItemRequest> items;

        // Augmentation uniquement
        @DecimalMin(value = "0")
        private BigDecimal additionalFobCharges;

        @DecimalMin(value = "0")
        private BigDecimal additionalFreightAmount;

        @DecimalMin(value = "0")
        private BigDecimal additionalInsuranceAmount;

        private String observation;
    }

    @Data
    public static class ProrogationRequest {
        // Aucun champ modifiable pour une prorogation
        // La référence reste identique, validité +3 mois
        private String justification;
    }

    @Data
    public static class VisaTechniqueRequest {
        @NotBlank(message = "Le numéro de visa technique est obligatoire")
        private String visaTechniqueNumber;

        @NotNull(message = "La date de visa technique est obligatoire")
        private LocalDate visaTechniqueDate;

        private String observations;
    }

    // ========================================
    // STATISTICS
    // ========================================

    @Data
    public static class Statistics {
        // Par type (SGS vs Douane)
        private long totalSgsDeclarations;
        private long totalCustomsDeclarations;

        // Par statut
        private long totalDraft;
        private long totalSubmitted;
        private long totalPendingPayment;
        private long totalProcessing;
        private long totalValidated;
        private long totalRejected;
        private long totalExpired;

        // Valeurs
        private BigDecimal totalFobValueImported;
        private BigDecimal totalFeesCollected;
        private BigDecimal totalSgsFees;
        private BigDecimal totalCustomsFees;

        // Par mode de transport
        private long totalMaritime;
        private long totalAerien;
        private long totalRoutier;
        private long totalFerroviaire;
        private long totalMultimodal;

        // Par type d'importation
        private long totalClassique;
        private long totalGroupage;
        private long totalMedicaments;
        private long totalTransit;

        // Délais
        private Double averageProcessingDays;
        private long prorogationCount;
        private long amendmentCount;
    }

    @Data
    public static class RoutingResult {
        private RoutingDestination destination;
        private String destinationLabel;
        private BigDecimal inspectionFee;
        private BigDecimal fiscalStamp;
        private BigDecimal totalFees;
        private PaymentChannel paymentChannel;
        private String paymentChannelLabel;
        private String routingReason;
        private boolean hasSpecialMerchandise;
    }

    @Data
    public static class FeeCalculation {
        private BigDecimal totalFobValueXaf;
        private BigDecimal inspectionFeeRate;
        private BigDecimal inspectionFeeCalculated;
        private BigDecimal inspectionFeeMinimum;
        private BigDecimal inspectionFeeApplied;
        private BigDecimal fiscalStamp;
        private BigDecimal totalFees;
        private String calculationDetails;
    }
}
