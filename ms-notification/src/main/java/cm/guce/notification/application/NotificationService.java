package cm.guce.notification.application;

import cm.guce.notification.adapter.out.email.EmailSender;
import cm.guce.notification.adapter.out.push.PushNotificationSender;
import cm.guce.notification.adapter.out.sms.SmsSender;
import cm.guce.notification.domain.model.Notification;
import cm.guce.notification.domain.model.Notification.*;
import cm.guce.notification.domain.model.NotificationTemplate;
import cm.guce.notification.domain.port.NotificationRepository;
import cm.guce.notification.domain.port.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for notification operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    private final EmailSender emailSender;
    private final SmsSender smsSender;
    private final PushNotificationSender pushSender;
    private final TemplateEngine templateEngine;

    /**
     * Send a notification using a template
     */
    @Transactional
    public Notification sendNotification(
            UUID tenantId,
            UUID recipientId,
            NotificationChannel channel,
            NotificationType type,
            String templateCode,
            Map<String, Object> templateData,
            String recipientContact,
            NotificationPriority priority) {

        // Find template
        NotificationTemplate template = findTemplate(templateCode, tenantId, channel, type, "fr");

        // Process template
        String subject = processTemplate(template.getSubjectTemplate(), templateData);
        String content = processTemplate(template.getContentTemplate(), templateData);
        String htmlContent = template.getHtmlTemplate() != null
            ? processTemplate(template.getHtmlTemplate(), templateData)
            : null;

        // Create notification
        Notification notification = Notification.builder()
            .tenantId(tenantId)
            .recipientId(recipientId)
            .channel(channel)
            .type(type)
            .priority(priority != null ? priority : NotificationPriority.NORMAL)
            .subject(subject)
            .content(content)
            .htmlContent(htmlContent)
            .templateId(templateCode)
            .templateData(templateData)
            .status(NotificationStatus.PENDING)
            .build();

        // Set recipient contact based on channel
        switch (channel) {
            case EMAIL -> notification.setRecipientEmail(recipientContact);
            case SMS -> notification.setRecipientPhone(recipientContact);
            case PUSH -> notification.setDeviceToken(recipientContact);
        }

        notification = notificationRepository.save(notification);

        // Send asynchronously
        sendAsync(notification);

        return notification;
    }

    /**
     * Send a direct notification without template
     */
    @Transactional
    public Notification sendDirectNotification(
            UUID tenantId,
            UUID recipientId,
            NotificationChannel channel,
            NotificationType type,
            String subject,
            String content,
            String htmlContent,
            String recipientContact,
            NotificationPriority priority) {

        Notification notification = Notification.builder()
            .tenantId(tenantId)
            .recipientId(recipientId)
            .channel(channel)
            .type(type)
            .priority(priority != null ? priority : NotificationPriority.NORMAL)
            .subject(subject)
            .content(content)
            .htmlContent(htmlContent)
            .status(NotificationStatus.PENDING)
            .build();

        switch (channel) {
            case EMAIL -> notification.setRecipientEmail(recipientContact);
            case SMS -> notification.setRecipientPhone(recipientContact);
            case PUSH -> notification.setDeviceToken(recipientContact);
        }

        notification = notificationRepository.save(notification);
        sendAsync(notification);

        return notification;
    }

    /**
     * Schedule a notification for later
     */
    @Transactional
    public Notification scheduleNotification(
            UUID tenantId,
            UUID recipientId,
            NotificationChannel channel,
            NotificationType type,
            String templateCode,
            Map<String, Object> templateData,
            String recipientContact,
            LocalDateTime scheduledAt) {

        NotificationTemplate template = findTemplate(templateCode, tenantId, channel, type, "fr");

        String subject = processTemplate(template.getSubjectTemplate(), templateData);
        String content = processTemplate(template.getContentTemplate(), templateData);

        Notification notification = Notification.builder()
            .tenantId(tenantId)
            .recipientId(recipientId)
            .channel(channel)
            .type(type)
            .subject(subject)
            .content(content)
            .templateId(templateCode)
            .templateData(templateData)
            .status(NotificationStatus.SCHEDULED)
            .scheduledAt(scheduledAt)
            .build();

        switch (channel) {
            case EMAIL -> notification.setRecipientEmail(recipientContact);
            case SMS -> notification.setRecipientPhone(recipientContact);
            case PUSH -> notification.setDeviceToken(recipientContact);
        }

        return notificationRepository.save(notification);
    }

    /**
     * Send notification asynchronously
     */
    @Async
    public void sendAsync(Notification notification) {
        try {
            notification.setStatus(NotificationStatus.SENDING);
            notificationRepository.save(notification);

            boolean success = switch (notification.getChannel()) {
                case EMAIL -> emailSender.send(
                    notification.getRecipientEmail(),
                    notification.getSubject(),
                    notification.getContent(),
                    notification.getHtmlContent()
                );
                case SMS -> smsSender.send(
                    notification.getRecipientPhone(),
                    notification.getContent()
                );
                case PUSH -> pushSender.send(
                    notification.getDeviceToken(),
                    notification.getSubject(),
                    notification.getContent(),
                    notification.getMetadata()
                );
                case WEBSOCKET, IN_APP -> true; // Handled differently
            };

            if (success) {
                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
                log.info("Notification sent successfully: {} via {}",
                    notification.getId(), notification.getChannel());
            } else {
                handleFailure(notification, "Send operation returned false");
            }

        } catch (Exception e) {
            handleFailure(notification, e.getMessage());
        }

        notificationRepository.save(notification);
    }

    private void handleFailure(Notification notification, String errorMessage) {
        notification.setRetryCount(notification.getRetryCount() + 1);
        notification.setErrorMessage(errorMessage);
        notification.setFailedAt(LocalDateTime.now());

        if (notification.getRetryCount() >= notification.getMaxRetries()) {
            notification.setStatus(NotificationStatus.FAILED);
            log.error("Notification failed after {} retries: {}",
                notification.getMaxRetries(), notification.getId());
        } else {
            notification.setStatus(NotificationStatus.PENDING);
            log.warn("Notification failed, will retry: {} (attempt {}/{})",
                notification.getId(), notification.getRetryCount(), notification.getMaxRetries());
        }
    }

    /**
     * Process scheduled notifications
     */
    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void processScheduledNotifications() {
        List<Notification> scheduled = notificationRepository.findScheduledNotificationsToSend(LocalDateTime.now());
        for (Notification notification : scheduled) {
            notification.setStatus(NotificationStatus.PENDING);
            notificationRepository.save(notification);
            sendAsync(notification);
        }
    }

    /**
     * Retry failed notifications
     */
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void retryFailedNotifications() {
        List<Notification> failed = notificationRepository.findNotificationsForRetry();
        for (Notification notification : failed) {
            sendAsync(notification);
        }
    }

    /**
     * Get notifications for a user
     */
    public Page<Notification> getNotificationsForUser(UUID recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable);
    }

    /**
     * Get unread notifications for a user
     */
    public Page<Notification> getUnreadNotifications(UUID recipientId, Pageable pageable) {
        return notificationRepository.findUnreadByRecipient(recipientId, pageable);
    }

    /**
     * Count unread notifications
     */
    public long countUnread(UUID recipientId) {
        return notificationRepository.countUnreadByRecipient(recipientId);
    }

    /**
     * Mark notifications as read
     */
    @Transactional
    public int markAsRead(List<UUID> notificationIds, UUID recipientId) {
        return notificationRepository.markAsRead(notificationIds, recipientId, LocalDateTime.now());
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public int markAllAsRead(UUID recipientId) {
        return notificationRepository.markAllAsRead(recipientId, LocalDateTime.now());
    }

    /**
     * Cancel a notification
     */
    @Transactional
    public Notification cancelNotification(UUID notificationId) {
        return notificationRepository.findById(notificationId)
            .map(notification -> {
                if (notification.getStatus() == NotificationStatus.PENDING
                    || notification.getStatus() == NotificationStatus.SCHEDULED) {
                    notification.setStatus(NotificationStatus.CANCELLED);
                    return notificationRepository.save(notification);
                }
                throw new IllegalStateException("Cannot cancel notification in status: " + notification.getStatus());
            })
            .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    private NotificationTemplate findTemplate(String code, UUID tenantId,
            NotificationChannel channel, NotificationType type, String locale) {

        if (code != null) {
            List<NotificationTemplate> templates = templateRepository.findByCodeForTenant(code, tenantId);
            if (!templates.isEmpty()) {
                return templates.get(0);
            }
        }

        List<NotificationTemplate> templates = templateRepository.findByTypeChannelLocale(
            type, channel, locale, tenantId);

        if (!templates.isEmpty()) {
            return templates.get(0);
        }

        throw new RuntimeException("No template found for type: " + type + ", channel: " + channel);
    }

    private String processTemplate(String template, Map<String, Object> data) {
        if (template == null || data == null) {
            return template;
        }

        Context context = new Context();
        data.forEach(context::setVariable);
        return templateEngine.process(template, context);
    }
}
