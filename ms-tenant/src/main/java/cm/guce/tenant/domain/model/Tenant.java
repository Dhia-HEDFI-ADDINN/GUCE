package cm.guce.tenant.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entite Tenant - Represente une instance GUCE deployee.
 *
 * Chaque tenant est une installation complete et isolee du systeme GUCE
 * pour un pays ou une organisation specifique.
 */
@Entity
@Table(name = "tenant", indexes = {
    @Index(name = "idx_tenant_code", columnList = "code", unique = true),
    @Index(name = "idx_tenant_domain", columnList = "domain", unique = true),
    @Index(name = "idx_tenant_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(name = "domain", nullable = false, unique = true)
    private String domain;

    @Column(name = "country", length = 3)
    private String country;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "locale", length = 10)
    private String locale;

    @Column(name = "currency", length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TenantStatus status = TenantStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "environment")
    private TenantEnvironment environment = TenantEnvironment.DEVELOPMENT;

    // Configuration technique
    @Column(name = "high_availability")
    private Boolean highAvailability = false;

    @Column(name = "auto_scaling_enabled")
    private Boolean autoScalingEnabled = false;

    @Column(name = "min_replicas")
    private Integer minReplicas = 1;

    @Column(name = "max_replicas")
    private Integer maxReplicas = 3;

    @Column(name = "backup_enabled")
    private Boolean backupEnabled = true;

    @Column(name = "backup_frequency")
    private String backupFrequency = "DAILY";

    @Column(name = "backup_retention_days")
    private Integer backupRetentionDays = 30;

    // Infrastructure
    @Embedded
    private TenantInfrastructure infrastructure;

    // Modules actives
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TenantModule> modules = new ArrayList<>();

    // Administrateurs initiaux
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TenantAdmin> initialAdmins = new ArrayList<>();

    // Ressources deployees
    @Column(name = "keycloak_realm_id")
    private String keycloakRealmId;

    @Column(name = "database_name")
    private String databaseName;

    @Column(name = "database_host")
    private String databaseHost;

    @Column(name = "database_port")
    private Integer databasePort;

    @Column(name = "frontend_url")
    private String frontendUrl;

    @Column(name = "backend_url")
    private String backendUrl;

    @Column(name = "gateway_url")
    private String gatewayUrl;

    // Metriques
    @Column(name = "last_health_check")
    private LocalDateTime lastHealthCheck;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status")
    private HealthStatus healthStatus = HealthStatus.UNKNOWN;

    @Column(name = "uptime_percentage")
    private Double uptimePercentage;

    @Column(name = "active_users")
    private Integer activeUsers = 0;

    @Column(name = "total_transactions")
    private Long totalTransactions = 0L;

    // Audit
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "deployed_at")
    private LocalDateTime deployedAt;

    @Column(name = "deployed_by")
    private String deployedBy;

    @Column(name = "stopped_at")
    private LocalDateTime stoppedAt;

    @Column(name = "deployment_error")
    private String deploymentError;

    // Enums
    public enum TenantStatus {
        PENDING,        // En attente de deploiement
        PROVISIONING,   // Provisionnement en cours
        DEPLOYING,      // Deploiement en cours
        RUNNING,        // Instance active
        STOPPED,        // Instance arretee
        MAINTENANCE,    // En maintenance
        ERROR,          // Erreur de deploiement
        TERMINATED      // Instance terminee
    }

    public enum TenantEnvironment {
        DEVELOPMENT,
        STAGING,
        PRODUCTION
    }

    public enum HealthStatus {
        HEALTHY,
        DEGRADED,
        UNHEALTHY,
        UNKNOWN
    }

    // Helper methods
    public void addModule(TenantModule module) {
        modules.add(module);
        module.setTenant(this);
    }

    public void removeModule(TenantModule module) {
        modules.remove(module);
        module.setTenant(null);
    }

    public void addAdmin(TenantAdmin admin) {
        initialAdmins.add(admin);
        admin.setTenant(this);
    }

    public boolean isModuleEnabled(String moduleName) {
        return modules.stream()
            .anyMatch(m -> m.getName().equalsIgnoreCase(moduleName) && m.getEnabled());
    }
}
