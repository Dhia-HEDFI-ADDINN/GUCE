package cm.guce.procedurebuilder.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Tracks workflow deployments to target instances
 */
@Entity
@Table(name = "workflow_deployments", indexes = {
    @Index(name = "idx_deployment_workflow", columnList = "workflow_id"),
    @Index(name = "idx_deployment_status", columnList = "status"),
    @Index(name = "idx_deployment_namespace", columnList = "target_namespace")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkflowDeployment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    private WorkflowDefinition workflowDefinition;

    @Column(name = "target_namespace", nullable = false)
    private String targetNamespace;

    @Column(name = "target_country_code", nullable = false)
    private String targetCountryCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DeploymentStatus status = DeploymentStatus.PENDING;

    @Column(name = "zeebe_deployment_key")
    private Long zeebeDeploymentKey;

    @Column(name = "docker_image_tag")
    private String dockerImageTag;

    @Column(name = "helm_release_name")
    private String helmReleaseName;

    @Column(name = "git_commit_sha")
    private String gitCommitSha;

    @Column(name = "git_repository_url")
    private String gitRepositoryUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "generated_files", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, String> generatedFiles = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "build_logs", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> buildLogs = new HashMap<>();

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "deployed_by")
    private UUID deployedBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Deployment status
     */
    public enum DeploymentStatus {
        PENDING,
        GENERATING_CODE,
        BUILDING,
        PUSHING_IMAGE,
        DEPLOYING_K8S,
        DEPLOYING_BPMN,
        SUCCESS,
        FAILED,
        ROLLED_BACK
    }
}
