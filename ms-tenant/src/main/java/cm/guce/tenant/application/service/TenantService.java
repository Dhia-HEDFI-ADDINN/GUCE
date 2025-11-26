package cm.guce.tenant.application.service;

import cm.guce.tenant.application.dto.TenantDto;
import cm.guce.tenant.application.mapper.TenantMapper;
import cm.guce.tenant.domain.model.Tenant;
import cm.guce.tenant.domain.model.TenantAdmin;
import cm.guce.tenant.domain.model.TenantInfrastructure;
import cm.guce.tenant.domain.model.TenantModule;
import cm.guce.tenant.domain.port.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service principal de gestion des tenants.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantMapper tenantMapper;
    private final DeploymentService deploymentService;

    /**
     * Recupere tous les tenants.
     */
    public List<TenantDto.Summary> findAll() {
        log.debug("Fetching all tenants");
        return tenantMapper.toSummaryList(tenantRepository.findAll());
    }

    /**
     * Recupere les tenants actifs (RUNNING ou MAINTENANCE).
     */
    public List<TenantDto.Summary> findAllActive() {
        log.debug("Fetching active tenants");
        return tenantMapper.toSummaryList(tenantRepository.findAllActive());
    }

    /**
     * Recupere les tenants par statut.
     */
    public List<TenantDto.Summary> findByStatus(Tenant.TenantStatus status) {
        log.debug("Fetching tenants by status: {}", status);
        return tenantMapper.toSummaryList(tenantRepository.findByStatus(status));
    }

    /**
     * Recherche de tenants.
     */
    public Page<TenantDto.Summary> search(String query, Pageable pageable) {
        log.debug("Searching tenants with query: {}", query);
        return tenantRepository.search(query, pageable).map(tenantMapper::toSummary);
    }

    /**
     * Recupere un tenant par ID.
     */
    public TenantDto.Response findById(UUID id) {
        log.debug("Fetching tenant by id: {}", id);
        Tenant tenant = tenantRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new TenantNotFoundException(id));
        return tenantMapper.toResponse(tenant);
    }

    /**
     * Recupere un tenant par code.
     */
    public TenantDto.Response findByCode(String code) {
        log.debug("Fetching tenant by code: {}", code);
        Tenant tenant = tenantRepository.findByCode(code)
            .orElseThrow(() -> new TenantNotFoundException(code));
        return tenantMapper.toResponse(tenant);
    }

    /**
     * Cree un nouveau tenant.
     */
    @Transactional
    public TenantDto.Response create(TenantDto.CreateRequest request) {
        log.info("Creating tenant: {} ({})", request.getName(), request.getCode());

        // Validation
        validateCreate(request);

        // Creer l'entite tenant
        Tenant tenant = tenantMapper.toEntity(request);

        // Configurer l'infrastructure
        if (request.getInfrastructure() != null) {
            TenantInfrastructure infra = tenantMapper.toInfrastructure(request.getInfrastructure());
            infra.setKubernetesNamespace("guce-" + request.getCode().toLowerCase());
            tenant.setInfrastructure(infra);
        } else {
            TenantInfrastructure defaultInfra = new TenantInfrastructure();
            defaultInfra.setKubernetesNamespace("guce-" + request.getCode().toLowerCase());
            tenant.setInfrastructure(defaultInfra);
        }

        // Configurer la base de donnees
        tenant.setDatabaseName("guce_" + request.getCode().toLowerCase());

        // Ajouter les modules
        if (request.getModules() != null) {
            List<TenantModule> modules = tenantMapper.mapModules(request.getModules());
            modules.forEach(tenant::addModule);
        }

        // Ajouter les administrateurs initiaux
        if (request.getInitialAdmins() != null && !request.getInitialAdmins().isEmpty()) {
            for (TenantDto.AdminRequest adminReq : request.getInitialAdmins()) {
                TenantAdmin admin = tenantMapper.toAdminEntity(adminReq);
                tenant.addAdmin(admin);
            }
        }

        // Generer les URLs
        String baseUrl = generateBaseUrl(request.getDomain(), tenant.getEnvironment());
        tenant.setFrontendUrl(baseUrl);
        tenant.setBackendUrl(baseUrl + "/api");
        tenant.setGatewayUrl(baseUrl + "/gateway");

        tenant = tenantRepository.save(tenant);
        log.info("Tenant created with id: {}", tenant.getId());

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Met a jour un tenant.
     */
    @Transactional
    public TenantDto.Response update(UUID id, TenantDto.UpdateRequest request) {
        log.info("Updating tenant: {}", id);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        tenantMapper.updateEntity(request, tenant);
        tenant = tenantRepository.save(tenant);

        log.info("Tenant updated: {}", tenant.getId());
        return tenantMapper.toResponse(tenant);
    }

    /**
     * Deploie un tenant.
     */
    @Transactional
    public TenantDto.Response deploy(UUID id, TenantDto.DeployRequest request) {
        log.info("Deploying tenant: {}", id);

        Tenant tenant = tenantRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        if (tenant.getStatus() == Tenant.TenantStatus.RUNNING) {
            throw new TenantOperationException("Le tenant est deja en cours d'execution");
        }

        tenant.setStatus(Tenant.TenantStatus.PROVISIONING);
        tenant = tenantRepository.save(tenant);

        // Lancer le deploiement asynchrone
        deploymentService.deployAsync(tenant.getId());

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Demarre un tenant.
     */
    @Transactional
    public TenantDto.Response start(UUID id) {
        log.info("Starting tenant: {}", id);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        if (tenant.getStatus() == Tenant.TenantStatus.RUNNING) {
            throw new TenantOperationException("Le tenant est deja en cours d'execution");
        }

        if (tenant.getStatus() == Tenant.TenantStatus.PENDING) {
            throw new TenantOperationException("Le tenant n'a pas encore ete deploye");
        }

        deploymentService.startTenant(tenant);

        tenant.setStatus(Tenant.TenantStatus.RUNNING);
        tenant = tenantRepository.save(tenant);

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Arrete un tenant.
     */
    @Transactional
    public TenantDto.Response stop(UUID id) {
        log.info("Stopping tenant: {}", id);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        if (tenant.getStatus() != Tenant.TenantStatus.RUNNING &&
            tenant.getStatus() != Tenant.TenantStatus.MAINTENANCE) {
            throw new TenantOperationException("Le tenant n'est pas en cours d'execution");
        }

        deploymentService.stopTenant(tenant);

        tenant.setStatus(Tenant.TenantStatus.STOPPED);
        tenant.setStoppedAt(LocalDateTime.now());
        tenant = tenantRepository.save(tenant);

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Redemarrre un tenant.
     */
    @Transactional
    public TenantDto.Response restart(UUID id) {
        log.info("Restarting tenant: {}", id);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        if (tenant.getStatus() != Tenant.TenantStatus.RUNNING) {
            throw new TenantOperationException("Le tenant doit etre en cours d'execution pour redemarrer");
        }

        deploymentService.restartTenant(tenant);

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Met un tenant en maintenance.
     */
    @Transactional
    public TenantDto.Response setMaintenance(UUID id, boolean enabled) {
        log.info("Setting maintenance mode for tenant {}: {}", id, enabled);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        if (enabled) {
            tenant.setStatus(Tenant.TenantStatus.MAINTENANCE);
        } else {
            tenant.setStatus(Tenant.TenantStatus.RUNNING);
        }

        tenant = tenantRepository.save(tenant);
        return tenantMapper.toResponse(tenant);
    }

    /**
     * Met a jour les modules d'un tenant.
     */
    @Transactional
    public TenantDto.Response updateModules(UUID id, TenantDto.ModulesConfig modulesConfig) {
        log.info("Updating modules for tenant: {}", id);

        Tenant tenant = tenantRepository.findByIdWithModules(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        // Clear existing modules and add new ones
        tenant.getModules().clear();
        List<TenantModule> modules = tenantMapper.mapModules(modulesConfig);
        modules.forEach(tenant::addModule);

        tenant = tenantRepository.save(tenant);

        // Si le tenant est en cours d'execution, appliquer les changements
        if (tenant.getStatus() == Tenant.TenantStatus.RUNNING) {
            deploymentService.updateModules(tenant);
        }

        return tenantMapper.toResponse(tenant);
    }

    /**
     * Supprime un tenant.
     */
    @Transactional
    public void delete(UUID id) {
        log.info("Deleting tenant: {}", id);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new TenantNotFoundException(id));

        if (tenant.getStatus() == Tenant.TenantStatus.RUNNING) {
            throw new TenantOperationException("Arretez le tenant avant de le supprimer");
        }

        // Nettoyer les ressources deployees
        deploymentService.cleanup(tenant);

        tenantRepository.delete(tenant);
        log.info("Tenant deleted: {}", id);
    }

    /**
     * Obtient les statistiques du hub.
     */
    public TenantDto.HubStats getHubStats() {
        TenantDto.HubStats stats = new TenantDto.HubStats();

        stats.setTotalTenants(tenantRepository.count());
        stats.setRunningTenants(tenantRepository.countByStatus(Tenant.TenantStatus.RUNNING));
        stats.setStoppedTenants(tenantRepository.countByStatus(Tenant.TenantStatus.STOPPED));
        stats.setErrorTenants(tenantRepository.countByStatus(Tenant.TenantStatus.ERROR));

        List<Tenant> healthyTenants = tenantRepository.findByHealthStatus(Tenant.HealthStatus.HEALTHY);
        List<Tenant> degradedTenants = tenantRepository.findByHealthStatus(Tenant.HealthStatus.DEGRADED);

        stats.setHealthyTenants((long) healthyTenants.size());
        stats.setDegradedTenants((long) degradedTenants.size());

        Long totalUsers = tenantRepository.getTotalActiveUsers();
        Long totalTx = tenantRepository.getTotalTransactions();

        stats.setTotalActiveUsers(totalUsers != null ? totalUsers : 0L);
        stats.setTotalTransactions(totalTx != null ? totalTx : 0L);
        stats.setLastUpdated(LocalDateTime.now());

        return stats;
    }

    // --- Validation ---

    private void validateCreate(TenantDto.CreateRequest request) {
        if (tenantRepository.existsByCode(request.getCode())) {
            throw new TenantValidationException("code", "Ce code de tenant existe deja");
        }
        if (tenantRepository.existsByDomain(request.getDomain())) {
            throw new TenantValidationException("domain", "Ce domaine est deja utilise");
        }
    }

    private String generateBaseUrl(String domain, Tenant.TenantEnvironment env) {
        String protocol = env == Tenant.TenantEnvironment.PRODUCTION ? "https" : "http";
        String prefix = switch (env) {
            case DEVELOPMENT -> "dev.";
            case STAGING -> "staging.";
            case PRODUCTION -> "";
        };
        return protocol + "://" + prefix + domain;
    }

    // --- Exceptions ---

    public static class TenantNotFoundException extends RuntimeException {
        public TenantNotFoundException(UUID id) {
            super("Tenant non trouve: " + id);
        }
        public TenantNotFoundException(String code) {
            super("Tenant non trouve avec le code: " + code);
        }
    }

    public static class TenantOperationException extends RuntimeException {
        public TenantOperationException(String message) {
            super(message);
        }
    }

    public static class TenantValidationException extends RuntimeException {
        private final String field;

        public TenantValidationException(String field, String message) {
            super(message);
            this.field = field;
        }

        public String getField() {
            return field;
        }
    }
}
