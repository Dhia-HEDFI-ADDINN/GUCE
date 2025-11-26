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
 * Notification template for reusable notification content
 */
@Entity
@Table(name = "notification_templates", indexes = {
    @Index(name = "idx_template_code", columnList = "code"),
    @Index(name = "idx_template_channel", columnList = "channel"),
    @Index(name = "idx_template_tenant", columnList = "tenant_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "tenant_id")
    private UUID tenantId; // null = global template

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Notification.NotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Notification.NotificationType type;

    @Column(name = "subject_template", nullable = false)
    private String subjectTemplate;

    @Column(name = "content_template", columnDefinition = "TEXT", nullable = false)
    private String contentTemplate;

    @Column(name = "html_template", columnDefinition = "TEXT")
    private String htmlTemplate;

    @Column(nullable = false)
    @Builder.Default
    private String locale = "fr";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "available_variables", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> availableVariables = new HashMap<>();

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "is_system")
    @Builder.Default
    private boolean system = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
