package cm.guce.workflow.adapter.in.web;

import cm.guce.common.dto.ApiResponse;
import cm.guce.workflow.application.WorkflowService;
import cm.guce.workflow.domain.model.ProcessInstance;
import cm.guce.workflow.domain.model.UserTask;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API for workflow operations
 */
@RestController
@RequestMapping("/api/v1/workflow")
@RequiredArgsConstructor
@Tag(name = "Workflow", description = "Workflow and process management APIs")
public class WorkflowController {

    private final WorkflowService workflowService;

    // ==================== PROCESS INSTANCES ====================

    @PostMapping("/processes/{bpmnProcessId}/start")
    @Operation(summary = "Start a new process instance")
    public ResponseEntity<ApiResponse<ProcessInstance>> startProcess(
            @PathVariable String bpmnProcessId,
            @RequestBody StartProcessRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getSubject();
        String tenantId = jwt.getClaimAsString("tenant_id");

        ProcessInstance instance = workflowService.startProcess(
            bpmnProcessId,
            request.businessKey(),
            tenantId,
            request.entityType(),
            request.entityId(),
            request.variables(),
            userId
        );

        return ResponseEntity.ok(ApiResponse.success(instance, "Process started successfully"));
    }

    @DeleteMapping("/processes/{processInstanceKey}")
    @Operation(summary = "Cancel a process instance")
    public ResponseEntity<ApiResponse<Void>> cancelProcess(
            @PathVariable Long processInstanceKey,
            @RequestParam(required = false) String reason) {

        workflowService.cancelProcess(processInstanceKey, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Process canceled"));
    }

    @GetMapping("/processes/{processInstanceKey}")
    @Operation(summary = "Get process instance details")
    public ResponseEntity<ApiResponse<ProcessInstance>> getProcessInstance(
            @PathVariable Long processInstanceKey) {

        return workflowService.getProcessInstance(processInstanceKey)
            .map(instance -> ResponseEntity.ok(ApiResponse.success(instance)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/processes")
    @Operation(summary = "Get process instances for current tenant")
    public ResponseEntity<ApiResponse<Page<ProcessInstance>>> getProcessInstances(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable) {

        String tenantId = jwt.getClaimAsString("tenant_id");
        Page<ProcessInstance> instances = workflowService.getProcessInstancesByTenant(tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.success(instances));
    }

    @GetMapping("/processes/entity/{entityType}/{entityId}")
    @Operation(summary = "Get process instances by entity")
    public ResponseEntity<ApiResponse<Page<ProcessInstance>>> getProcessInstancesByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId,
            Pageable pageable) {

        Page<ProcessInstance> instances = workflowService.getProcessInstancesByEntity(entityType, entityId, pageable);
        return ResponseEntity.ok(ApiResponse.success(instances));
    }

    @PutMapping("/processes/{processInstanceKey}/variables")
    @Operation(summary = "Update process variables")
    public ResponseEntity<ApiResponse<Void>> updateVariables(
            @PathVariable Long processInstanceKey,
            @RequestBody Map<String, Object> variables) {

        workflowService.updateVariables(processInstanceKey, variables);
        return ResponseEntity.ok(ApiResponse.success(null, "Variables updated"));
    }

    // ==================== USER TASKS ====================

    @GetMapping("/tasks")
    @Operation(summary = "Get user tasks assigned to or available for current user")
    public ResponseEntity<ApiResponse<Page<UserTask>>> getUserTasks(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable) {

        String userId = jwt.getSubject();
        String tenantId = jwt.getClaimAsString("tenant_id");
        Page<UserTask> tasks = workflowService.getUserTasks(userId, tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/tasks/process/{processInstanceKey}")
    @Operation(summary = "Get tasks for a specific process instance")
    public ResponseEntity<ApiResponse<Page<UserTask>>> getTasksByProcess(
            @PathVariable Long processInstanceKey,
            Pageable pageable) {

        Page<UserTask> tasks = workflowService.getTasksByProcessInstance(processInstanceKey, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping("/tasks/{taskId}/claim")
    @Operation(summary = "Claim a task")
    public ResponseEntity<ApiResponse<UserTask>> claimTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getSubject();
        UserTask task = workflowService.claimTask(taskId, userId);
        return ResponseEntity.ok(ApiResponse.success(task, "Task claimed"));
    }

    @PostMapping("/tasks/{taskId}/unclaim")
    @Operation(summary = "Unclaim a task")
    public ResponseEntity<ApiResponse<UserTask>> unclaimTask(@PathVariable Long taskId) {
        UserTask task = workflowService.unclaimTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(task, "Task unclaimed"));
    }

    @PostMapping("/tasks/{taskId}/complete")
    @Operation(summary = "Complete a task")
    public ResponseEntity<ApiResponse<Void>> completeTask(
            @PathVariable Long taskId,
            @RequestBody Map<String, Object> variables,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getSubject();
        workflowService.completeTask(taskId, variables, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Task completed"));
    }

    // ==================== MESSAGES ====================

    @PostMapping("/messages/{messageName}")
    @Operation(summary = "Publish a message to correlate with waiting processes")
    public ResponseEntity<ApiResponse<Void>> publishMessage(
            @PathVariable String messageName,
            @RequestParam String correlationKey,
            @RequestBody Map<String, Object> variables) {

        workflowService.publishMessage(messageName, correlationKey, variables);
        return ResponseEntity.ok(ApiResponse.success(null, "Message published"));
    }

    // ==================== DTOs ====================

    public record StartProcessRequest(
        String businessKey,
        String entityType,
        String entityId,
        Map<String, Object> variables
    ) {}
}
