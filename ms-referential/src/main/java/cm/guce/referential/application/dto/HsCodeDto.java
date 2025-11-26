package cm.guce.referential.application.dto;

import cm.guce.common.application.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO pour les codes du Système Harmonisé.
 */
public class HsCodeDto {

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Response extends BaseDto {
        private String code;
        private String chapter;
        private String heading;
        private String subheading;
        private String tariffLine;
        private String descriptionFr;
        private String descriptionEn;
        private BigDecimal dutyRate;
        private BigDecimal vatRate;
        private BigDecimal exciseRate;
        private String statisticalUnit;
        private Boolean requiresLicense;
        private Boolean requiresPhytosanitary;
        private Boolean requiresVeterinary;
        private Boolean isProhibited;
        private Boolean isRestricted;
        private Boolean isActive;
        private UUID parentId;
        private String parentCode;
        private int level;
        private List<Summary> children;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Le code SH est obligatoire")
        @Size(min = 2, max = 12, message = "Le code SH doit avoir entre 2 et 12 caractères")
        private String code;

        @NotBlank(message = "La description en français est obligatoire")
        private String descriptionFr;

        private String descriptionEn;
        private BigDecimal dutyRate;
        private BigDecimal vatRate;
        private BigDecimal exciseRate;
        private String statisticalUnit;
        private Boolean requiresLicense = false;
        private Boolean requiresPhytosanitary = false;
        private Boolean requiresVeterinary = false;
        private Boolean isProhibited = false;
        private Boolean isRestricted = false;
        private UUID parentId;
    }

    @Data
    public static class UpdateRequest {
        private String descriptionFr;
        private String descriptionEn;
        private BigDecimal dutyRate;
        private BigDecimal vatRate;
        private BigDecimal exciseRate;
        private String statisticalUnit;
        private Boolean requiresLicense;
        private Boolean requiresPhytosanitary;
        private Boolean requiresVeterinary;
        private Boolean isProhibited;
        private Boolean isRestricted;
        private Boolean isActive;
    }

    @Data
    public static class Summary {
        private UUID id;
        private String code;
        private String descriptionFr;
        private String descriptionEn;
        private int level;
        private boolean hasChildren;
    }

    @Data
    public static class TariffInfo {
        private String code;
        private String description;
        private BigDecimal dutyRate;
        private BigDecimal vatRate;
        private BigDecimal exciseRate;
        private BigDecimal totalRate;
        private List<String> requiredDocuments;
        private List<String> restrictions;
    }
}
