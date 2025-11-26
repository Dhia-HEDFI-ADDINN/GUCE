package cm.guce.workflow.application;

import cm.guce.workflow.domain.model.ProcessInstance;
import cm.guce.workflow.domain.model.UserTask;
import cm.guce.workflow.domain.port.ProcessInstanceRepository;
import cm.guce.workflow.domain.port.UserTaskRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.ProcessInstanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Workflow Service - orchestrates process instances and user tasks
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkflowService {

    private final ZeebeClient zeebeClient;
    private final ProcessInstanceRepository processInstanceRepository;
    private final UserTaskRepository userTaskRepository;

    /**
     * Start a new process instance
     */
    public ProcessInstance startProcess(String bpmnProcessId, String businessKey,
                                         String tenantId, String entityType, String entityId,
                                         Map<String, Object> variables, String startedBy) {
        log.info("Starting process {} with businessKey {} for tenant {}",
            bpmnProcessId, businessKey, tenantId);

        // Start process in Zeebe
        ProcessInstanceEvent event = zeebeClient.newCreateInstanceCommand()
            .bpmnProcessId(bpmnProcessId)
            .latestVersion()
            .variables(variables)
            .send()
            .join();

        // Save to local database
        ProcessInstance instance = ProcessInstance.builder()
            .zeebeKey(event.getProcessInstanceKey())
            .processDefinitionKey(event.getProcessDefinitionKey())
            .bpmnProcessId(bpmnProcessId)
            .version(event.getVersion())
            .tenantId(tenantId)
            .businessKey(businessKey)
            .entityType(entityType)
            .entityId(entityId)
            .status(ProcessInstance.ProcessStatus.ACTIVE)
            .startedAt(LocalDateTime.now())
            .startedBy(startedBy)
            .build();

        return processInstanceRepository.save(instance);
    }

    /**
     * Cancel a process instance
     */
    public void cancelProcess(Long processInstanceKey, String reason) {
        log.info("Canceling process instance {}: {}", processInstanceKey, reason);

        zeebeClient.newCancelInstanceCommand(processInstanceKey)
            .send()
            .join();

        processInstanceRepository.findByZeebeKey(processInstanceKey)
            .ifPresent(instance -> {
                instance.setStatus(ProcessInstance.ProcessStatus.CANCELED);
                instance.setEndedAt(LocalDateTime.now());
                processInstanceRepository.save(instance);
            });
    }

    /**
     * Get process instance by Zeebe key
     */
    @Transactional(readOnly = true)
    public Optional<ProcessInstance> getProcessInstance(Long zeebeKey) {
        return processInstanceRepository.findByZeebeKey(zeebeKey);
    }

    /**
     * Get process instances by tenant
     */
    @Transactional(readOnly = true)
    public Page<ProcessInstance> getProcessInstancesByTenant(String tenantId, Pageable pageable) {
        return processInstanceRepository.findByTenantId(tenantId, pageable);
    }

    /**
     * Get process instances by entity
     */
    @Transactional(readOnly = true)
    public Page<ProcessInstance> getProcessInstancesByEntity(String entityType, String entityId, Pageable pageable) {
        return processInstanceRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable);
    }

    /**
     * Get user tasks for a user (assigned or candidate)
     */
    @Transactional(readOnly = true)
    public Page<UserTask> getUserTasks(String userId, String tenantId, Pageable pageable) {
        return userTaskRepository.findByAssigneeOrCandidateAndTenant(userId, tenantId, pageable);
    }

    /**
     * Get user tasks by process instance
     */
    @Transactional(readOnly = true)
    public Page<UserTask> getTasksByProcessInstance(Long processInstanceKey, Pageable pageable) {
        return userTaskRepository.findByProcessInstanceKey(processInstanceKey, pageable);
    }

    /**
     * Claim a user task
     */
    public UserTask claimTask(Long taskId, String userId) {
        UserTask task = userTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        if (task.getAssignee() != null && !task.getAssignee().equals(userId)) {
            throw new RuntimeException("Task already assigned to: " + task.getAssignee());
        }

        task.setAssignee(userId);
        task.setStatus(UserTask.TaskStatus.CLAIMED);
        task.setClaimedAt(LocalDateTime.now());

        log.info("Task {} claimed by user {}", taskId, userId);
        return userTaskRepository.save(task);
    }

    /**
     * Unclaim a user task
     */
    public UserTask unclaimTask(Long taskId) {
        UserTask task = userTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        task.setAssignee(null);
        task.setStatus(UserTask.TaskStatus.CREATED);
        task.setClaimedAt(null);

        log.info("Task {} unclaimed", taskId);
        return userTaskRepository.save(task);
    }

    /**
     * Complete a user task
     */
    public void completeTask(Long taskId, Map<String, Object> variables, String userId) {
        UserTask task = userTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));

        // Complete in Zeebe
        zeebeClient.newCompleteCommand(task.getZeebeJobKey())
            .variables(variables)
            .send()
            .join();

        // Update local task
        task.setStatus(UserTask.TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        task.setCompletedBy(userId);
        userTaskRepository.save(task);

        log.info("Task {} completed by user {} with variables: {}", taskId, userId, variables.keySet());
    }

    /**
     * Update process variables
     */
    public void updateVariables(Long processInstanceKey, Map<String, Object> variables) {
        zeebeClient.newSetVariablesCommand(processInstanceKey)
            .variables(variables)
            .send()
            .join();

        log.info("Updated variables for process {}: {}", processInstanceKey, variables.keySet());
    }

    /**
     * Publish a message to a process
     */
    public void publishMessage(String messageName, String correlationKey, Map<String, Object> variables) {
        zeebeClient.newPublishMessageCommand()
            .messageName(messageName)
            .correlationKey(correlationKey)
            .variables(variables)
            .send()
            .join();

        log.info("Published message {} with correlationKey {}", messageName, correlationKey);
    }
}
