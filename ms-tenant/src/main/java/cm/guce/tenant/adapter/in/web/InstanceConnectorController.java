package cm.guce.tenant.adapter.in.web;

import cm.guce.tenant.application.service.TenantService;
import cm.guce.tenant.domain.model.Tenant;
import cm.guce.tenant.domain.port.TenantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller pour la communication Instance -> Hub.
 *
 * Ce controller recoit:
 * - Les metriques des instances
 * - Les statuts de sante
 * - Les alertes
 * - Les demandes de synchronisation
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/instances")
@RequiredArgsConstructor
@Tag(name = "Instance Connector", description = "API pour la communication Instance -> Hub")
public class InstanceConnectorController {

    private final TenantRepository tenantRepository;

    // ===== Instance Status & Metrics =====

    @PostMapping("/{code}/status")
    @Operation(summary = "Recoit le statut d'une instance")
    public ResponseEntity<Void> receiveInstanceStatus(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey,
            @RequestBody InstanceStatusRequest status) {

        log.debug("Received status from instance {}: {}", code, status.getStatus());

        tenantRepository.findByCode(code.toUpperCase()).ifPresent(tenant -> {
            // Update health status
            tenant.setLastHealthCheck(LocalDateTime.now());
            tenant.setHealthStatus(mapHealthStatus(status.getStatus()));

            if (status.getUptime() != null) {
                tenant.setUptimePercentage((double) status.getUptime() / (24 * 60 * 60 * 100));
            }

            tenantRepository.save(tenant);
        });

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/metrics")
    @Operation(summary = "Recoit les metriques d'une instance")
    public ResponseEntity<Void> receiveInstanceMetrics(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey,
            @RequestBody InstanceMetricsRequest metrics) {

        log.debug("Received metrics from instance {}: {} active users, {} transactions",
            code, metrics.getActiveUsers(), metrics.getTransactionsToday());

        tenantRepository.findByCode(code.toUpperCase()).ifPresent(tenant -> {
            tenant.setActiveUsers(metrics.getActiveUsers());
            tenant.setTotalTransactions(
                tenant.getTotalTransactions() + metrics.getTransactionsToday());
            tenant.setLastHealthCheck(LocalDateTime.now());
            tenantRepository.save(tenant);
        });

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/alerts")
    @Operation(summary = "Recoit les alertes d'une instance")
    public ResponseEntity<Void> receiveInstanceAlerts(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey,
            @RequestBody List<InstanceAlertRequest> alerts) {

        log.info("Received {} alerts from instance {}", alerts.size(), code);

        // Process alerts - in production, store in alerts table and notify
        for (InstanceAlertRequest alert : alerts) {
            log.warn("[{}] Alert: {} - {}", code, alert.getSeverity(), alert.getMessage());
        }

        // Update tenant health if critical alert
        boolean hasCritical = alerts.stream()
            .anyMatch(a -> "CRITICAL".equals(a.getSeverity()));

        if (hasCritical) {
            tenantRepository.findByCode(code.toUpperCase()).ifPresent(tenant -> {
                tenant.setHealthStatus(Tenant.HealthStatus.DEGRADED);
                tenantRepository.save(tenant);
            });
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{code}/events")
    @Operation(summary = "Recoit les evenements audit d'une instance")
    public ResponseEntity<Void> receiveInstanceEvents(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey,
            @RequestBody InstanceEventRequest event) {

        log.debug("[{}] Event: {} - {}", code, event.getType(), event.getAction());

        // Store event in audit log - in production, send to audit service
        // kafkaTemplate.send("audit.events", event);

        return ResponseEntity.ok().build();
    }

    // ===== Configuration & Sync =====

    @GetMapping("/{code}/config")
    @Operation(summary = "Retourne la configuration actuelle de l'instance")
    public ResponseEntity<InstanceConfigResponse> getInstanceConfig(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey) {

        return tenantRepository.findByCode(code.toUpperCase())
            .map(tenant -> {
                InstanceConfigResponse config = new InstanceConfigResponse();
                config.setCode(tenant.getCode());
                config.setName(tenant.getName());
                config.setStatus(tenant.getStatus().name());

                // Map modules
                config.setModules(tenant.getModules().stream()
                    .filter(m -> m.getEnabled())
                    .map(m -> new ModuleConfigResponse(m.getName(), m.getEnabled()))
                    .toList());

                return ResponseEntity.ok(config);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{code}/config/updates")
    @Operation(summary = "Verifie s'il y a des mises a jour de configuration")
    public ResponseEntity<ConfigUpdateResponse> checkConfigUpdates(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey) {

        ConfigUpdateResponse response = new ConfigUpdateResponse();
        response.setHasUpdates(false); // Default - no updates

        // In production, check for pending config changes
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{code}/license")
    @Operation(summary = "Retourne les informations de licence de l'instance")
    public ResponseEntity<LicenseInfoResponse> getLicenseInfo(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey) {

        return tenantRepository.findByCode(code.toUpperCase())
            .map(tenant -> {
                LicenseInfoResponse license = new LicenseInfoResponse();
                license.setValid(tenant.getStatus() != Tenant.TenantStatus.TERMINATED);
                license.setExpiresAt(null); // No expiration in this version
                license.setMaxUsers(-1); // Unlimited
                license.setModules(tenant.getModules().stream()
                    .filter(m -> m.getEnabled())
                    .map(m -> m.getName())
                    .toList());
                return ResponseEntity.ok(license);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{code}/update-request")
    @Operation(summary = "Demande de mise a jour de l'instance")
    public ResponseEntity<UpdateRequestResponse> requestUpdate(
            @PathVariable String code,
            @RequestHeader("X-Hub-Api-Key") String apiKey,
            @RequestBody UpdateRequestRequest request) {

        log.info("Update request from instance {}: {} - {}", code, request.getType(), request.getDetails());

        UpdateRequestResponse response = new UpdateRequestResponse();
        response.setRequestId(java.util.UUID.randomUUID().toString());
        response.setStatus("PENDING");
        response.setEstimatedTime("1-2 hours");

        return ResponseEntity.ok(response);
    }

    // ===== Health Check =====

    @GetMapping("/health")
    @Operation(summary = "Health check du Hub")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "version", "1.0.0",
            "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ===== Helper Methods =====

    private Tenant.HealthStatus mapHealthStatus(String status) {
        return switch (status.toUpperCase()) {
            case "RUNNING" -> Tenant.HealthStatus.HEALTHY;
            case "MAINTENANCE" -> Tenant.HealthStatus.DEGRADED;
            case "ERROR" -> Tenant.HealthStatus.UNHEALTHY;
            default -> Tenant.HealthStatus.UNKNOWN;
        };
    }

    // ===== DTOs =====

    @Data
    public static class InstanceStatusRequest {
        private String status;
        private String version;
        private Long uptime;
        private List<ServiceStatusRequest> services;
    }

    @Data
    public static class ServiceStatusRequest {
        private String name;
        private String status;
        private Integer responseTime;
    }

    @Data
    public static class InstanceMetricsRequest {
        private String timestamp;
        private Integer activeUsers;
        private Long transactionsToday;
        private Double avgResponseTime;
        private Double errorRate;
        private Double memoryUsage;
        private Double cpuUsage;
    }

    @Data
    public static class InstanceAlertRequest {
        private String severity;
        private String message;
        private String source;
        private String timestamp;
        private Map<String, Object> details;
    }

    @Data
    public static class InstanceEventRequest {
        private String type;
        private String action;
        private String userId;
        private Map<String, Object> details;
        private String timestamp;
    }

    @Data
    public static class InstanceConfigResponse {
        private String code;
        private String name;
        private String status;
        private List<ModuleConfigResponse> modules;
        private List<FeatureFlagResponse> features;
    }

    @Data
    public static class ModuleConfigResponse {
        private String name;
        private Boolean enabled;
        private String version;

        public ModuleConfigResponse(String name, Boolean enabled) {
            this.name = name;
            this.enabled = enabled;
        }
    }

    @Data
    public static class FeatureFlagResponse {
        private String name;
        private Boolean enabled;
    }

    @Data
    public static class ConfigUpdateResponse {
        private Boolean hasUpdates;
        private List<ModuleConfigResponse> modules;
        private List<FeatureFlagResponse> features;
        private List<String> referentials;
    }

    @Data
    public static class LicenseInfoResponse {
        private Boolean valid;
        private String expiresAt;
        private List<String> modules;
        private Integer maxUsers;
    }

    @Data
    public static class UpdateRequestRequest {
        private String type;
        private Map<String, Object> details;
    }

    @Data
    public static class UpdateRequestResponse {
        private String requestId;
        private String status;
        private String estimatedTime;
    }
}
