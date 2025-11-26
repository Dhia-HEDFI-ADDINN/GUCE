package cm.guce.notification.domain.port;

import cm.guce.notification.domain.model.Notification.NotificationChannel;
import cm.guce.notification.domain.model.Notification.NotificationType;
import cm.guce.notification.domain.model.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for NotificationTemplate entity operations
 */
@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    /**
     * Find template by code
     */
    Optional<NotificationTemplate> findByCode(String code);

    /**
     * Find templates by channel
     */
    List<NotificationTemplate> findByChannelAndActiveTrue(NotificationChannel channel);

    /**
     * Find templates by type
     */
    List<NotificationTemplate> findByTypeAndActiveTrue(NotificationType type);

    /**
     * Find tenant-specific template or fallback to global
     */
    @Query("SELECT t FROM NotificationTemplate t WHERE t.code = :code " +
           "AND t.active = true AND (t.tenantId = :tenantId OR t.tenantId IS NULL) " +
           "ORDER BY t.tenantId DESC NULLS LAST")
    List<NotificationTemplate> findByCodeForTenant(@Param("code") String code, @Param("tenantId") UUID tenantId);

    /**
     * Find template by type, channel and locale
     */
    @Query("SELECT t FROM NotificationTemplate t WHERE t.type = :type " +
           "AND t.channel = :channel AND t.locale = :locale " +
           "AND t.active = true AND (t.tenantId = :tenantId OR t.tenantId IS NULL) " +
           "ORDER BY t.tenantId DESC NULLS LAST")
    List<NotificationTemplate> findByTypeChannelLocale(
        @Param("type") NotificationType type,
        @Param("channel") NotificationChannel channel,
        @Param("locale") String locale,
        @Param("tenantId") UUID tenantId
    );

    /**
     * Find all templates for a tenant including global templates
     */
    @Query("SELECT t FROM NotificationTemplate t WHERE t.active = true " +
           "AND (t.tenantId = :tenantId OR t.tenantId IS NULL)")
    List<NotificationTemplate> findAllForTenant(@Param("tenantId") UUID tenantId);

    /**
     * Find global system templates
     */
    List<NotificationTemplate> findBySystemTrueAndActiveTrue();

    /**
     * Check if template code exists
     */
    boolean existsByCode(String code);
}
