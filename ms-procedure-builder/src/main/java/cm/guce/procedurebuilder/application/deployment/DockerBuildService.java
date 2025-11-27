package cm.guce.procedurebuilder.application.deployment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Service for building and pushing Docker images
 */
@Service
@Slf4j
public class DockerBuildService {

    @Value("${docker.registry.url:harbor.e-guce.cm}")
    private String registryUrl;

    @Value("${docker.registry.project:guce-workflows}")
    private String registryProject;

    @Value("${docker.registry.username:}")
    private String registryUsername;

    @Value("${docker.registry.password:}")
    private String registryPassword;

    @Value("${docker.build.timeout:900}")
    private int buildTimeoutSeconds;

    /**
     * Build and push Docker image
     */
    public String buildAndPush(Path projectPath, String workflowName, String version, String countryCode) {
        log.info("Building Docker image for {} v{}", workflowName, version);

        String imageName = sanitizeName(workflowName);
        String imageTag = String.format("%s/%s/%s-%s:%s",
            registryUrl,
            registryProject,
            countryCode.toLowerCase(),
            imageName,
            version
        );

        try {
            // Generate Dockerfile if not exists
            Path dockerfilePath = projectPath.resolve("Dockerfile");
            if (!Files.exists(dockerfilePath)) {
                generateDockerfile(projectPath, imageName);
            }

            // Build Docker image
            boolean buildSuccess = executeDockerCommand(projectPath,
                "docker", "build", "-t", imageTag, ".");

            if (!buildSuccess) {
                throw new RuntimeException("Docker build failed");
            }

            log.info("Docker image built: {}", imageTag);

            // Login to registry if credentials provided
            if (registryUsername != null && !registryUsername.isEmpty()) {
                executeDockerCommand(projectPath,
                    "docker", "login", registryUrl,
                    "-u", registryUsername,
                    "-p", registryPassword
                );
            }

            // Push to registry
            boolean pushSuccess = executeDockerCommand(projectPath,
                "docker", "push", imageTag);

            if (!pushSuccess) {
                throw new RuntimeException("Docker push failed");
            }

            log.info("Docker image pushed: {}", imageTag);

            return imageTag;

        } catch (Exception e) {
            log.error("Docker build and push failed", e);
            throw new RuntimeException("Docker operation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate Dockerfile for Spring Boot application
     */
    private void generateDockerfile(Path projectPath, String appName) throws IOException {
        String dockerfile = """
            # Build stage
            FROM eclipse-temurin:21-jdk-alpine AS builder
            WORKDIR /app
            COPY . .
            RUN ./mvnw clean package -DskipTests

            # Runtime stage
            FROM eclipse-temurin:21-jre-alpine
            WORKDIR /app

            # Create non-root user
            RUN addgroup -S guce && adduser -S guce -G guce
            USER guce

            # Copy JAR from builder
            COPY --from=builder /app/target/*.jar app.jar

            # JVM configuration
            ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

            EXPOSE 8080

            HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \\
                CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

            ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
            """;

        Files.writeString(projectPath.resolve("Dockerfile"), dockerfile);

        // Also create .dockerignore
        String dockerignore = """
            .git
            .gitignore
            .idea
            *.iml
            target
            !target/*.jar
            *.md
            docker-compose*.yml
            """;

        Files.writeString(projectPath.resolve(".dockerignore"), dockerignore);

        log.debug("Generated Dockerfile at {}", projectPath);
    }

    private boolean executeDockerCommand(Path workDir, String... command) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.directory(workDir.toFile());
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            // Log output
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("[Docker] {}", line);
                }
            }

            boolean completed = process.waitFor(buildTimeoutSeconds, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
                log.error("Docker command timed out");
                return false;
            }

            return process.exitValue() == 0;

        } catch (IOException | InterruptedException e) {
            log.error("Docker command failed", e);
            return false;
        }
    }

    private String sanitizeName(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9-]", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
}
