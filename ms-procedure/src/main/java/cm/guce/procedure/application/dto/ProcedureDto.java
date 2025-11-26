package cm.guce.procedure.application.dto;

import cm.guce.common.application.dto.BaseDto;
import cm.guce.procedure.domain.model.Procedure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.UUID;

/**
 * DTOs pour les procédures.
 */
public class ProcedureDto {

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Response extends BaseDto {
        private String code;
        private String nameFr;
        private String nameEn;
        private String descriptionFr;
        private String descriptionEn;
        private Procedure.ProcedureCategory category;
        private Procedure.ProcedureType procedureType;
        private String bpmnProcessId;
        private String dmnDecisionId;
        private String icon;
        private String color;
        private Integer expectedDurationHours;
        private Integer maxDurationHours;
        private Boolean requiresPayment;
        private Boolean requiresSignature;
        private Boolean isActive;
        private Integer versionNumber;
        private Integer publishedVersion;
        private Procedure.ProcedureStatus status;
        private List<StepSummary> steps;
        private List<FormSummary> forms;
        private List<DocumentSummary> requiredDocuments;
    }

    @Data
    public static class Summary {
        private UUID id;
        private String code;
        private String nameFr;
        private String nameEn;
        private String descriptionFr;
        private Procedure.ProcedureCategory category;
        private Procedure.ProcedureType procedureType;
        private String icon;
        private String color;
        private Integer expectedDurationHours;
        private Boolean requiresPayment;
        private Procedure.ProcedureStatus status;
        private Integer stepsCount;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Le code est obligatoire")
        @Size(max = 50)
        private String code;

        @NotBlank(message = "Le nom en français est obligatoire")
        private String nameFr;

        private String nameEn;
        private String descriptionFr;
        private String descriptionEn;

        @NotNull(message = "La catégorie est obligatoire")
        private Procedure.ProcedureCategory category;

        @NotNull(message = "Le type de procédure est obligatoire")
        private Procedure.ProcedureType procedureType;

        private String icon;
        private String color;
        private Integer expectedDurationHours;
        private Integer maxDurationHours;
        private Boolean requiresPayment = false;
        private Boolean requiresSignature = false;
    }

    @Data
    public static class UpdateRequest {
        private String nameFr;
        private String nameEn;
        private String descriptionFr;
        private String descriptionEn;
        private String bpmnProcessId;
        private String bpmnDefinition;
        private String dmnDecisionId;
        private String icon;
        private String color;
        private Integer expectedDurationHours;
        private Integer maxDurationHours;
        private Boolean requiresPayment;
        private Boolean requiresSignature;
        private Boolean isActive;
    }

    @Data
    public static class StepSummary {
        private UUID id;
        private String code;
        private String nameFr;
        private String nameEn;
        private Integer orderIndex;
        private String stepType;
        private String candidateGroups;
        private Integer dueDurationHours;
        private Boolean isOptional;
    }

    @Data
    public static class FormSummary {
        private UUID id;
        private String code;
        private String nameFr;
        private String formType;
        private Integer fieldsCount;
    }

    @Data
    public static class DocumentSummary {
        private UUID id;
        private String documentTypeCode;
        private String nameFr;
        private Boolean isMandatory;
        private Integer maxFiles;
    }
}
