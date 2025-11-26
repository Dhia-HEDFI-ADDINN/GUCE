package cm.guce.procedure.application.dto;

import cm.guce.common.application.dto.BaseDto;
import cm.guce.common.domain.model.EntityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTOs pour les déclarations.
 */
public class DeclarationDto {

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class Response extends BaseDto {
        private String reference;
        private String procedureCode;
        private String procedureName;
        private UUID operatorId;
        private String operatorName;
        private String operatorNiu;
        private UUID declarantId;
        private String declarantName;
        private EntityStatus status;
        private String statusLabel;
        private String currentStep;
        private String currentStepName;
        private String processInstanceId;
        private Map<String, Object> data;
        private LocalDateTime submittedAt;
        private LocalDateTime completedAt;
        private LocalDateTime expectedCompletionDate;
        private BigDecimal totalAmount;
        private String currencyCode;
        private BigDecimal paidAmount;
        private Boolean isPaid;
        private String paymentReference;
        private String originCountryCode;
        private String destinationCountryCode;
        private String customsOfficeCode;
        private String customsRegimeCode;
        private String transportMode;
        private String assignedTo;
        private LocalDateTime assignedAt;
        private Integer priority;
        private Boolean isUrgent;
        private String rejectionReason;
        private String notes;
    }

    @Data
    public static class Summary {
        private UUID id;
        private String reference;
        private String procedureCode;
        private String procedureName;
        private String operatorName;
        private String operatorNiu;
        private EntityStatus status;
        private String statusLabel;
        private String currentStepName;
        private LocalDateTime submittedAt;
        private LocalDateTime expectedCompletionDate;
        private BigDecimal totalAmount;
        private String currencyCode;
        private Boolean isPaid;
        private Boolean isUrgent;
    }

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Le code de procédure est obligatoire")
        private String procedureCode;

        @NotNull(message = "L'ID de l'opérateur est obligatoire")
        private UUID operatorId;

        @NotBlank(message = "Le nom de l'opérateur est obligatoire")
        private String operatorName;

        private String operatorNiu;
        private UUID declarantId;
        private String declarantName;
        private Map<String, Object> data;
        private String originCountryCode;
        private String destinationCountryCode;
        private String customsOfficeCode;
        private String customsRegimeCode;
        private String transportMode;
        private Boolean isUrgent = false;
        private String notes;
    }

    @Data
    public static class UpdateRequest {
        private Map<String, Object> data;
        private String originCountryCode;
        private String destinationCountryCode;
        private String customsOfficeCode;
        private String customsRegimeCode;
        private String transportMode;
        private Boolean isUrgent;
        private String notes;
    }

    @Data
    public static class TaskAction {
        private String taskId;
        private String action;
        private String comment;
        private Map<String, Object> variables;
    }

    @Data
    public static class Statistics {
        private long totalDraft;
        private long totalSubmitted;
        private long totalInProgress;
        private long totalApproved;
        private long totalRejected;
        private long totalPendingPayment;
        private BigDecimal totalAmountCollected;
    }
}
