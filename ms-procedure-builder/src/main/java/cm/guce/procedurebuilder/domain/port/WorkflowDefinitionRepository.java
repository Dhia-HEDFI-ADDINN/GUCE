package cm.guce.procedurebuilder.domain.port;

import cm.guce.procedurebuilder.domain.model.WorkflowDefinition;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition.TargetModule;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition.WorkflowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for WorkflowDefinition entity
 */
@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, UUID> {

    /**
     * Find workflows by tenant
     */
    Page<WorkflowDefinition> findByTenantIdOrderByUpdatedAtDesc(UUID tenantId, Pageable pageable);

    /**
     * Find workflow by name and tenant
     */
    Optional<WorkflowDefinition> findByTenantIdAndName(UUID tenantId, String name);

    /**
     * Find workflow by process ID
     */
    Optional<WorkflowDefinition> findByProcessId(String processId);

    /**
     * Find workflows by status
     */
    Page<WorkflowDefinition> findByTenantIdAndStatusOrderByUpdatedAtDesc(
        UUID tenantId, WorkflowStatus status, Pageable pageable);

    /**
     * Find workflows by target module
     */
    Page<WorkflowDefinition> findByTenantIdAndTargetModuleOrderByUpdatedAtDesc(
        UUID tenantId, TargetModule targetModule, Pageable pageable);

    /**
     * Find deployed workflows for a tenant
     */
    @Query("SELECT w FROM WorkflowDefinition w WHERE w.tenantId = :tenantId " +
           "AND w.status = 'DEPLOYED' ORDER BY w.updatedAt DESC")
    List<WorkflowDefinition> findDeployedWorkflows(@Param("tenantId") UUID tenantId);

    /**
     * Search workflows by name or description
     */
    @Query("SELECT w FROM WorkflowDefinition w WHERE w.tenantId = :tenantId " +
           "AND (LOWER(w.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(w.displayName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(w.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<WorkflowDefinition> searchWorkflows(
        @Param("tenantId") UUID tenantId,
        @Param("query") String query,
        Pageable pageable);

    /**
     * Check if workflow name exists for tenant
     */
    boolean existsByTenantIdAndName(UUID tenantId, String name);

    /**
     * Count workflows by status for tenant
     */
    long countByTenantIdAndStatus(UUID tenantId, WorkflowStatus status);
}
