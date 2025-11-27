package cm.guce.procedurebuilder.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Workflow Definition entity storing BPMN workflow configurations
 */
@Entity
@Table(name = "workflow_definitions", indexes = {
    @Index(name = "idx_workflow_tenant", columnList = "tenant_id"),
    @Index(name = "idx_workflow_name", columnList = "name"),
    @Index(name = "idx_workflow_status", columnList = "status"),
    @Index(name = "idx_workflow_module", columnList = "target_module")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String version;

    @Column(name = "process_id", nullable = false)
    private String processId;

    @Lob
    @Column(name = "bpmn_xml", columnDefinition = "TEXT", nullable = false)
    private String bpmnXml;

    @Lob
    @Column(name = "dmn_xml", columnDefinition = "TEXT")
    private String dmnXml;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_module", nullable = false)
    private TargetModule targetModule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WorkflowStatus status = WorkflowStatus.DRAFT;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "form_definitions", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> formDefinitions = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "variables_schema", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> variablesSchema = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @OneToMany(mappedBy = "workflowDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkflowDeployment> deployments = new ArrayList<>();

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @Column(name = "validated_by")
    private UUID validatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Target modules where workflow can be deployed
     */
    public enum TargetModule {
        E_FORCE("e-force", "guce-{country}-eforce"),
        E_GOV("e-gov", "guce-{country}-egov"),
        E_BUSINESS("e-business", "guce-{country}-ebusiness"),
        E_PAYMENT("e-payment", "guce-{country}-epayment");

        private final String name;
        private final String namespacePattern;

        TargetModule(String name, String namespacePattern) {
            this.name = name;
            this.namespacePattern = namespacePattern;
        }

        public String getModuleName() {
            return name;
        }

        public String getKubernetesNamespace(String countryCode) {
            return namespacePattern.replace("{country}", countryCode.toLowerCase());
        }
    }

    /**
     * Workflow status lifecycle
     */
    public enum WorkflowStatus {
        DRAFT,
        VALIDATING,
        VALIDATED,
        GENERATING,
        GENERATED,
        DEPLOYING,
        DEPLOYED,
        DEPRECATED,
        ARCHIVED
    }
}
