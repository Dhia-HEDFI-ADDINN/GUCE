package cm.guce.audit.domain.port;

import cm.guce.audit.domain.model.AuditLog;
import cm.guce.audit.domain.model.AuditLog.AuditAction;
import cm.guce.audit.domain.model.AuditLog.AuditCategory;
import cm.guce.audit.domain.model.AuditLog.AuditStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for AuditLog entity operations
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    /**
     * Find audit logs by tenant
     */
    Page<AuditLog> findByTenantIdOrderByTimestampDesc(UUID tenantId, Pageable pageable);

    /**
     * Find audit logs by user
     */
    Page<AuditLog> findByUserIdOrderByTimestampDesc(UUID userId, Pageable pageable);

    /**
     * Find audit logs by entity
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);

    /**
     * Find audit logs by action
     */
    Page<AuditLog> findByTenantIdAndActionOrderByTimestampDesc(UUID tenantId, AuditAction action, Pageable pageable);

    /**
     * Find audit logs by category
     */
    Page<AuditLog> findByTenantIdAndCategoryOrderByTimestampDesc(UUID tenantId, AuditCategory category, Pageable pageable);

    /**
     * Find audit logs by service
     */
    Page<AuditLog> findByServiceNameOrderByTimestampDesc(String serviceName, Pageable pageable);

    /**
     * Find audit logs within date range
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndDateRange(
        @Param("tenantId") UUID tenantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Find failed operations
     */
    Page<AuditLog> findByTenantIdAndStatusOrderByTimestampDesc(UUID tenantId, AuditStatus status, Pageable pageable);

    /**
     * Search audit logs
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND (LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.entityName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(a.userName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> searchAuditLogs(
        @Param("tenantId") UUID tenantId,
        @Param("query") String query,
        Pageable pageable
    );

    /**
     * Find security-related events
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.category IN ('AUTHENTICATION', 'AUTHORIZATION', 'SECURITY') " +
           "AND a.timestamp >= :since ORDER BY a.timestamp DESC")
    Page<AuditLog> findSecurityEvents(
        @Param("tenantId") UUID tenantId,
        @Param("since") LocalDateTime since,
        Pageable pageable
    );

    /**
     * Find login attempts for a user
     */
    @Query("SELECT a FROM AuditLog a WHERE a.userId = :userId " +
           "AND a.action IN ('LOGIN', 'LOGIN_FAILED', 'LOGOUT') " +
           "ORDER BY a.timestamp DESC")
    List<AuditLog> findLoginHistory(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Count actions by type for statistics
     */
    @Query("SELECT a.action, COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.timestamp >= :since GROUP BY a.action")
    List<Object[]> countByAction(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);

    /**
     * Count by category
     */
    @Query("SELECT a.category, COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.timestamp >= :since GROUP BY a.category")
    List<Object[]> countByCategory(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);

    /**
     * Count by status
     */
    @Query("SELECT a.status, COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.timestamp >= :since GROUP BY a.status")
    List<Object[]> countByStatus(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);

    /**
     * Get daily activity count
     */
    @Query("SELECT CAST(a.timestamp AS date), COUNT(a) FROM AuditLog a " +
           "WHERE a.tenantId = :tenantId AND a.timestamp >= :since " +
           "GROUP BY CAST(a.timestamp AS date) ORDER BY CAST(a.timestamp AS date)")
    List<Object[]> getDailyActivityCount(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since);

    /**
     * Find most active users
     */
    @Query("SELECT a.userId, a.userName, COUNT(a) FROM AuditLog a " +
           "WHERE a.tenantId = :tenantId AND a.timestamp >= :since AND a.userId IS NOT NULL " +
           "GROUP BY a.userId, a.userName ORDER BY COUNT(a) DESC")
    List<Object[]> findMostActiveUsers(@Param("tenantId") UUID tenantId, @Param("since") LocalDateTime since, Pageable pageable);

    /**
     * Delete old audit logs
     */
    @Query("DELETE FROM AuditLog a WHERE a.timestamp < :before")
    int deleteOldAuditLogs(@Param("before") LocalDateTime before);
}
