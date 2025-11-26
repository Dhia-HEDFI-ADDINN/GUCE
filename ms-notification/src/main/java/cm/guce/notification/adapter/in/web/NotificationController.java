package cm.guce.notification.adapter.in.web;

import cm.guce.notification.application.NotificationService;
import cm.guce.notification.domain.model.Notification;
import cm.guce.notification.domain.model.Notification.*;
import cm.guce.notification.domain.model.NotificationTemplate;
import cm.guce.notification.domain.port.NotificationRepository;
import cm.guce.notification.domain.port.NotificationTemplateRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Notification Management
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Notification Management API")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;

    @PostMapping("/send")
    @Operation(summary = "Send a notification")
    public ResponseEntity<Notification> sendNotification(
            @RequestBody SendNotificationRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        Notification notification = notificationService.sendNotification(
            request.getTenantId(),
            request.getRecipientId(),
            request.getChannel(),
            request.getType(),
            request.getTemplateCode(),
            request.getTemplateData(),
            request.getRecipientContact(),
            request.getPriority()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @PostMapping("/send-direct")
    @Operation(summary = "Send a direct notification without template")
    public ResponseEntity<Notification> sendDirectNotification(
            @RequestBody SendDirectNotificationRequest request) {

        Notification notification = notificationService.sendDirectNotification(
            request.getTenantId(),
            request.getRecipientId(),
            request.getChannel(),
            request.getType(),
            request.getSubject(),
            request.getContent(),
            request.getHtmlContent(),
            request.getRecipientContact(),
            request.getPriority()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @PostMapping("/schedule")
    @Operation(summary = "Schedule a notification")
    public ResponseEntity<Notification> scheduleNotification(
            @RequestBody ScheduleNotificationRequest request) {

        Notification notification = notificationService.scheduleNotification(
            request.getTenantId(),
            request.getRecipientId(),
            request.getChannel(),
            request.getType(),
            request.getTemplateCode(),
            request.getTemplateData(),
            request.getRecipientContact(),
            request.getScheduledAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @GetMapping("/my")
    @Operation(summary = "Get my notifications")
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable) {

        UUID userId = UUID.fromString(jwt.getSubject());
        Page<Notification> notifications = notificationService.getNotificationsForUser(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/my/unread")
    @Operation(summary = "Get my unread notifications")
    public ResponseEntity<Page<Notification>> getMyUnreadNotifications(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable) {

        UUID userId = UUID.fromString(jwt.getSubject());
        Page<Notification> notifications = notificationService.getUnreadNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/my/unread/count")
    @Operation(summary = "Count my unread notifications")
    public ResponseEntity<Map<String, Long>> countUnread(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PostMapping("/my/read")
    @Operation(summary = "Mark notifications as read")
    public ResponseEntity<Map<String, Integer>> markAsRead(
            @RequestBody List<UUID> notificationIds,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());
        int count = notificationService.markAsRead(notificationIds, userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }

    @PostMapping("/my/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }

    @GetMapping("/{notificationId}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<Notification> getNotification(@PathVariable UUID notificationId) {
        return notificationRepository.findById(notificationId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{notificationId}/cancel")
    @Operation(summary = "Cancel a pending notification")
    public ResponseEntity<Notification> cancelNotification(@PathVariable UUID notificationId) {
        try {
            Notification cancelled = notificationService.cancelNotification(notificationId);
            return ResponseEntity.ok(cancelled);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/tenant/{tenantId}")
    @Operation(summary = "List notifications for a tenant")
    public ResponseEntity<Page<Notification>> listByTenant(
            @PathVariable UUID tenantId,
            @RequestParam(required = false) NotificationChannel channel,
            @RequestParam(required = false) NotificationType type,
            Pageable pageable) {

        Page<Notification> notifications;
        if (channel != null) {
            notifications = notificationRepository.findByTenantIdAndChannel(tenantId, channel, pageable);
        } else if (type != null) {
            notifications = notificationRepository.findByTenantIdAndType(tenantId, type, pageable);
        } else {
            notifications = notificationRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/tenant/{tenantId}/stats")
    @Operation(summary = "Get notification statistics for a tenant")
    public ResponseEntity<Map<String, Object>> getStats(
            @PathVariable UUID tenantId,
            @RequestParam(defaultValue = "24") int hoursBack) {

        LocalDateTime since = LocalDateTime.now().minusHours(hoursBack);
        List<Object[]> stats = notificationRepository.getNotificationStatistics(tenantId, since);

        Map<String, Object> result = new HashMap<>();
        result.put("period", hoursBack + " hours");
        result.put("since", since.toString());

        Map<String, Map<String, Long>> byChannelAndStatus = new HashMap<>();
        for (Object[] row : stats) {
            String channel = ((NotificationChannel) row[0]).name();
            String status = ((NotificationStatus) row[1]).name();
            Long count = (Long) row[2];

            byChannelAndStatus.computeIfAbsent(channel, k -> new HashMap<>())
                .put(status, count);
        }
        result.put("statistics", byChannelAndStatus);

        // Add totals
        result.put("pendingCount", notificationRepository.countByTenantIdAndStatus(tenantId, NotificationStatus.PENDING));
        result.put("sentCount", notificationRepository.countByTenantIdAndStatus(tenantId, NotificationStatus.SENT));
        result.put("failedCount", notificationRepository.countByTenantIdAndStatus(tenantId, NotificationStatus.FAILED));

        return ResponseEntity.ok(result);
    }

    // ========== Template Management ==========

    @GetMapping("/templates")
    @Operation(summary = "List notification templates")
    public ResponseEntity<List<NotificationTemplate>> listTemplates(
            @RequestParam(required = false) UUID tenantId) {

        List<NotificationTemplate> templates;
        if (tenantId != null) {
            templates = templateRepository.findAllForTenant(tenantId);
        } else {
            templates = templateRepository.findBySystemTrueAndActiveTrue();
        }
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/templates/{templateId}")
    @Operation(summary = "Get template by ID")
    public ResponseEntity<NotificationTemplate> getTemplate(@PathVariable UUID templateId) {
        return templateRepository.findById(templateId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/templates")
    @Operation(summary = "Create a notification template")
    public ResponseEntity<NotificationTemplate> createTemplate(
            @RequestBody NotificationTemplate template,
            @AuthenticationPrincipal Jwt jwt) {

        template.setCreatedBy(UUID.fromString(jwt.getSubject()));
        NotificationTemplate saved = templateRepository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/templates/{templateId}")
    @Operation(summary = "Update a notification template")
    public ResponseEntity<NotificationTemplate> updateTemplate(
            @PathVariable UUID templateId,
            @RequestBody NotificationTemplate template) {

        return templateRepository.findById(templateId)
            .map(existing -> {
                existing.setName(template.getName());
                existing.setDescription(template.getDescription());
                existing.setSubjectTemplate(template.getSubjectTemplate());
                existing.setContentTemplate(template.getContentTemplate());
                existing.setHtmlTemplate(template.getHtmlTemplate());
                existing.setAvailableVariables(template.getAvailableVariables());
                existing.setActive(template.isActive());
                return ResponseEntity.ok(templateRepository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/templates/{templateId}")
    @Operation(summary = "Delete a notification template")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID templateId) {
        return templateRepository.findById(templateId)
            .map(template -> {
                if (template.isSystem()) {
                    return ResponseEntity.badRequest().<Void>build();
                }
                template.setActive(false);
                templateRepository.save(template);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ========== DTOs ==========

    @lombok.Data
    public static class SendNotificationRequest {
        private UUID tenantId;
        private UUID recipientId;
        private NotificationChannel channel;
        private NotificationType type;
        private String templateCode;
        private Map<String, Object> templateData;
        private String recipientContact;
        private NotificationPriority priority;
    }

    @lombok.Data
    public static class SendDirectNotificationRequest {
        private UUID tenantId;
        private UUID recipientId;
        private NotificationChannel channel;
        private NotificationType type;
        private String subject;
        private String content;
        private String htmlContent;
        private String recipientContact;
        private NotificationPriority priority;
    }

    @lombok.Data
    public static class ScheduleNotificationRequest {
        private UUID tenantId;
        private UUID recipientId;
        private NotificationChannel channel;
        private NotificationType type;
        private String templateCode;
        private Map<String, Object> templateData;
        private String recipientContact;
        private LocalDateTime scheduledAt;
    }
}
