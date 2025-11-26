package cm.guce.tenant.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Module active pour un tenant.
 */
@Entity
@Table(name = "tenant_module")
@Getter
@Setter
@NoArgsConstructor
public class TenantModule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "enabled")
    private Boolean enabled = true;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "description")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tenant_module_features", joinColumns = @JoinColumn(name = "module_id"))
    @MapKeyColumn(name = "feature_name")
    @Column(name = "feature_enabled")
    private Map<String, Boolean> features = new HashMap<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tenant_module_config", joinColumns = @JoinColumn(name = "module_id"))
    @MapKeyColumn(name = "config_key")
    @Column(name = "config_value")
    private Map<String, String> configuration = new HashMap<>();

    // Predefined module names
    public static final String E_FORCE = "e-force";
    public static final String E_GOV = "e-gov";
    public static final String E_BUSINESS = "e-business";
    public static final String E_PAYMENT = "e-payment";
    public static final String PROCEDURE_BUILDER = "procedure-builder";
    public static final String ADMIN_LOCAL = "admin-local";

    public TenantModule(String name, Boolean enabled) {
        this.name = name;
        this.enabled = enabled;
    }

    public boolean isFeatureEnabled(String featureName) {
        return features.getOrDefault(featureName, false);
    }

    public void enableFeature(String featureName) {
        features.put(featureName, true);
    }

    public void disableFeature(String featureName) {
        features.put(featureName, false);
    }
}
