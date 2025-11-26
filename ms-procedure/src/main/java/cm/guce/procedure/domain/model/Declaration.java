package cm.guce.procedure.domain.model;

import cm.guce.common.domain.model.BaseEntity;
import cm.guce.common.domain.model.EntityStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entité Déclaration - Instance d'une procédure soumise par un opérateur.
 */
@Entity
@Table(name = "declaration", indexes = {
        @Index(name = "idx_declaration_reference", columnList = "reference"),
        @Index(name = "idx_declaration_procedure", columnList = "procedure_id"),
        @Index(name = "idx_declaration_operator", columnList = "operator_id"),
        @Index(name = "idx_declaration_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Declaration extends BaseEntity {

    @Column(name = "reference", nullable = false, unique = true, length = 50)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @Column(name = "procedure_code", nullable = false)
    private String procedureCode;

    @Column(name = "operator_id", nullable = false)
    private UUID operatorId;

    @Column(name = "operator_name")
    private String operatorName;

    @Column(name = "operator_niu")
    private String operatorNiu;

    @Column(name = "declarant_id")
    private UUID declarantId;

    @Column(name = "declarant_name")
    private String declarantName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EntityStatus status = EntityStatus.DRAFT;

    @Column(name = "current_step")
    private String currentStep;

    @Column(name = "current_step_name")
    private String currentStepName;

    @Column(name = "process_instance_id")
    private String processInstanceId;

    @Column(name = "data_json", columnDefinition = "TEXT")
    private String dataJson;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "expected_completion_date")
    private LocalDateTime expectedCompletionDate;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "currency_code", length = 3)
    private String currencyCode = "XAF";

    @Column(name = "paid_amount", precision = 18, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "is_paid")
    private Boolean isPaid = false;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "origin_country_code", length = 3)
    private String originCountryCode;

    @Column(name = "destination_country_code", length = 3)
    private String destinationCountryCode;

    @Column(name = "customs_office_code")
    private String customsOfficeCode;

    @Column(name = "customs_regime_code", length = 4)
    private String customsRegimeCode;

    @Column(name = "transport_mode")
    private String transportMode;

    @Column(name = "assigned_to")
    private String assignedTo;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "priority")
    private Integer priority = 0;

    @Column(name = "is_urgent")
    private Boolean isUrgent = false;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Soumet la déclaration pour traitement.
     */
    public void submit() {
        this.status = EntityStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }

    /**
     * Valide la déclaration.
     */
    public void validate() {
        this.status = EntityStatus.VALIDATED;
    }

    /**
     * Approuve la déclaration.
     */
    public void approve() {
        this.status = EntityStatus.APPROVED;
        this.completedAt = LocalDateTime.now();
    }

    /**
     * Rejette la déclaration.
     */
    public void reject(String reason) {
        this.status = EntityStatus.REJECTED;
        this.rejectionReason = reason;
        this.completedAt = LocalDateTime.now();
    }
}
