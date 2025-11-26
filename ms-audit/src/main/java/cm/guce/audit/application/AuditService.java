package cm.guce.audit.application;

import cm.guce.audit.domain.model.AuditLog;
import cm.guce.audit.domain.model.AuditLog.*;
import cm.guce.audit.domain.port.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for audit log operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Record an audit event
     */
    @Transactional
    public AuditLog record(AuditLog auditLog) {
        if (auditLog.getTimestamp() == null) {
            auditLog.setTimestamp(LocalDateTime.now());
        }
        AuditLog saved = auditLogRepository.save(auditLog);
        log.debug("Audit log recorded: {} - {} on {}",
            auditLog.getAction(), auditLog.getEntityType(), auditLog.getEntityId());
        return saved;
    }

    /**
     * Record an audit event asynchronously
     */
    @Async
    public void recordAsync(AuditLog auditLog) {
        record(auditLog);
    }

    /**
     * Create and record an audit log
     */
    @Transactional
    public AuditLog recordAction(
            UUID tenantId,
            UUID userId,
            String userName,
            String userEmail,
            AuditAction action,
            AuditCategory category,
            String entityType,
            String entityId,
            String entityName,
            String serviceName,
            String description,
            Map<String, Object> oldValue,
            Map<String, Object> newValue,
            String ipAddress,
            String requestId) {

        // Calculate changes
        Map<String, Object> changes = calculateChanges(oldValue, newValue);

        AuditLog auditLog = AuditLog.builder()
            .tenantId(tenantId)
            .userId(userId)
            .userName(userName)
            .userEmail(userEmail)
            .action(action)
            .category(category)
            .entityType(entityType)
            .entityId(entityId)
            .entityName(entityName)
            .serviceName(serviceName)
            .description(description)
            .oldValue(oldValue)
            .newValue(newValue)
            .changes(changes)
            .ipAddress(ipAddress)
            .requestId(requestId)
            .status(AuditStatus.SUCCESS)
            .timestamp(LocalDateTime.now())
            .build();

        return record(auditLog);
    }

    /**
     * Record a failed operation
     */
    @Transactional
    public AuditLog recordFailure(
            UUID tenantId,
            UUID userId,
            AuditAction action,
            AuditCategory category,
            String entityType,
            String entityId,
            String serviceName,
            String errorMessage,
            String ipAddress,
            String requestId) {

        AuditLog auditLog = AuditLog.builder()
            .tenantId(tenantId)
            .userId(userId)
            .action(action)
            .category(category)
            .entityType(entityType)
            .entityId(entityId)
            .serviceName(serviceName)
            .status(AuditStatus.FAILURE)
            .errorMessage(errorMessage)
            .ipAddress(ipAddress)
            .requestId(requestId)
            .timestamp(LocalDateTime.now())
            .build();

        return record(auditLog);
    }

    /**
     * Listen for audit events from Kafka
     */
    @KafkaListener(topics = "audit-events", groupId = "ms-audit")
    public void handleAuditEvent(Map<String, Object> event) {
        try {
            AuditLog auditLog = mapEventToAuditLog(event);
            record(auditLog);
        } catch (Exception e) {
            log.error("Failed to process audit event", e);
        }
    }

    /**
     * Get audit logs for a tenant
     */
    public Page<AuditLog> getAuditLogs(UUID tenantId, Pageable pageable) {
        return auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId, pageable);
    }

    /**
     * Get audit logs for a user
     */
    public Page<AuditLog> getAuditLogsByUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    /**
     * Get audit logs for an entity
     */
    public List<AuditLog> getEntityHistory(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    /**
     * Search audit logs
     */
    public Page<AuditLog> searchAuditLogs(UUID tenantId, String query, Pageable pageable) {
        return auditLogRepository.searchAuditLogs(tenantId, query, pageable);
    }

    /**
     * Get security events
     */
    public Page<AuditLog> getSecurityEvents(UUID tenantId, int hoursBack, Pageable pageable) {
        LocalDateTime since = LocalDateTime.now().minusHours(hoursBack);
        return auditLogRepository.findSecurityEvents(tenantId, since, pageable);
    }

    /**
     * Get login history for a user
     */
    public List<AuditLog> getLoginHistory(UUID userId, int limit) {
        return auditLogRepository.findLoginHistory(userId, PageRequest.of(0, limit));
    }

    /**
     * Get audit statistics
     */
    public Map<String, Object> getStatistics(UUID tenantId, int daysBack) {
        LocalDateTime since = LocalDateTime.now().minusDays(daysBack);
        Map<String, Object> stats = new HashMap<>();

        // Count by action
        Map<String, Long> byAction = new HashMap<>();
        auditLogRepository.countByAction(tenantId, since).forEach(row ->
            byAction.put(((AuditAction) row[0]).name(), (Long) row[1]));
        stats.put("byAction", byAction);

        // Count by category
        Map<String, Long> byCategory = new HashMap<>();
        auditLogRepository.countByCategory(tenantId, since).forEach(row ->
            byCategory.put(((AuditCategory) row[0]).name(), (Long) row[1]));
        stats.put("byCategory", byCategory);

        // Count by status
        Map<String, Long> byStatus = new HashMap<>();
        auditLogRepository.countByStatus(tenantId, since).forEach(row ->
            byStatus.put(((AuditStatus) row[0]).name(), (Long) row[1]));
        stats.put("byStatus", byStatus);

        // Daily activity
        List<Map<String, Object>> dailyActivity = new ArrayList<>();
        auditLogRepository.getDailyActivityCount(tenantId, since).forEach(row -> {
            Map<String, Object> day = new HashMap<>();
            day.put("date", row[0].toString());
            day.put("count", row[1]);
            dailyActivity.add(day);
        });
        stats.put("dailyActivity", dailyActivity);

        // Most active users
        List<Map<String, Object>> activeUsers = new ArrayList<>();
        auditLogRepository.findMostActiveUsers(tenantId, since, PageRequest.of(0, 10)).forEach(row -> {
            Map<String, Object> user = new HashMap<>();
            user.put("userId", row[0]);
            user.put("userName", row[1]);
            user.put("actionCount", row[2]);
            activeUsers.add(user);
        });
        stats.put("mostActiveUsers", activeUsers);

        stats.put("period", daysBack + " days");
        stats.put("since", since.toString());

        return stats;
    }

    /**
     * Cleanup old audit logs
     */
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2 AM
    @Transactional
    public void cleanupOldLogs() {
        // Keep logs for 2 years by default
        LocalDateTime cutoff = LocalDateTime.now().minusYears(2);
        int deleted = auditLogRepository.deleteOldAuditLogs(cutoff);
        log.info("Deleted {} old audit logs older than {}", deleted, cutoff);
    }

    /**
     * Calculate changes between old and new values
     */
    private Map<String, Object> calculateChanges(Map<String, Object> oldValue, Map<String, Object> newValue) {
        if (oldValue == null || newValue == null) {
            return null;
        }

        Map<String, Object> changes = new HashMap<>();
        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(oldValue.keySet());
        allKeys.addAll(newValue.keySet());

        for (String key : allKeys) {
            Object oldVal = oldValue.get(key);
            Object newVal = newValue.get(key);

            if (!Objects.equals(oldVal, newVal)) {
                Map<String, Object> change = new HashMap<>();
                change.put("old", oldVal);
                change.put("new", newVal);
                changes.put(key, change);
            }
        }

        return changes.isEmpty() ? null : changes;
    }

    /**
     * Map Kafka event to AuditLog
     */
    @SuppressWarnings("unchecked")
    private AuditLog mapEventToAuditLog(Map<String, Object> event) {
        return AuditLog.builder()
            .tenantId(event.get("tenantId") != null ? UUID.fromString(event.get("tenantId").toString()) : null)
            .userId(event.get("userId") != null ? UUID.fromString(event.get("userId").toString()) : null)
            .userName((String) event.get("userName"))
            .userEmail((String) event.get("userEmail"))
            .action(AuditAction.valueOf((String) event.get("action")))
            .category(AuditCategory.valueOf((String) event.get("category")))
            .entityType((String) event.get("entityType"))
            .entityId((String) event.get("entityId"))
            .entityName((String) event.get("entityName"))
            .serviceName((String) event.get("serviceName"))
            .description((String) event.get("description"))
            .oldValue((Map<String, Object>) event.get("oldValue"))
            .newValue((Map<String, Object>) event.get("newValue"))
            .ipAddress((String) event.get("ipAddress"))
            .requestId((String) event.get("requestId"))
            .status(event.get("status") != null ? AuditStatus.valueOf((String) event.get("status")) : AuditStatus.SUCCESS)
            .errorMessage((String) event.get("errorMessage"))
            .timestamp(LocalDateTime.now())
            .build();
    }
}
