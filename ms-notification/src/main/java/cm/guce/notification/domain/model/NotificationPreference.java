package cm.guce.notification.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User notification preferences
 */
@Entity
@Table(name = "notification_preferences", indexes = {
    @Index(name = "idx_pref_user", columnList = "user_id"),
    @Index(name = "idx_pref_tenant", columnList = "tenant_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    // Channel preferences
    @Column(name = "email_enabled")
    @Builder.Default
    private boolean emailEnabled = true;

    @Column(name = "sms_enabled")
    @Builder.Default
    private boolean smsEnabled = true;

    @Column(name = "push_enabled")
    @Builder.Default
    private boolean pushEnabled = true;

    @Column(name = "in_app_enabled")
    @Builder.Default
    private boolean inAppEnabled = true;

    // Type preferences
    @Column(name = "system_alerts")
    @Builder.Default
    private boolean systemAlerts = true;

    @Column(name = "task_notifications")
    @Builder.Default
    private boolean taskNotifications = true;

    @Column(name = "declaration_updates")
    @Builder.Default
    private boolean declarationUpdates = true;

    @Column(name = "payment_notifications")
    @Builder.Default
    private boolean paymentNotifications = true;

    @Column(name = "document_notifications")
    @Builder.Default
    private boolean documentNotifications = true;

    @Column(name = "marketing_emails")
    @Builder.Default
    private boolean marketingEmails = false;

    // Quiet hours
    @Column(name = "quiet_hours_enabled")
    @Builder.Default
    private boolean quietHoursEnabled = false;

    @Column(name = "quiet_hours_start")
    private String quietHoursStart; // HH:mm format

    @Column(name = "quiet_hours_end")
    private String quietHoursEnd; // HH:mm format

    // Digest preferences
    @Column(name = "email_digest_enabled")
    @Builder.Default
    private boolean emailDigestEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "digest_frequency")
    @Builder.Default
    private DigestFrequency digestFrequency = DigestFrequency.DAILY;

    @Column(name = "preferred_language")
    @Builder.Default
    private String preferredLanguage = "fr";

    @Column(name = "timezone")
    @Builder.Default
    private String timezone = "Africa/Douala";

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

    public enum DigestFrequency {
        HOURLY,
        DAILY,
        WEEKLY
    }
}
