package cm.guce.referential.application.dto;

import cm.guce.common.application.dto.BaseDto;
import cm.guce.referential.domain.model.Country;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

/**
 * DTO pour les pays.
 */
public class CountryDto {

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Response extends BaseDto {
        private String codeIso2;
        private String codeIso3;
        private String codeNumeric;
        private String nameFr;
        private String nameEn;
        private String nationalityFr;
        private String nationalityEn;
        private String region;
        private String subRegion;
        private Country.EconomicZone economicZone;
        private Boolean isCemac;
        private Boolean isActive;
        private UUID defaultCurrencyId;
        private String defaultCurrencyCode;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Le code ISO2 est obligatoire")
        @Size(min = 2, max = 2, message = "Le code ISO2 doit avoir 2 caractères")
        private String codeIso2;

        @NotBlank(message = "Le code ISO3 est obligatoire")
        @Size(min = 3, max = 3, message = "Le code ISO3 doit avoir 3 caractères")
        private String codeIso3;

        @Size(max = 3)
        private String codeNumeric;

        @NotBlank(message = "Le nom en français est obligatoire")
        private String nameFr;

        @NotBlank(message = "Le nom en anglais est obligatoire")
        private String nameEn;

        private String nationalityFr;
        private String nationalityEn;
        private String region;
        private String subRegion;
        private Country.EconomicZone economicZone;
        private Boolean isCemac = false;
        private UUID defaultCurrencyId;
    }

    @Data
    public static class UpdateRequest {
        private String nameFr;
        private String nameEn;
        private String nationalityFr;
        private String nationalityEn;
        private String region;
        private String subRegion;
        private Country.EconomicZone economicZone;
        private Boolean isCemac;
        private Boolean isActive;
        private UUID defaultCurrencyId;
    }

    @Data
    public static class Summary {
        private UUID id;
        private String codeIso2;
        private String codeIso3;
        private String nameFr;
        private String nameEn;
        private Boolean isCemac;
    }
}
