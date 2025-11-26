package cm.guce.workflow.domain.port;

import cm.guce.workflow.domain.model.UserTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for UserTask entities
 */
@Repository
public interface UserTaskRepository extends JpaRepository<UserTask, Long> {

    Optional<UserTask> findByZeebeJobKey(Long zeebeJobKey);

    Page<UserTask> findByProcessInstanceKey(Long processInstanceKey, Pageable pageable);

    Page<UserTask> findByAssignee(String assignee, Pageable pageable);

    Page<UserTask> findByAssigneeAndStatus(String assignee, UserTask.TaskStatus status, Pageable pageable);

    @Query("SELECT t FROM UserTask t WHERE t.tenantId = :tenantId AND " +
           "(t.assignee = :userId OR t.candidateUsers LIKE %:userId% OR " +
           "t.candidateGroups IN :groups) AND t.status IN ('CREATED', 'ASSIGNED', 'CLAIMED')")
    Page<UserTask> findByAssigneeOrCandidateAndTenant(String userId, String tenantId, Pageable pageable);

    @Query("SELECT t FROM UserTask t WHERE t.tenantId = :tenantId AND t.status = :status")
    Page<UserTask> findByTenantIdAndStatus(String tenantId, UserTask.TaskStatus status, Pageable pageable);

    @Query("SELECT COUNT(t) FROM UserTask t WHERE t.tenantId = :tenantId AND t.status IN ('CREATED', 'ASSIGNED')")
    Long countPendingTasksByTenant(String tenantId);

    @Query("SELECT COUNT(t) FROM UserTask t WHERE t.assignee = :assignee AND t.status IN ('CLAIMED')")
    Long countClaimedTasksByUser(String assignee);
}
