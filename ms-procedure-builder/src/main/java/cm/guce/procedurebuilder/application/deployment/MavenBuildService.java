package cm.guce.procedurebuilder.application.deployment;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Service for building Maven projects
 */
@Service
@Slf4j
public class MavenBuildService {

    @Value("${maven.executable:mvn}")
    private String mavenExecutable;

    @Value("${maven.settings:}")
    private String mavenSettings;

    @Value("${maven.build.timeout:600}")
    private int buildTimeoutSeconds;

    /**
     * Build a Maven project
     */
    public BuildResult build(Path projectPath) {
        log.info("Building Maven project at {}", projectPath);

        try {
            ProcessBuilder processBuilder = new ProcessBuilder();

            // Build Maven command
            if (mavenSettings != null && !mavenSettings.isEmpty()) {
                processBuilder.command(mavenExecutable, "clean", "package", "-DskipTests", "-s", mavenSettings);
            } else {
                processBuilder.command(mavenExecutable, "clean", "package", "-DskipTests");
            }

            processBuilder.directory(projectPath.toFile());
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            // Capture output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    log.debug("[Maven] {}", line);
                }
            }

            boolean completed = process.waitFor(buildTimeoutSeconds, TimeUnit.SECONDS);

            if (!completed) {
                process.destroyForcibly();
                log.error("Maven build timed out after {} seconds", buildTimeoutSeconds);
                return BuildResult.builder()
                    .success(false)
                    .output("Build timed out after " + buildTimeoutSeconds + " seconds")
                    .build();
            }

            int exitCode = process.exitValue();
            boolean success = exitCode == 0;

            if (success) {
                log.info("Maven build successful");
            } else {
                log.error("Maven build failed with exit code {}", exitCode);
            }

            return BuildResult.builder()
                .success(success)
                .exitCode(exitCode)
                .output(output.toString())
                .artifactPath(success ? findArtifact(projectPath) : null)
                .build();

        } catch (IOException | InterruptedException e) {
            log.error("Maven build failed", e);
            return BuildResult.builder()
                .success(false)
                .output("Build error: " + e.getMessage())
                .build();
        }
    }

    /**
     * Run Maven tests
     */
    public BuildResult runTests(Path projectPath) {
        log.info("Running Maven tests at {}", projectPath);

        try {
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command(mavenExecutable, "test");
            processBuilder.directory(projectPath.toFile());
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            boolean completed = process.waitFor(buildTimeoutSeconds, TimeUnit.SECONDS);
            if (!completed) {
                process.destroyForcibly();
            }

            int exitCode = process.exitValue();

            return BuildResult.builder()
                .success(exitCode == 0)
                .exitCode(exitCode)
                .output(output.toString())
                .build();

        } catch (IOException | InterruptedException e) {
            log.error("Maven test failed", e);
            return BuildResult.builder()
                .success(false)
                .output("Test error: " + e.getMessage())
                .build();
        }
    }

    private Path findArtifact(Path projectPath) {
        Path targetDir = projectPath.resolve("target");
        if (targetDir.toFile().exists()) {
            java.io.File[] jars = targetDir.toFile().listFiles((dir, name) ->
                name.endsWith(".jar") && !name.endsWith("-sources.jar") && !name.endsWith("-javadoc.jar")
            );
            if (jars != null && jars.length > 0) {
                return jars[0].toPath();
            }
        }
        return null;
    }

    @Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @lombok.Builder
    public static class BuildResult {
        private boolean success;
        private int exitCode;
        private String output;
        private Path artifactPath;
    }
}
