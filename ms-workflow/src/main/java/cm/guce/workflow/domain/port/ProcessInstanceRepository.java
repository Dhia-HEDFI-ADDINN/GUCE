package cm.guce.workflow.domain.port;

import cm.guce.workflow.domain.model.ProcessInstance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for ProcessInstance entities
 */
@Repository
public interface ProcessInstanceRepository extends JpaRepository<ProcessInstance, Long> {

    Optional<ProcessInstance> findByZeebeKey(Long zeebeKey);

    Optional<ProcessInstance> findByBusinessKey(String businessKey);

    Page<ProcessInstance> findByTenantId(String tenantId, Pageable pageable);

    Page<ProcessInstance> findByTenantIdAndStatus(String tenantId, ProcessInstance.ProcessStatus status, Pageable pageable);

    Page<ProcessInstance> findByEntityTypeAndEntityId(String entityType, String entityId, Pageable pageable);

    Page<ProcessInstance> findByBpmnProcessId(String bpmnProcessId, Pageable pageable);

    @Query("SELECT p FROM ProcessInstance p WHERE p.status = :status")
    Page<ProcessInstance> findByStatus(ProcessInstance.ProcessStatus status, Pageable pageable);

    @Query("SELECT COUNT(p) FROM ProcessInstance p WHERE p.tenantId = :tenantId AND p.status = :status")
    Long countByTenantIdAndStatus(String tenantId, ProcessInstance.ProcessStatus status);
}
