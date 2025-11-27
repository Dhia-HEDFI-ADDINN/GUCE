package cm.guce.procedurebuilder.application.deployment;

import cm.guce.procedurebuilder.application.generator.CodeGeneratorEngine;
import cm.guce.procedurebuilder.application.generator.CodeGeneratorEngine.GeneratedCode;
import cm.guce.procedurebuilder.application.parser.BpmnParserService;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition;
import cm.guce.procedurebuilder.domain.model.WorkflowDefinition.TargetModule;
import cm.guce.procedurebuilder.domain.model.WorkflowDeployment;
import cm.guce.procedurebuilder.domain.model.WorkflowDeployment.DeploymentStatus;
import cm.guce.procedurebuilder.domain.model.WorkflowModel;
import cm.guce.procedurebuilder.domain.port.WorkflowDefinitionRepository;
import cm.guce.procedurebuilder.domain.port.WorkflowDeploymentRepository;
import io.camunda.zeebe.client.ZeebeClient;
import io.camunda.zeebe.client.api.response.DeploymentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for deploying workflows to target GUCE instances
 * Orchestrates the full deployment pipeline: Code Generation → Build → Docker → K8s → Zeebe
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowDeploymentService {

    private final BpmnParserService bpmnParser;
    private final CodeGeneratorEngine codeGenerator;
    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowDeploymentRepository deploymentRepository;
    private final ZeebeClient zeebeClient;
    private final GitRepositoryService gitService;
    private final MavenBuildService mavenBuilder;
    private final DockerBuildService dockerBuilder;
    private final KubernetesDeployService kubernetesDeployer;

    @Value("${deployment.work-dir:/tmp/guce-deployments}")
    private String workDirectory;

    /**
     * Deploy a workflow to a target instance
     */
    @Async
    @Transactional
    public CompletableFuture<WorkflowDeployment> deployWorkflow(
            UUID workflowId,
            String targetCountryCode,
            UUID deployedBy) {

        log.info("Starting deployment for workflow {} to country {}", workflowId, targetCountryCode);

        WorkflowDefinition workflow = workflowRepository.findById(workflowId)
            .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        // Create deployment record
        WorkflowDeployment deployment = WorkflowDeployment.builder()
            .workflowDefinition(workflow)
            .targetCountryCode(targetCountryCode)
            .targetNamespace(workflow.getTargetModule().getKubernetesNamespace(targetCountryCode))
            .status(DeploymentStatus.PENDING)
            .deployedBy(deployedBy)
            .startedAt(LocalDateTime.now())
            .build();

        deployment = deploymentRepository.save(deployment);

        try {
            // Parse BPMN
            WorkflowModel model = bpmnParser.parse(workflow.getBpmnXml());

            // Step 1: Generate Code
            deployment = updateStatus(deployment, DeploymentStatus.GENERATING_CODE);
            GeneratedCode generatedCode = codeGenerator.generate(workflow, model);
            deployment.setGeneratedFiles(generatedCode.getFiles());
            deploymentRepository.save(deployment);

            // Create work directory
            Path projectPath = createProjectDirectory(workflow, generatedCode);

            // Step 2: Commit to Git
            String commitSha = gitService.commitAndPush(
                projectPath,
                workflow.getName(),
                workflow.getVersion(),
                "Deploy workflow " + workflow.getName() + " v" + workflow.getVersion()
            );
            deployment.setGitCommitSha(commitSha);
            deployment.setGitRepositoryUrl(gitService.getRepositoryUrl());
            deploymentRepository.save(deployment);

            // Step 3: Build with Maven
            deployment = updateStatus(deployment, DeploymentStatus.BUILDING);
            MavenBuildService.BuildResult buildResult = mavenBuilder.build(projectPath);
            if (!buildResult.isSuccess()) {
                throw new DeploymentException("Maven build failed: " + buildResult.getOutput());
            }
            deployment.getBuildLogs().put("maven", buildResult.getOutput());
            deploymentRepository.save(deployment);

            // Step 4: Build and Push Docker Image
            deployment = updateStatus(deployment, DeploymentStatus.PUSHING_IMAGE);
            String imageTag = dockerBuilder.buildAndPush(
                projectPath,
                workflow.getName(),
                workflow.getVersion(),
                targetCountryCode
            );
            deployment.setDockerImageTag(imageTag);
            deploymentRepository.save(deployment);

            // Step 5: Deploy to Kubernetes
            deployment = updateStatus(deployment, DeploymentStatus.DEPLOYING_K8S);
            String helmRelease = kubernetesDeployer.deploy(
                deployment.getTargetNamespace(),
                workflow.getName(),
                imageTag,
                createHelmValues(workflow, model)
            );
            deployment.setHelmReleaseName(helmRelease);
            deploymentRepository.save(deployment);

            // Step 6: Deploy BPMN to Zeebe
            deployment = updateStatus(deployment, DeploymentStatus.DEPLOYING_BPMN);
            DeploymentEvent zeebeDeployment = zeebeClient.newDeployResourceCommand()
                .addResourceBytes(
                    workflow.getBpmnXml().getBytes(StandardCharsets.UTF_8),
                    workflow.getName() + ".bpmn"
                )
                .send()
                .join();
            deployment.setZeebeDeploymentKey(zeebeDeployment.getKey());

            // Success
            deployment.setStatus(DeploymentStatus.SUCCESS);
            deployment.setCompletedAt(LocalDateTime.now());

            // Update workflow status
            workflow.setStatus(WorkflowDefinition.WorkflowStatus.DEPLOYED);
            workflowRepository.save(workflow);

            log.info("Deployment successful for workflow {} to {}", workflow.getName(), deployment.getTargetNamespace());

        } catch (Exception e) {
            log.error("Deployment failed for workflow {}", workflowId, e);
            deployment.setStatus(DeploymentStatus.FAILED);
            deployment.setErrorMessage(e.getMessage());
            deployment.setCompletedAt(LocalDateTime.now());
        }

        deployment = deploymentRepository.save(deployment);
        return CompletableFuture.completedFuture(deployment);
    }

    /**
     * Rollback a deployment
     */
    @Transactional
    public void rollbackDeployment(UUID deploymentId) {
        WorkflowDeployment deployment = deploymentRepository.findById(deploymentId)
            .orElseThrow(() -> new RuntimeException("Deployment not found: " + deploymentId));

        log.info("Rolling back deployment {} for workflow {}",
            deploymentId, deployment.getWorkflowDefinition().getName());

        try {
            // Rollback Kubernetes deployment
            if (deployment.getHelmReleaseName() != null) {
                kubernetesDeployer.rollback(
                    deployment.getTargetNamespace(),
                    deployment.getHelmReleaseName()
                );
            }

            deployment.setStatus(DeploymentStatus.ROLLED_BACK);
            deploymentRepository.save(deployment);

            log.info("Rollback successful for deployment {}", deploymentId);

        } catch (Exception e) {
            log.error("Rollback failed for deployment {}", deploymentId, e);
            throw new DeploymentException("Rollback failed: " + e.getMessage());
        }
    }

    /**
     * Validate workflow before deployment
     */
    public ValidationResult validateForDeployment(UUID workflowId) {
        WorkflowDefinition workflow = workflowRepository.findById(workflowId)
            .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        BpmnParserService.ValidationResult bpmnValidation = bpmnParser.validate(workflow.getBpmnXml());

        return ValidationResult.builder()
            .valid(bpmnValidation.isValid())
            .bpmnErrors(bpmnValidation.getErrors())
            .bpmnWarnings(bpmnValidation.getWarnings())
            .build();
    }

    /**
     * Get deployment status
     */
    public DeploymentStatus getDeploymentStatus(UUID deploymentId) {
        return deploymentRepository.findById(deploymentId)
            .map(WorkflowDeployment::getStatus)
            .orElse(null);
    }

    private Path createProjectDirectory(WorkflowDefinition workflow, GeneratedCode code) throws IOException {
        Path projectPath = Path.of(workDirectory, workflow.getName(), workflow.getVersion());
        Files.createDirectories(projectPath);

        // Write generated files
        for (Map.Entry<String, String> entry : code.getFiles().entrySet()) {
            String fileName = entry.getKey();
            String content = entry.getValue();

            Path filePath;
            if (fileName.endsWith(".java")) {
                // Java files go to src/main/java/package/
                String packagePath = code.getPackageName().replace('.', '/');
                filePath = projectPath.resolve("src/main/java").resolve(packagePath).resolve(fileName);
            } else if (fileName.endsWith(".bpmn")) {
                // BPMN files go to src/main/resources/bpmn/
                filePath = projectPath.resolve("src/main/resources/bpmn").resolve(fileName);
            } else if (fileName.equals("application.yml")) {
                filePath = projectPath.resolve("src/main/resources").resolve(fileName);
            } else {
                filePath = projectPath.resolve(fileName);
            }

            Files.createDirectories(filePath.getParent());
            Files.writeString(filePath, content);
        }

        // Create Application main class
        createMainClass(projectPath, code.getPackageName(), workflow.getName());

        return projectPath;
    }

    private void createMainClass(Path projectPath, String packageName, String processName) throws IOException {
        String className = toPascalCase(processName) + "Application";
        String content = """
            package %s;

            import io.camunda.zeebe.spring.client.annotation.Deployment;
            import org.springframework.boot.SpringApplication;
            import org.springframework.boot.autoconfigure.SpringBootApplication;

            @SpringBootApplication
            @Deployment(resources = "classpath*:/bpmn/**/*.bpmn")
            public class %s {
                public static void main(String[] args) {
                    SpringApplication.run(%s.class, args);
                }
            }
            """.formatted(packageName, className, className);

        Path filePath = projectPath.resolve("src/main/java")
            .resolve(packageName.replace('.', '/'))
            .resolve(className + ".java");

        Files.createDirectories(filePath.getParent());
        Files.writeString(filePath, content);
    }

    private Map<String, Object> createHelmValues(WorkflowDefinition workflow, WorkflowModel model) {
        Map<String, Object> values = new HashMap<>();
        values.put("replicaCount", 2);
        values.put("processId", model.getProcessId());
        values.put("targetModule", workflow.getTargetModule().getModuleName());

        Map<String, Object> resources = new HashMap<>();
        resources.put("requests", Map.of("cpu", "100m", "memory", "256Mi"));
        resources.put("limits", Map.of("cpu", "500m", "memory", "512Mi"));
        values.put("resources", resources);

        return values;
    }

    private WorkflowDeployment updateStatus(WorkflowDeployment deployment, DeploymentStatus status) {
        deployment.setStatus(status);
        return deploymentRepository.save(deployment);
    }

    private String toPascalCase(String input) {
        StringBuilder result = new StringBuilder();
        boolean capitalizeNext = true;
        for (char c : input.toCharArray()) {
            if (c == '-' || c == '_') {
                capitalizeNext = true;
            } else if (capitalizeNext) {
                result.append(Character.toUpperCase(c));
                capitalizeNext = false;
            } else {
                result.append(Character.toLowerCase(c));
            }
        }
        return result.toString();
    }

    /**
     * Validation result for deployment
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class ValidationResult {
        private boolean valid;
        private java.util.List<String> bpmnErrors;
        private java.util.List<String> bpmnWarnings;
    }

    /**
     * Deployment exception
     */
    public static class DeploymentException extends RuntimeException {
        public DeploymentException(String message) {
            super(message);
        }
    }
}
