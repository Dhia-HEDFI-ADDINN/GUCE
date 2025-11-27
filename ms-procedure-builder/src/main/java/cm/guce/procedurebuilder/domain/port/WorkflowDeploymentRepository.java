package cm.guce.procedurebuilder.domain.port;

import cm.guce.procedurebuilder.domain.model.WorkflowDeployment;
import cm.guce.procedurebuilder.domain.model.WorkflowDeployment.DeploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for WorkflowDeployment entity
 */
@Repository
public interface WorkflowDeploymentRepository extends JpaRepository<WorkflowDeployment, UUID> {

    /**
     * Find deployments by workflow
     */
    List<WorkflowDeployment> findByWorkflowDefinitionIdOrderByCreatedAtDesc(UUID workflowId);

    /**
     * Find deployments by namespace
     */
    Page<WorkflowDeployment> findByTargetNamespaceOrderByCreatedAtDesc(String namespace, Pageable pageable);

    /**
     * Find deployments by status
     */
    List<WorkflowDeployment> findByStatusOrderByCreatedAtDesc(DeploymentStatus status);

    /**
     * Find successful deployments for a workflow
     */
    @Query("SELECT d FROM WorkflowDeployment d WHERE d.workflowDefinition.id = :workflowId " +
           "AND d.status = 'SUCCESS' ORDER BY d.completedAt DESC")
    List<WorkflowDeployment> findSuccessfulDeployments(@Param("workflowId") UUID workflowId);

    /**
     * Find latest deployment for workflow and namespace
     */
    @Query("SELECT d FROM WorkflowDeployment d WHERE d.workflowDefinition.id = :workflowId " +
           "AND d.targetNamespace = :namespace ORDER BY d.createdAt DESC LIMIT 1")
    WorkflowDeployment findLatestDeployment(
        @Param("workflowId") UUID workflowId,
        @Param("namespace") String namespace);

    /**
     * Count deployments by status
     */
    long countByStatus(DeploymentStatus status);
}
