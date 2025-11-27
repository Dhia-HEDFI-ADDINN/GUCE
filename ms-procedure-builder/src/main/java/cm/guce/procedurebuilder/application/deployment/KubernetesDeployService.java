package cm.guce.procedurebuilder.application.deployment;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Service for deploying to Kubernetes clusters
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KubernetesDeployService {

    private final KubernetesClient kubernetesClient;

    @Value("${kubernetes.use-helm:true}")
    private boolean useHelm;

    @Value("${helm.chart.repository:oci://harbor.e-guce.cm/charts}")
    private String helmChartRepository;

    @Value("${helm.chart.name:guce-workflow}")
    private String helmChartName;

    @Value("${helm.timeout:600}")
    private int helmTimeoutSeconds;

    /**
     * Deploy to Kubernetes using Helm or direct K8s API
     */
    public String deploy(String namespace, String workflowName, String imageTag, Map<String, Object> values) {
        log.info("Deploying {} to namespace {} with image {}", workflowName, namespace, imageTag);

        // Ensure namespace exists
        ensureNamespaceExists(namespace);

        if (useHelm) {
            return deployWithHelm(namespace, workflowName, imageTag, values);
        } else {
            return deployWithKubernetesApi(namespace, workflowName, imageTag, values);
        }
    }

    /**
     * Rollback a deployment
     */
    public void rollback(String namespace, String releaseName) {
        log.info("Rolling back deployment {} in namespace {}", releaseName, namespace);

        if (useHelm) {
            rollbackWithHelm(namespace, releaseName);
        } else {
            // For direct K8s deployment, we'd need to track previous versions
            log.warn("Rollback without Helm requires version tracking - not implemented");
        }
    }

    /**
     * Deploy using Helm
     */
    private String deployWithHelm(String namespace, String workflowName, String imageTag, Map<String, Object> values) {
        String releaseName = sanitizeReleaseName(workflowName);

        try {
            // Build Helm command
            ProcessBuilder processBuilder = new ProcessBuilder(
                "helm", "upgrade", "--install",
                releaseName,
                helmChartRepository + "/" + helmChartName,
                "--namespace", namespace,
                "--set", "image.repository=" + getImageRepository(imageTag),
                "--set", "image.tag=" + getImageTag(imageTag),
                "--set", "replicaCount=" + values.getOrDefault("replicaCount", 2),
                "--wait",
                "--timeout", helmTimeoutSeconds + "s"
            );

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            // Capture output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    log.debug("[Helm] {}", line);
                }
            }

            boolean completed = process.waitFor(helmTimeoutSeconds, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                throw new RuntimeException("Helm deployment timed out");
            }

            if (process.exitValue() != 0) {
                throw new RuntimeException("Helm deployment failed: " + output);
            }

            log.info("Helm deployment successful: {}", releaseName);
            return releaseName;

        } catch (IOException | InterruptedException e) {
            log.error("Helm deployment failed", e);
            throw new RuntimeException("Helm deployment failed: " + e.getMessage(), e);
        }
    }

    /**
     * Rollback using Helm
     */
    private void rollbackWithHelm(String namespace, String releaseName) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(
                "helm", "rollback", releaseName,
                "--namespace", namespace,
                "--wait"
            );

            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            boolean completed = process.waitFor(helmTimeoutSeconds, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                throw new RuntimeException("Helm rollback timed out");
            }

            if (process.exitValue() != 0) {
                throw new RuntimeException("Helm rollback failed");
            }

            log.info("Helm rollback successful: {}", releaseName);

        } catch (IOException | InterruptedException e) {
            log.error("Helm rollback failed", e);
            throw new RuntimeException("Helm rollback failed: " + e.getMessage(), e);
        }
    }

    /**
     * Deploy using Kubernetes API directly
     */
    @SuppressWarnings("unchecked")
    private String deployWithKubernetesApi(String namespace, String workflowName, String imageTag, Map<String, Object> values) {
        String deploymentName = sanitizeReleaseName(workflowName);

        Map<String, String> labels = new HashMap<>();
        labels.put("app", deploymentName);
        labels.put("version", getImageTag(imageTag));
        labels.put("managed-by", "procedure-builder");

        int replicas = (int) values.getOrDefault("replicaCount", 2);
        Map<String, Object> resources = (Map<String, Object>) values.getOrDefault("resources", new HashMap<>());

        // Create Deployment
        Deployment deployment = new DeploymentBuilder()
            .withNewMetadata()
                .withName(deploymentName)
                .withNamespace(namespace)
                .withLabels(labels)
            .endMetadata()
            .withNewSpec()
                .withReplicas(replicas)
                .withNewSelector()
                    .withMatchLabels(Map.of("app", deploymentName))
                .endSelector()
                .withNewTemplate()
                    .withNewMetadata()
                        .withLabels(labels)
                    .endMetadata()
                    .withNewSpec()
                        .addNewContainer()
                            .withName(deploymentName)
                            .withImage(imageTag)
                            .addNewPort()
                                .withContainerPort(8080)
                                .withName("http")
                            .endPort()
                            .withNewResources()
                                .withRequests(parseResources((Map<String, String>) resources.get("requests")))
                                .withLimits(parseResources((Map<String, String>) resources.get("limits")))
                            .endResources()
                            .withNewLivenessProbe()
                                .withNewHttpGet()
                                    .withPath("/actuator/health/liveness")
                                    .withNewPort(8080)
                                .endHttpGet()
                                .withInitialDelaySeconds(60)
                                .withPeriodSeconds(10)
                            .endLivenessProbe()
                            .withNewReadinessProbe()
                                .withNewHttpGet()
                                    .withPath("/actuator/health/readiness")
                                    .withNewPort(8080)
                                .endHttpGet()
                                .withInitialDelaySeconds(30)
                                .withPeriodSeconds(5)
                            .endReadinessProbe()
                            .addNewEnv()
                                .withName("ZEEBE_ADDRESS")
                                .withValue("zeebe-gateway:26500")
                            .endEnv()
                        .endContainer()
                    .endSpec()
                .endTemplate()
            .endSpec()
            .build();

        kubernetesClient.apps().deployments()
            .inNamespace(namespace)
            .resource(deployment)
            .createOrReplace();

        log.info("Kubernetes deployment created: {}", deploymentName);

        // Create Service
        io.fabric8.kubernetes.api.model.Service service = new ServiceBuilder()
            .withNewMetadata()
                .withName(deploymentName)
                .withNamespace(namespace)
                .withLabels(labels)
            .endMetadata()
            .withNewSpec()
                .withSelector(Map.of("app", deploymentName))
                .addNewPort()
                    .withPort(80)
                    .withTargetPort(new IntOrString(8080))
                    .withName("http")
                .endPort()
            .endSpec()
            .build();

        kubernetesClient.services()
            .inNamespace(namespace)
            .resource(service)
            .createOrReplace();

        log.info("Kubernetes service created: {}", deploymentName);

        return deploymentName;
    }

    private void ensureNamespaceExists(String namespace) {
        if (kubernetesClient.namespaces().withName(namespace).get() == null) {
            Namespace ns = new NamespaceBuilder()
                .withNewMetadata()
                    .withName(namespace)
                    .withLabels(Map.of("managed-by", "procedure-builder"))
                .endMetadata()
                .build();

            kubernetesClient.namespaces().resource(ns).create();
            log.info("Created namespace: {}", namespace);
        }
    }

    private Map<String, Quantity> parseResources(Map<String, String> resources) {
        Map<String, Quantity> result = new HashMap<>();
        if (resources != null) {
            resources.forEach((key, value) -> result.put(key, new Quantity(value)));
        }
        return result;
    }

    private String sanitizeReleaseName(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9-]", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }

    private String getImageRepository(String fullImageTag) {
        int colonIndex = fullImageTag.lastIndexOf(':');
        return colonIndex > 0 ? fullImageTag.substring(0, colonIndex) : fullImageTag;
    }

    private String getImageTag(String fullImageTag) {
        int colonIndex = fullImageTag.lastIndexOf(':');
        return colonIndex > 0 ? fullImageTag.substring(colonIndex + 1) : "latest";
    }
}
