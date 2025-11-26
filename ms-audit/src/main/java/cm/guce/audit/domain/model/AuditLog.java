package cm.guce.audit.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Audit log entry for tracking all platform activities
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_tenant", columnList = "tenant_id"),
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_service", columnList = "service_name"),
    @Index(name = "idx_audit_category", columnList = "category")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_name")
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditCategory category;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "entity_name")
    private String entityName;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_value", columnDefinition = "jsonb")
    private Map<String, Object> oldValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private Map<String, Object> newValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "changes", columnDefinition = "jsonb")
    private Map<String, Object> changes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "request_id")
    private String requestId;

    @Column(name = "session_id")
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AuditStatus status = AuditStatus.SUCCESS;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column
    private Long duration; // milliseconds

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    /**
     * Audit actions
     */
    public enum AuditAction {
        // CRUD operations
        CREATE,
        READ,
        UPDATE,
        DELETE,

        // Authentication
        LOGIN,
        LOGOUT,
        LOGIN_FAILED,
        PASSWORD_RESET,
        PASSWORD_CHANGED,
        MFA_ENABLED,
        MFA_DISABLED,

        // Authorization
        ACCESS_GRANTED,
        ACCESS_DENIED,
        PERMISSION_CHANGED,
        ROLE_ASSIGNED,
        ROLE_REVOKED,

        // Data operations
        EXPORT,
        IMPORT,
        DOWNLOAD,
        UPLOAD,
        ARCHIVE,
        RESTORE,

        // Workflow
        WORKFLOW_STARTED,
        WORKFLOW_COMPLETED,
        WORKFLOW_CANCELLED,
        TASK_ASSIGNED,
        TASK_COMPLETED,
        TASK_REJECTED,

        // System
        CONFIGURATION_CHANGED,
        SYSTEM_STARTUP,
        SYSTEM_SHUTDOWN,
        MAINTENANCE_STARTED,
        MAINTENANCE_COMPLETED,

        // Business operations
        DECLARATION_SUBMITTED,
        DECLARATION_VALIDATED,
        DECLARATION_REJECTED,
        PAYMENT_PROCESSED,
        PAYMENT_FAILED,
        DOCUMENT_SIGNED,
        CERTIFICATE_ISSUED,

        // Tenant operations
        TENANT_CREATED,
        TENANT_ACTIVATED,
        TENANT_SUSPENDED,
        TENANT_DELETED,
        INSTANCE_DEPLOYED,
        INSTANCE_UPDATED
    }

    /**
     * Audit categories
     */
    public enum AuditCategory {
        AUTHENTICATION,
        AUTHORIZATION,
        USER_MANAGEMENT,
        DATA_ACCESS,
        DATA_MODIFICATION,
        WORKFLOW,
        PAYMENT,
        DOCUMENT,
        DECLARATION,
        SYSTEM,
        SECURITY,
        CONFIGURATION,
        TENANT_MANAGEMENT
    }

    /**
     * Audit status
     */
    public enum AuditStatus {
        SUCCESS,
        FAILURE,
        PARTIAL,
        PENDING
    }
}
