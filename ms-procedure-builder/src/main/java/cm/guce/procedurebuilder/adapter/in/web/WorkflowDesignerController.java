package cm.guce.procedurebuilder.adapter.in.web;

import cm.guce.procedurebuilder.application.deployment.WorkflowDeploymentService;
import cm.guce.procedurebuilder.application.generator.CodeGeneratorEngine;
import cm.guce.procedurebuilder.application.parser.BpmnParserService;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition.TargetModule;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition.WorkflowStatus;
import cm.guce.procedurebuilder.domain.model.WorkflowDeployment;
import cm.guce.procedurebuilder.domain.model.WorkflowModel;
import cm.guce.procedurebuilder.domain.port.WorkflowDefinitionRepository;
import cm.guce.procedurebuilder.domain.port.WorkflowDeploymentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for Workflow Designer - Procedure Builder
 */
@RestController
@RequestMapping("/api/v1/workflow-designer")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workflow Designer", description = "BPMN Workflow Designer and Code Generator API")
public class WorkflowDesignerController {

    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowDeploymentRepository deploymentRepository;
    private final BpmnParserService bpmnParser;
    private final CodeGeneratorEngine codeGenerator;
    private final WorkflowDeploymentService deploymentService;

    // ========== Workflow CRUD ==========

    @GetMapping("/workflows")
    @Operation(summary = "List all workflows for tenant")
    public ResponseEntity<Page<WorkflowDefinition>> listWorkflows(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) WorkflowStatus status,
            @RequestParam(required = false) TargetModule targetModule,
            @RequestParam(required = false) String search,
            Pageable pageable) {

        Page<WorkflowDefinition> workflows;
        if (search != null && !search.isEmpty()) {
            workflows = workflowRepository.searchWorkflows(tenantId, search, pageable);
        } else if (status != null) {
            workflows = workflowRepository.findByTenantIdAndStatusOrderByUpdatedAtDesc(tenantId, status, pageable);
        } else if (targetModule != null) {
            workflows = workflowRepository.findByTenantIdAndTargetModuleOrderByUpdatedAtDesc(tenantId, targetModule, pageable);
        } else {
            workflows = workflowRepository.findByTenantIdOrderByUpdatedAtDesc(tenantId, pageable);
        }

        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/workflows/{workflowId}")
    @Operation(summary = "Get workflow by ID")
    public ResponseEntity<WorkflowDefinition> getWorkflow(@PathVariable UUID workflowId) {
        return workflowRepository.findById(workflowId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/workflows")
    @Operation(summary = "Create a new workflow")
    public ResponseEntity<WorkflowDefinition> createWorkflow(
            @RequestBody CreateWorkflowRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        // Check if name already exists
        if (workflowRepository.existsByTenantIdAndName(request.getTenantId(), request.getName())) {
            return ResponseEntity.badRequest().build();
        }

        WorkflowDefinition workflow = WorkflowDefinition.builder()
            .tenantId(request.getTenantId())
            .name(request.getName())
            .displayName(request.getDisplayName())
            .description(request.getDescription())
            .version("1.0.0")
            .processId(generateProcessId(request.getName()))
            .bpmnXml(request.getBpmnXml() != null ? request.getBpmnXml() : createInitialBpmn(request.getName()))
            .targetModule(request.getTargetModule())
            .status(WorkflowStatus.DRAFT)
            .createdBy(userId)
            .build();

        workflow = workflowRepository.save(workflow);
        log.info("Created workflow: {} for tenant {}", workflow.getName(), workflow.getTenantId());

        return ResponseEntity.status(HttpStatus.CREATED).body(workflow);
    }

    @PutMapping("/workflows/{workflowId}")
    @Operation(summary = "Update workflow")
    public ResponseEntity<WorkflowDefinition> updateWorkflow(
            @PathVariable UUID workflowId,
            @RequestBody UpdateWorkflowRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        return workflowRepository.findById(workflowId)
            .map(workflow -> {
                if (request.getDisplayName() != null) {
                    workflow.setDisplayName(request.getDisplayName());
                }
                if (request.getDescription() != null) {
                    workflow.setDescription(request.getDescription());
                }
                if (request.getBpmnXml() != null) {
                    workflow.setBpmnXml(request.getBpmnXml());
                    workflow.setStatus(WorkflowStatus.DRAFT); // Reset to draft on change
                }
                if (request.getTargetModule() != null) {
                    workflow.setTargetModule(request.getTargetModule());
                }
                if (request.getFormDefinitions() != null) {
                    workflow.setFormDefinitions(request.getFormDefinitions());
                }
                workflow.setUpdatedBy(userId);

                return ResponseEntity.ok(workflowRepository.save(workflow));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/workflows/{workflowId}/bpmn", consumes = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "Save BPMN XML")
    public ResponseEntity<WorkflowDefinition> saveBpmn(
            @PathVariable UUID workflowId,
            @RequestBody String bpmnXml,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        return workflowRepository.findById(workflowId)
            .map(workflow -> {
                workflow.setBpmnXml(bpmnXml);
                workflow.setStatus(WorkflowStatus.DRAFT);
                workflow.setUpdatedBy(userId);
                return ResponseEntity.ok(workflowRepository.save(workflow));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/workflows/{workflowId}/bpmn", produces = MediaType.APPLICATION_XML_VALUE)
    @Operation(summary = "Get BPMN XML")
    public ResponseEntity<String> getBpmn(@PathVariable UUID workflowId) {
        return workflowRepository.findById(workflowId)
            .map(workflow -> ResponseEntity.ok(workflow.getBpmnXml()))
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/workflows/{workflowId}")
    @Operation(summary = "Delete workflow")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable UUID workflowId) {
        return workflowRepository.findById(workflowId)
            .map(workflow -> {
                workflow.setStatus(WorkflowStatus.ARCHIVED);
                workflowRepository.save(workflow);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ========== Validation ==========

    @PostMapping("/workflows/{workflowId}/validate")
    @Operation(summary = "Validate workflow BPMN")
    public ResponseEntity<BpmnParserService.ValidationResult> validateWorkflow(@PathVariable UUID workflowId) {
        return workflowRepository.findById(workflowId)
            .map(workflow -> {
                BpmnParserService.ValidationResult result = bpmnParser.validate(workflow.getBpmnXml());

                if (result.isValid()) {
                    workflow.setStatus(WorkflowStatus.VALIDATED);
                    workflow.setValidatedAt(LocalDateTime.now());
                    workflowRepository.save(workflow);
                }

                return ResponseEntity.ok(result);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/validate-bpmn")
    @Operation(summary = "Validate BPMN XML without saving")
    public ResponseEntity<BpmnParserService.ValidationResult> validateBpmn(@RequestBody String bpmnXml) {
        BpmnParserService.ValidationResult result = bpmnParser.validate(bpmnXml);
        return ResponseEntity.ok(result);
    }

    // ========== Code Generation ==========

    @PostMapping("/workflows/{workflowId}/generate")
    @Operation(summary = "Generate Spring Boot code from workflow")
    public ResponseEntity<CodeGeneratorEngine.GeneratedCode> generateCode(@PathVariable UUID workflowId) {
        return workflowRepository.findById(workflowId)
            .map(workflow -> {
                // Validate first
                BpmnParserService.ValidationResult validation = bpmnParser.validate(workflow.getBpmnXml());
                if (!validation.isValid()) {
                    return ResponseEntity.badRequest().<CodeGeneratorEngine.GeneratedCode>build();
                }

                // Parse and generate
                WorkflowModel model = bpmnParser.parse(workflow.getBpmnXml());
                CodeGeneratorEngine.GeneratedCode code = codeGenerator.generate(workflow, model);

                workflow.setStatus(WorkflowStatus.GENERATED);
                workflowRepository.save(workflow);

                return ResponseEntity.ok(code);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/workflows/{workflowId}/preview-code")
    @Operation(summary = "Preview generated code without changing status")
    public ResponseEntity<Map<String, String>> previewCode(@PathVariable UUID workflowId) {
        return workflowRepository.findById(workflowId)
            .map(workflow -> {
                WorkflowModel model = bpmnParser.parse(workflow.getBpmnXml());
                CodeGeneratorEngine.GeneratedCode code = codeGenerator.generate(workflow, model);
                return ResponseEntity.ok(code.getFiles());
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ========== Deployment ==========

    @PostMapping("/workflows/{workflowId}/deploy")
    @Operation(summary = "Deploy workflow to target instance")
    public ResponseEntity<WorkflowDeployment> deployWorkflow(
            @PathVariable UUID workflowId,
            @RequestBody DeployWorkflowRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = UUID.fromString(jwt.getSubject());

        // Validate before deployment
        WorkflowDeploymentService.ValidationResult validation = deploymentService.validateForDeployment(workflowId);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().build();
        }

        // Start async deployment
        CompletableFuture<WorkflowDeployment> deploymentFuture =
            deploymentService.deployWorkflow(workflowId, request.getTargetCountryCode(), userId);

        // Return immediately with pending status
        WorkflowDeployment pendingDeployment = WorkflowDeployment.builder()
            .status(WorkflowDeployment.DeploymentStatus.PENDING)
            .targetCountryCode(request.getTargetCountryCode())
            .build();

        return ResponseEntity.accepted().body(pendingDeployment);
    }

    @GetMapping("/workflows/{workflowId}/deployments")
    @Operation(summary = "Get deployment history for workflow")
    public ResponseEntity<List<WorkflowDeployment>> getDeployments(@PathVariable UUID workflowId) {
        List<WorkflowDeployment> deployments = deploymentRepository.findByWorkflowDefinitionIdOrderByCreatedAtDesc(workflowId);
        return ResponseEntity.ok(deployments);
    }

    @GetMapping("/deployments/{deploymentId}")
    @Operation(summary = "Get deployment details")
    public ResponseEntity<WorkflowDeployment> getDeployment(@PathVariable UUID deploymentId) {
        return deploymentRepository.findById(deploymentId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/deployments/{deploymentId}/rollback")
    @Operation(summary = "Rollback a deployment")
    public ResponseEntity<Void> rollbackDeployment(@PathVariable UUID deploymentId) {
        try {
            deploymentService.rollbackDeployment(deploymentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Rollback failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== Statistics ==========

    @GetMapping("/statistics")
    @Operation(summary = "Get workflow statistics for tenant")
    public ResponseEntity<Map<String, Object>> getStatistics(@RequestParam UUID tenantId) {
        Map<String, Object> stats = Map.of(
            "draft", workflowRepository.countByTenantIdAndStatus(tenantId, WorkflowStatus.DRAFT),
            "validated", workflowRepository.countByTenantIdAndStatus(tenantId, WorkflowStatus.VALIDATED),
            "deployed", workflowRepository.countByTenantIdAndStatus(tenantId, WorkflowStatus.DEPLOYED),
            "pendingDeployments", deploymentRepository.countByStatus(WorkflowDeployment.DeploymentStatus.PENDING),
            "failedDeployments", deploymentRepository.countByStatus(WorkflowDeployment.DeploymentStatus.FAILED)
        );
        return ResponseEntity.ok(stats);
    }

    // ========== Helper Methods ==========

    private String generateProcessId(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9]", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }

    private String createInitialBpmn(String name) {
        String processId = generateProcessId(name);
        return """
            <?xml version="1.0" encoding="UTF-8"?>
            <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                              xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                              xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                              xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
                              xmlns:modeler="http://camunda.org/schema/modeler/1.0"
                              id="Definitions_1"
                              targetNamespace="http://bpmn.io/schema/bpmn"
                              exporter="Camunda Modeler"
                              exporterVersion="5.0.0">
              <bpmn:process id="%s" name="%s" isExecutable="true">
                <bpmn:startEvent id="StartEvent_1" name="Start">
                  <bpmn:outgoing>Flow_1</bpmn:outgoing>
                </bpmn:startEvent>
                <bpmn:endEvent id="EndEvent_1" name="End">
                  <bpmn:incoming>Flow_1</bpmn:incoming>
                </bpmn:endEvent>
                <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1"/>
              </bpmn:process>
              <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="%s">
                  <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
                    <dc:Bounds x="180" y="160" width="36" height="36"/>
                  </bpmndi:BPMNShape>
                  <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
                    <dc:Bounds x="400" y="160" width="36" height="36"/>
                  </bpmndi:BPMNShape>
                  <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
                    <dc:Bounds x="216" y="178" width="184" height="0"/>
                  </bpmndi:BPMNEdge>
                </bpmndi:BPMNPlane>
              </bpmndi:BPMNDiagram>
            </bpmn:definitions>
            """.formatted(processId, name, processId);
    }

    // ========== DTOs ==========

    @lombok.Data
    public static class CreateWorkflowRequest {
        private UUID tenantId;
        private String name;
        private String displayName;
        private String description;
        private String bpmnXml;
        private TargetModule targetModule;
    }

    @lombok.Data
    public static class UpdateWorkflowRequest {
        private String displayName;
        private String description;
        private String bpmnXml;
        private TargetModule targetModule;
        private Map<String, Object> formDefinitions;
    }

    @lombok.Data
    public static class DeployWorkflowRequest {
        private String targetCountryCode;
    }
}
