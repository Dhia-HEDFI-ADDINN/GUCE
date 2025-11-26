package cm.guce.audit.adapter.in.web;

import cm.guce.audit.application.AuditService;
import cm.guce.audit.domain.model.AuditLog;
import cm.guce.audit.domain.model.AuditLog.*;
import cm.guce.audit.domain.port.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Audit Management
 */
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit", description = "Audit Trail Management API")
public class AuditController {

    private final AuditService auditService;
    private final AuditLogRepository auditLogRepository;

    @PostMapping
    @Operation(summary = "Record an audit event")
    public ResponseEntity<AuditLog> recordAudit(@RequestBody AuditLogRequest request) {
        AuditLog auditLog = auditService.recordAction(
            request.getTenantId(),
            request.getUserId(),
            request.getUserName(),
            request.getUserEmail(),
            request.getAction(),
            request.getCategory(),
            request.getEntityType(),
            request.getEntityId(),
            request.getEntityName(),
            request.getServiceName(),
            request.getDescription(),
            request.getOldValue(),
            request.getNewValue(),
            request.getIpAddress(),
            request.getRequestId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(auditLog);
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "Get audit logs for a tenant")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) AuditCategory category,
            @RequestParam(required = false) AuditStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {

        Page<AuditLog> logs;
        if (startDate != null && endDate != null) {
            logs = auditLogRepository.findByTenantIdAndDateRange(tenantId, startDate, endDate, pageable);
        } else if (action != null) {
            logs = auditLogRepository.findByTenantIdAndActionOrderByTimestampDesc(tenantId, action, pageable);
        } else if (category != null) {
            logs = auditLogRepository.findByTenantIdAndCategoryOrderByTimestampDesc(tenantId, category, pageable);
        } else if (status != null) {
            logs = auditLogRepository.findByTenantIdAndStatusOrderByTimestampDesc(tenantId, status, pageable);
        } else {
            logs = auditService.getAuditLogs(tenantId, pageable);
        }

        return ResponseEntity.ok(logs);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get audit logs for a user")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByUser(
            @PathVariable UUID userId,
            Pageable pageable) {
        Page<AuditLog> logs = auditService.getAuditLogsByUser(userId, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get audit history for an entity")
    public ResponseEntity<List<AuditLog>> getEntityHistory(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        List<AuditLog> history = auditService.getEntityHistory(entityType, entityId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/search")
    @Operation(summary = "Search audit logs")
    public ResponseEntity<Page<AuditLog>> searchAuditLogs(
            @RequestParam UUID tenantId,
            @RequestParam String query,
            Pageable pageable) {
        Page<AuditLog> logs = auditService.searchAuditLogs(tenantId, query, pageable);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/security/{tenantId}")
    @Operation(summary = "Get security events")
    public ResponseEntity<Page<AuditLog>> getSecurityEvents(
            @PathVariable UUID tenantId,
            @RequestParam(defaultValue = "24") int hoursBack,
            Pageable pageable) {
        Page<AuditLog> events = auditService.getSecurityEvents(tenantId, hoursBack, pageable);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/login-history/{userId}")
    @Operation(summary = "Get login history for a user")
    public ResponseEntity<List<AuditLog>> getLoginHistory(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLog> history = auditService.getLoginHistory(userId, limit);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/my/login-history")
    @Operation(summary = "Get my login history")
    public ResponseEntity<List<AuditLog>> getMyLoginHistory(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "20") int limit) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<AuditLog> history = auditService.getLoginHistory(userId, limit);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/statistics/{tenantId}")
    @Operation(summary = "Get audit statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @PathVariable UUID tenantId,
            @RequestParam(defaultValue = "30") int daysBack) {
        Map<String, Object> stats = auditService.getStatistics(tenantId, daysBack);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{auditId}")
    @Operation(summary = "Get audit log by ID")
    public ResponseEntity<AuditLog> getAuditLog(@PathVariable UUID auditId) {
        return auditLogRepository.findById(auditId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/actions")
    @Operation(summary = "Get available audit actions")
    public ResponseEntity<AuditAction[]> getActions() {
        return ResponseEntity.ok(AuditAction.values());
    }

    @GetMapping("/categories")
    @Operation(summary = "Get available audit categories")
    public ResponseEntity<AuditCategory[]> getCategories() {
        return ResponseEntity.ok(AuditCategory.values());
    }

    // ========== DTOs ==========

    @lombok.Data
    public static class AuditLogRequest {
        private UUID tenantId;
        private UUID userId;
        private String userName;
        private String userEmail;
        private AuditAction action;
        private AuditCategory category;
        private String entityType;
        private String entityId;
        private String entityName;
        private String serviceName;
        private String description;
        private Map<String, Object> oldValue;
        private Map<String, Object> newValue;
        private String ipAddress;
        private String requestId;
    }
}
