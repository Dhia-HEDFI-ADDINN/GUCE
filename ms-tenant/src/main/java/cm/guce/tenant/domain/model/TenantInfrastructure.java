package cm.guce.tenant.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Configuration d'infrastructure pour un tenant.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class TenantInfrastructure {

    @Enumerated(EnumType.STRING)
    @Column(name = "cloud_provider")
    private CloudProvider cloudProvider = CloudProvider.LOCAL;

    @Column(name = "region")
    private String region;

    @Column(name = "kubernetes_version")
    private String kubernetesVersion = "1.28";

    @Column(name = "kubernetes_namespace")
    private String kubernetesNamespace;

    @Column(name = "machine_type")
    private String machineType = "standard-2";

    @Column(name = "node_count")
    private Integer nodeCount = 3;

    @Enumerated(EnumType.STRING)
    @Column(name = "database_type")
    private DatabaseType databaseType = DatabaseType.POSTGRESQL;

    @Column(name = "database_size")
    private String databaseSize = "db-standard-1";

    @Column(name = "storage_size_gb")
    private Integer storageSizeGb = 100;

    @Column(name = "cpu_request")
    private String cpuRequest = "500m";

    @Column(name = "cpu_limit")
    private String cpuLimit = "2000m";

    @Column(name = "memory_request")
    private String memoryRequest = "512Mi";

    @Column(name = "memory_limit")
    private String memoryLimit = "2048Mi";

    // Enums
    public enum CloudProvider {
        LOCAL,          // Docker Compose local
        OVH,
        AWS,
        GOOGLE_CLOUD,
        AZURE,
        ON_PREMISE
    }

    public enum DatabaseType {
        POSTGRESQL,
        MYSQL,
        ORACLE
    }
}
