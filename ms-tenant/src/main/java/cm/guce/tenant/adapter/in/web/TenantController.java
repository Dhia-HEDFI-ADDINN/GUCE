package cm.guce.tenant.adapter.in.web;

import cm.guce.tenant.application.dto.TenantDto;
import cm.guce.tenant.application.service.TenantService;
import cm.guce.tenant.domain.model.Tenant;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller REST pour la gestion des tenants.
 *
 * Expose les endpoints pour:
 * - CRUD des tenants
 * - Deploiement et cycle de vie
 * - Monitoring et metriques
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Gestion des instances GUCE")
public class TenantController {

    private final TenantService tenantService;

    // ===== CRUD Operations =====

    @GetMapping
    @Operation(summary = "Liste tous les tenants")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<List<TenantDto.Summary>> getAllTenants() {
        log.debug("REST request to get all tenants");
        return ResponseEntity.ok(tenantService.findAll());
    }

    @GetMapping("/active")
    @Operation(summary = "Liste les tenants actifs")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<List<TenantDto.Summary>> getActiveTenants() {
        log.debug("REST request to get active tenants");
        return ResponseEntity.ok(tenantService.findAllActive());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Liste les tenants par statut")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<List<TenantDto.Summary>> getTenantsByStatus(
            @PathVariable Tenant.TenantStatus status) {
        log.debug("REST request to get tenants by status: {}", status);
        return ResponseEntity.ok(tenantService.findByStatus(status));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche des tenants")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<Page<TenantDto.Summary>> searchTenants(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        log.debug("REST request to search tenants: {}", query);
        return ResponseEntity.ok(tenantService.search(query, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Recupere un tenant par ID")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> getTenant(
            @PathVariable UUID id) {
        log.debug("REST request to get tenant: {}", id);
        return ResponseEntity.ok(tenantService.findById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Recupere un tenant par code")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> getTenantByCode(
            @PathVariable String code) {
        log.debug("REST request to get tenant by code: {}", code);
        return ResponseEntity.ok(tenantService.findByCode(code));
    }

    @PostMapping
    @Operation(summary = "Cree un nouveau tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'tenant-manager', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> createTenant(
            @Valid @RequestBody TenantDto.CreateRequest request) {
        log.info("REST request to create tenant: {}", request.getCode());
        TenantDto.Response response = tenantService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Met a jour un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'tenant-manager', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> updateTenant(
            @PathVariable UUID id,
            @Valid @RequestBody TenantDto.UpdateRequest request) {
        log.info("REST request to update tenant: {}", id);
        return ResponseEntity.ok(tenantService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un tenant")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTenant(@PathVariable UUID id) {
        log.info("REST request to delete tenant: {}", id);
        tenantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Lifecycle Operations =====

    @PostMapping("/{id}/deploy")
    @Operation(summary = "Deploie un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'generator-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> deployTenant(
            @PathVariable UUID id,
            @RequestBody(required = false) TenantDto.DeployRequest request) {
        log.info("REST request to deploy tenant: {}", id);
        if (request == null) {
            request = new TenantDto.DeployRequest();
        }
        return ResponseEntity.ok(tenantService.deploy(id, request));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Demarre un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> startTenant(@PathVariable UUID id) {
        log.info("REST request to start tenant: {}", id);
        return ResponseEntity.ok(tenantService.start(id));
    }

    @PostMapping("/{id}/stop")
    @Operation(summary = "Arrete un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> stopTenant(@PathVariable UUID id) {
        log.info("REST request to stop tenant: {}", id);
        return ResponseEntity.ok(tenantService.stop(id));
    }

    @PostMapping("/{id}/restart")
    @Operation(summary = "Redemarre un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> restartTenant(@PathVariable UUID id) {
        log.info("REST request to restart tenant: {}", id);
        return ResponseEntity.ok(tenantService.restart(id));
    }

    @PostMapping("/{id}/maintenance")
    @Operation(summary = "Active/Desactive le mode maintenance")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> setMaintenanceMode(
            @PathVariable UUID id,
            @RequestParam boolean enabled) {
        log.info("REST request to set maintenance mode for tenant {}: {}", id, enabled);
        return ResponseEntity.ok(tenantService.setMaintenance(id, enabled));
    }

    // ===== Module Management =====

    @PutMapping("/{id}/modules")
    @Operation(summary = "Met a jour les modules d'un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'tenant-manager', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> updateModules(
            @PathVariable UUID id,
            @Valid @RequestBody TenantDto.ModulesConfig modulesConfig) {
        log.info("REST request to update modules for tenant: {}", id);
        return ResponseEntity.ok(tenantService.updateModules(id, modulesConfig));
    }

    // ===== Metrics & Stats =====

    @GetMapping("/stats")
    @Operation(summary = "Statistiques globales du Hub")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'monitoring-viewer', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.HubStats> getHubStats() {
        log.debug("REST request to get hub stats");
        return ResponseEntity.ok(tenantService.getHubStats());
    }

    @GetMapping("/{id}/metrics")
    @Operation(summary = "Metriques d'un tenant")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'monitoring-viewer', 'SUPER_ADMIN')")
    public ResponseEntity<TenantDto.Response> getTenantMetrics(@PathVariable UUID id) {
        log.debug("REST request to get metrics for tenant: {}", id);
        return ResponseEntity.ok(tenantService.findById(id));
    }

    // ===== Compare =====

    @PostMapping("/compare")
    @Operation(summary = "Compare plusieurs tenants")
    @PreAuthorize("hasAnyRole('hub-admin', 'hub-operator', 'SUPER_ADMIN')")
    public ResponseEntity<List<TenantDto.Response>> compareTenants(
            @RequestBody List<UUID> tenantIds) {
        log.debug("REST request to compare tenants: {}", tenantIds);
        return ResponseEntity.ok(
            tenantIds.stream()
                .map(tenantService::findById)
                .toList()
        );
    }

    // ===== Exception Handlers =====

    @ExceptionHandler(TenantService.TenantNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(TenantService.TenantNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(TenantService.TenantOperationException.class)
    public ResponseEntity<ErrorResponse> handleOperationError(TenantService.TenantOperationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("OPERATION_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(TenantService.TenantValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(TenantService.TenantValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse("VALIDATION_ERROR", ex.getMessage(), ex.getField()));
    }

    public record ErrorResponse(String code, String message, String field) {
        public ErrorResponse(String code, String message) {
            this(code, message, null);
        }
    }
}
