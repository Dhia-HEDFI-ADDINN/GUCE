package cm.guce.tenant.application.dto;

import cm.guce.tenant.domain.model.Tenant;
import cm.guce.tenant.domain.model.TenantAdmin;
import cm.guce.tenant.domain.model.TenantInfrastructure;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTOs pour la gestion des tenants.
 */
public class TenantDto {

    /**
     * Requete de creation d'un tenant.
     */
    @Data
    public static class CreateRequest {
        // Informations generales
        @NotBlank(message = "Le code est obligatoire")
        @Size(min = 2, max = 10, message = "Le code doit contenir entre 2 et 10 caracteres")
        private String code;

        @NotBlank(message = "Le nom est obligatoire")
        private String name;

        private String shortName;

        @NotBlank(message = "Le domaine est obligatoire")
        private String domain;

        @Size(min = 2, max = 3)
        private String country;

        private String logoUrl;
        private String primaryColor;
        private String secondaryColor;
        private String timezone;
        private String locale;
        private String currency;

        // Configuration technique
        @Valid
        private TechnicalConfig technical;

        // Modules
        @Valid
        private ModulesConfig modules;

        // Administrateurs initiaux
        @Valid
        private List<AdminRequest> initialAdmins;

        // Infrastructure
        @Valid
        private InfrastructureConfig infrastructure;
    }

    @Data
    public static class TechnicalConfig {
        private Tenant.TenantEnvironment environment = Tenant.TenantEnvironment.DEVELOPMENT;
        private Boolean highAvailability = false;
        private Boolean autoScaling = false;
        private Integer minReplicas = 1;
        private Integer maxReplicas = 3;
        private Boolean backupEnabled = true;
        private String backupFrequency = "DAILY";
        private Integer backupRetentionDays = 30;
    }

    @Data
    public static class ModulesConfig {
        private ModuleConfig eForce;
        private ModuleConfig eGov;
        private ModuleConfig eBusiness;
        private ModuleConfig ePayment;
        private ModuleConfig procedureBuilder;
        private ModuleConfig admin;
    }

    @Data
    public static class ModuleConfig {
        private Boolean enabled = false;
        private Map<String, Boolean> features;
    }

    @Data
    public static class AdminRequest {
        @NotBlank
        @Email
        private String email;

        private String firstName;
        private String lastName;

        @NotNull
        private TenantAdmin.AdminRole role;

        private String temporaryPassword;
    }

    @Data
    public static class InfrastructureConfig {
        private TenantInfrastructure.CloudProvider provider = TenantInfrastructure.CloudProvider.LOCAL;
        private String region;
        private String kubernetesVersion = "1.28";
        private String machineType = "standard-2";
        private Integer nodeCount = 3;
        private TenantInfrastructure.DatabaseType databaseType = TenantInfrastructure.DatabaseType.POSTGRESQL;
        private String databaseSize = "db-standard-1";
        private Integer storageSizeGb = 100;
    }

    /**
     * Reponse complete d'un tenant.
     */
    @Data
    public static class Response {
        private UUID id;
        private String code;
        private String name;
        private String shortName;
        private String domain;
        private String country;
        private String logoUrl;
        private String primaryColor;
        private String secondaryColor;
        private String timezone;
        private String locale;
        private String currency;
        private Tenant.TenantStatus status;
        private Tenant.TenantEnvironment environment;

        // Technical
        private Boolean highAvailability;
        private Boolean autoScalingEnabled;
        private Integer minReplicas;
        private Integer maxReplicas;
        private Boolean backupEnabled;
        private String backupFrequency;
        private Integer backupRetentionDays;

        // Infrastructure
        private InfrastructureResponse infrastructure;

        // Modules
        private List<ModuleResponse> modules;

        // Deployed resources
        private String keycloakRealmId;
        private String databaseName;
        private String frontendUrl;
        private String backendUrl;
        private String gatewayUrl;

        // Health
        private HealthResponse health;

        // Metrics
        private Integer activeUsers;
        private Long totalTransactions;

        // Audit
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String createdBy;
        private LocalDateTime deployedAt;
        private String deployedBy;
    }

    @Data
    public static class InfrastructureResponse {
        private TenantInfrastructure.CloudProvider provider;
        private String region;
        private String kubernetesVersion;
        private String kubernetesNamespace;
        private String machineType;
        private Integer nodeCount;
        private TenantInfrastructure.DatabaseType databaseType;
        private String databaseSize;
        private Integer storageSizeGb;
    }

    @Data
    public static class ModuleResponse {
        private String name;
        private String displayName;
        private Boolean enabled;
        private Map<String, Boolean> features;
    }

    @Data
    public static class HealthResponse {
        private Tenant.HealthStatus status;
        private Double uptimePercentage;
        private LocalDateTime lastCheck;
        private List<ServiceHealth> services;
    }

    @Data
    public static class ServiceHealth {
        private String name;
        private String status;
        private Integer responseTime;
    }

    /**
     * Resume d'un tenant pour les listes.
     */
    @Data
    public static class Summary {
        private UUID id;
        private String code;
        private String name;
        private String shortName;
        private String domain;
        private String country;
        private String primaryColor;
        private Tenant.TenantStatus status;
        private Tenant.HealthStatus healthStatus;
        private Integer activeUsers;
        private LocalDateTime createdAt;
    }

    /**
     * Requete de mise a jour.
     */
    @Data
    public static class UpdateRequest {
        private String name;
        private String shortName;
        private String logoUrl;
        private String primaryColor;
        private String secondaryColor;
        private String timezone;
        private String locale;
        private String currency;
        private Boolean highAvailability;
        private Boolean autoScalingEnabled;
        private Integer minReplicas;
        private Integer maxReplicas;
    }

    /**
     * Requete de deploiement.
     */
    @Data
    public static class DeployRequest {
        private Boolean skipHealthCheck = false;
        private Boolean forceDeploy = false;
        private String deploymentNotes;
    }

    /**
     * Statistiques du hub.
     */
    @Data
    public static class HubStats {
        private Long totalTenants;
        private Long runningTenants;
        private Long stoppedTenants;
        private Long errorTenants;
        private Long healthyTenants;
        private Long degradedTenants;
        private Long totalActiveUsers;
        private Long totalTransactions;
        private LocalDateTime lastUpdated;
    }
}
