package cm.guce.notification.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Notification entity representing a notification message
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_tenant", columnList = "tenant_id"),
    @Index(name = "idx_notification_recipient", columnList = "recipient_id"),
    @Index(name = "idx_notification_status", columnList = "status"),
    @Index(name = "idx_notification_channel", columnList = "channel"),
    @Index(name = "idx_notification_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "recipient_id")
    private UUID recipientId;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "device_token")
    private String deviceToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.NORMAL;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "html_content", columnDefinition = "TEXT")
    private String htmlContent;

    @Column(name = "template_id")
    private String templateId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_data", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> templateData = new HashMap<>();

    @Column(name = "linked_entity_type")
    private String linkedEntityType;

    @Column(name = "linked_entity_id")
    private UUID linkedEntityId;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "failed_at")
    private LocalDateTime failedAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "retry_count")
    @Builder.Default
    private int retryCount = 0;

    @Column(name = "max_retries")
    @Builder.Default
    private int maxRetries = 3;

    @Column(name = "external_id")
    private String externalId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Notification channels
     */
    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH,
        WEBSOCKET,
        IN_APP
    }

    /**
     * Notification types
     */
    public enum NotificationType {
        // System notifications
        SYSTEM_ALERT,
        SYSTEM_MAINTENANCE,

        // User notifications
        ACCOUNT_CREATED,
        PASSWORD_RESET,
        PASSWORD_CHANGED,
        EMAIL_VERIFICATION,

        // Declaration notifications
        DECLARATION_SUBMITTED,
        DECLARATION_VALIDATED,
        DECLARATION_REJECTED,
        DECLARATION_PENDING_ACTION,

        // Workflow notifications
        TASK_ASSIGNED,
        TASK_COMPLETED,
        TASK_REMINDER,
        PROCESS_COMPLETED,

        // Payment notifications
        PAYMENT_RECEIVED,
        PAYMENT_FAILED,
        PAYMENT_REMINDER,
        INVOICE_GENERATED,

        // Document notifications
        DOCUMENT_UPLOADED,
        DOCUMENT_VALIDATED,
        DOCUMENT_EXPIRED,

        // Tenant notifications
        TENANT_CREATED,
        TENANT_SUSPENDED,
        TENANT_ACTIVATED,
        INSTANCE_DEPLOYED,

        // General
        ANNOUNCEMENT,
        REMINDER,
        CUSTOM
    }

    /**
     * Notification status
     */
    public enum NotificationStatus {
        PENDING,
        SCHEDULED,
        SENDING,
        SENT,
        DELIVERED,
        READ,
        FAILED,
        CANCELLED
    }

    /**
     * Notification priority
     */
    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
}
