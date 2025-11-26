package cm.guce.notification.domain.port;

import cm.guce.notification.domain.model.Notification;
import cm.guce.notification.domain.model.Notification.NotificationChannel;
import cm.guce.notification.domain.model.Notification.NotificationStatus;
import cm.guce.notification.domain.model.Notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Notification entity operations
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Find notifications for a recipient
     */
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    /**
     * Find notifications by tenant
     */
    Page<Notification> findByTenantIdOrderByCreatedAtDesc(UUID tenantId, Pageable pageable);

    /**
     * Find notifications by status
     */
    List<Notification> findByStatusOrderByPriorityDescCreatedAtAsc(NotificationStatus status);

    /**
     * Find pending notifications for sending
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' " +
           "AND (n.scheduledAt IS NULL OR n.scheduledAt <= :now) " +
           "ORDER BY n.priority DESC, n.createdAt ASC")
    List<Notification> findPendingNotifications(@Param("now") LocalDateTime now);

    /**
     * Find scheduled notifications
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'SCHEDULED' " +
           "AND n.scheduledAt <= :now ORDER BY n.scheduledAt ASC")
    List<Notification> findScheduledNotificationsToSend(@Param("now") LocalDateTime now);

    /**
     * Find failed notifications for retry
     */
    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' " +
           "AND n.retryCount < n.maxRetries ORDER BY n.failedAt ASC")
    List<Notification> findNotificationsForRetry();

    /**
     * Find unread notifications for a user
     */
    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId " +
           "AND n.readAt IS NULL AND n.status IN ('SENT', 'DELIVERED') " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByRecipient(@Param("recipientId") UUID recipientId, Pageable pageable);

    /**
     * Count unread notifications for a user
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :recipientId " +
           "AND n.readAt IS NULL AND n.status IN ('SENT', 'DELIVERED')")
    long countUnreadByRecipient(@Param("recipientId") UUID recipientId);

    /**
     * Find notifications by channel
     */
    Page<Notification> findByTenantIdAndChannel(UUID tenantId, NotificationChannel channel, Pageable pageable);

    /**
     * Find notifications by type
     */
    Page<Notification> findByTenantIdAndType(UUID tenantId, NotificationType type, Pageable pageable);

    /**
     * Find notifications linked to an entity
     */
    List<Notification> findByLinkedEntityTypeAndLinkedEntityId(String linkedEntityType, UUID linkedEntityId);

    /**
     * Mark notifications as read
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt " +
           "WHERE n.id IN :ids AND n.recipientId = :recipientId")
    int markAsRead(@Param("ids") List<UUID> ids, @Param("recipientId") UUID recipientId, @Param("readAt") LocalDateTime readAt);

    /**
     * Mark all notifications as read for a recipient
     */
    @Modifying
    @Query("UPDATE Notification n SET n.status = 'READ', n.readAt = :readAt " +
           "WHERE n.recipientId = :recipientId AND n.readAt IS NULL")
    int markAllAsRead(@Param("recipientId") UUID recipientId, @Param("readAt") LocalDateTime readAt);

    /**
     * Count notifications by status for a tenant
     */
    long countByTenantIdAndStatus(UUID tenantId, NotificationStatus status);

    /**
     * Find notifications within a date range
     */
    @Query("SELECT n FROM Notification n WHERE n.tenantId = :tenantId " +
           "AND n.createdAt BETWEEN :startDate AND :endDate")
    Page<Notification> findByTenantIdAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Get notification statistics
     */
    @Query("SELECT n.channel, n.status, COUNT(n) FROM Notification n " +
           "WHERE n.tenantId = :tenantId AND n.createdAt >= :since " +
           "GROUP BY n.channel, n.status")
    List<Object[]> getNotificationStatistics(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);

    /**
     * Delete old notifications
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :before AND n.status IN ('READ', 'CANCELLED')")
    int deleteOldNotifications(@Param("before") LocalDateTime before);
}
