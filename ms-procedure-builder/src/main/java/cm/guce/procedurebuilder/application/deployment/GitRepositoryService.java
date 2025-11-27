package cm.guce.procedurebuilder.application.deployment;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.CredentialsProvider;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Service for Git operations - commits and pushes generated code
 */
@Service
@Slf4j
public class GitRepositoryService {

    @Value("${git.repository.url:}")
    private String repositoryUrl;

    @Value("${git.repository.branch:main}")
    private String branch;

    @Value("${git.credentials.username:}")
    private String username;

    @Value("${git.credentials.password:}")
    private String password;

    /**
     * Commit and push generated code to Git repository
     */
    public String commitAndPush(Path projectPath, String workflowName, String version, String message) {
        log.info("Committing workflow {} v{} to Git", workflowName, version);

        try {
            // Initialize or open Git repository
            Git git;
            if (projectPath.resolve(".git").toFile().exists()) {
                git = Git.open(projectPath.toFile());
            } else {
                git = Git.init()
                    .setDirectory(projectPath.toFile())
                    .call();

                // Add remote if configured
                if (repositoryUrl != null && !repositoryUrl.isEmpty()) {
                    git.remoteAdd()
                        .setName("origin")
                        .setUri(new org.eclipse.jgit.transport.URIish(repositoryUrl))
                        .call();
                }
            }

            // Add all files
            git.add()
                .addFilepattern(".")
                .call();

            // Commit
            var commit = git.commit()
                .setMessage(message)
                .setAuthor("Procedure Builder", "procedure-builder@e-guce.cm")
                .call();

            String commitSha = commit.getId().getName();
            log.info("Created commit: {}", commitSha);

            // Push if remote is configured
            if (repositoryUrl != null && !repositoryUrl.isEmpty()) {
                CredentialsProvider credentialsProvider = new UsernamePasswordCredentialsProvider(username, password);

                git.push()
                    .setRemote("origin")
                    .setCredentialsProvider(credentialsProvider)
                    .call();

                log.info("Pushed to remote repository");
            }

            git.close();
            return commitSha;

        } catch (GitAPIException | IOException | Exception e) {
            log.error("Failed to commit and push to Git", e);
            throw new RuntimeException("Git operation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Clone repository to local path
     */
    public void cloneRepository(Path targetPath) {
        if (repositoryUrl == null || repositoryUrl.isEmpty()) {
            log.warn("No Git repository URL configured");
            return;
        }

        try {
            CredentialsProvider credentialsProvider = new UsernamePasswordCredentialsProvider(username, password);

            Git.cloneRepository()
                .setURI(repositoryUrl)
                .setDirectory(targetPath.toFile())
                .setBranch(branch)
                .setCredentialsProvider(credentialsProvider)
                .call();

            log.info("Cloned repository to {}", targetPath);

        } catch (GitAPIException e) {
            log.error("Failed to clone repository", e);
            throw new RuntimeException("Clone failed: " + e.getMessage(), e);
        }
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }
}
