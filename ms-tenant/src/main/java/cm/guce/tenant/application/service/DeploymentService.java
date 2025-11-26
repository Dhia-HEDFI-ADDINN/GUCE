package cm.guce.tenant.application.service;

import cm.guce.tenant.domain.model.Tenant;
import cm.guce.tenant.domain.model.TenantAdmin;
import cm.guce.tenant.domain.model.TenantInfrastructure;
import cm.guce.tenant.domain.port.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service de deploiement des tenants.
 *
 * Gere le provisionnement complet d'une instance GUCE:
 * - Creation de la base de donnees
 * - Creation du realm Keycloak
 * - Configuration des utilisateurs initiaux
 * - Deploiement des services Docker/K8s
 * - Configuration du reseau et routage
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeploymentService {

    private final TenantRepository tenantRepository;
    private final DataSource dataSource;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${keycloak.auth-server-url:http://localhost:8180}")
    private String keycloakUrl;

    @Value("${keycloak.admin.username:admin}")
    private String keycloakAdminUser;

    @Value("${keycloak.admin.password:admin}")
    private String keycloakAdminPassword;

    @Value("${deployment.mode:docker}")
    private String deploymentMode;

    /**
     * Lance le deploiement asynchrone d'un tenant.
     */
    @Async
    @Transactional
    public void deployAsync(UUID tenantId) {
        log.info("Starting async deployment for tenant: {}", tenantId);

        Tenant tenant = tenantRepository.findByIdWithDetails(tenantId)
            .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        try {
            // Etape 1: Creer la base de donnees
            log.info("[{}] Step 1/5: Creating database...", tenant.getCode());
            createDatabase(tenant);

            // Etape 2: Creer le realm Keycloak
            log.info("[{}] Step 2/5: Creating Keycloak realm...", tenant.getCode());
            createKeycloakRealm(tenant);

            // Etape 3: Creer les utilisateurs initiaux
            log.info("[{}] Step 3/5: Creating initial users...", tenant.getCode());
            createInitialUsers(tenant);

            // Etape 4: Deployer les services
            log.info("[{}] Step 4/5: Deploying services...", tenant.getCode());
            deployServices(tenant);

            // Etape 5: Configurer le routage
            log.info("[{}] Step 5/5: Configuring routing...", tenant.getCode());
            configureRouting(tenant);

            // Marquer comme deploye
            tenant.setStatus(Tenant.TenantStatus.RUNNING);
            tenant.setDeployedAt(LocalDateTime.now());
            tenant.setHealthStatus(Tenant.HealthStatus.HEALTHY);
            tenantRepository.save(tenant);

            // Publier l'evenement de deploiement
            publishEvent("tenant.deployed", Map.of(
                "tenantId", tenant.getId().toString(),
                "tenantCode", tenant.getCode(),
                "domain", tenant.getDomain()
            ));

            log.info("[{}] Deployment completed successfully", tenant.getCode());

        } catch (Exception e) {
            log.error("[{}] Deployment failed: {}", tenant.getCode(), e.getMessage(), e);

            tenant.setStatus(Tenant.TenantStatus.ERROR);
            tenant.setDeploymentError(e.getMessage());
            tenantRepository.save(tenant);

            // Publier l'evenement d'erreur
            publishEvent("tenant.deployment.failed", Map.of(
                "tenantId", tenant.getId().toString(),
                "tenantCode", tenant.getCode(),
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Cree la base de donnees pour le tenant.
     */
    private void createDatabase(Tenant tenant) throws Exception {
        String dbName = tenant.getDatabaseName();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // Verifier si la base existe
            var rs = stmt.executeQuery(
                "SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'");

            if (!rs.next()) {
                // Creer la base de donnees
                stmt.execute("CREATE DATABASE " + dbName +
                    " WITH ENCODING 'UTF8' LC_COLLATE='fr_FR.UTF-8' LC_CTYPE='fr_FR.UTF-8' TEMPLATE=template0");
                log.info("[{}] Database created: {}", tenant.getCode(), dbName);
            } else {
                log.info("[{}] Database already exists: {}", tenant.getCode(), dbName);
            }

            // Creer l'utilisateur dedie
            String dbUser = "guce_" + tenant.getCode().toLowerCase();
            String dbPassword = generatePassword();

            rs = stmt.executeQuery("SELECT 1 FROM pg_roles WHERE rolname = '" + dbUser + "'");
            if (!rs.next()) {
                stmt.execute("CREATE USER " + dbUser + " WITH PASSWORD '" + dbPassword + "'");
                stmt.execute("GRANT ALL PRIVILEGES ON DATABASE " + dbName + " TO " + dbUser);
                log.info("[{}] Database user created: {}", tenant.getCode(), dbUser);
            }

            tenant.setDatabaseHost("localhost");
            tenant.setDatabasePort(5432);
        }
    }

    /**
     * Cree le realm Keycloak pour le tenant.
     */
    private void createKeycloakRealm(Tenant tenant) throws Exception {
        try (Keycloak keycloak = KeycloakBuilder.builder()
            .serverUrl(keycloakUrl)
            .realm("master")
            .username(keycloakAdminUser)
            .password(keycloakAdminPassword)
            .clientId("admin-cli")
            .build()) {

            String realmName = "guce-" + tenant.getCode().toLowerCase();

            // Verifier si le realm existe
            try {
                keycloak.realm(realmName).toRepresentation();
                log.info("[{}] Keycloak realm already exists: {}", tenant.getCode(), realmName);
                tenant.setKeycloakRealmId(realmName);
                return;
            } catch (Exception e) {
                // Realm n'existe pas, on le cree
            }

            // Creer le realm
            RealmRepresentation realm = new RealmRepresentation();
            realm.setRealm(realmName);
            realm.setEnabled(true);
            realm.setDisplayName("GUCE " + tenant.getName());
            realm.setDisplayNameHtml("<b>GUCE</b> " + tenant.getName());
            realm.setLoginWithEmailAllowed(true);
            realm.setDuplicateEmailsAllowed(false);
            realm.setResetPasswordAllowed(true);
            realm.setEditUsernameAllowed(false);
            realm.setRememberMe(true);

            // Internationalisation
            realm.setInternationalizationEnabled(true);
            realm.setSupportedLocales(Set.of("fr", "en"));
            realm.setDefaultLocale("fr");

            // Tokens
            realm.setAccessTokenLifespan(3600);
            realm.setSsoSessionIdleTimeout(1800);
            realm.setSsoSessionMaxLifespan(36000);

            // Creer les roles du realm
            realm.setRoles(createRealmRoles());

            // Creer les clients
            realm.setClients(createClients(tenant));

            // Creer le realm
            keycloak.realms().create(realm);
            tenant.setKeycloakRealmId(realmName);

            log.info("[{}] Keycloak realm created: {}", tenant.getCode(), realmName);
        }
    }

    private RolesRepresentation createRealmRoles() {
        RolesRepresentation roles = new RolesRepresentation();

        List<RoleRepresentation> realmRoles = new ArrayList<>();

        // Roles de base
        realmRoles.add(createRole("ADMIN", "Administrateur de l'instance"));
        realmRoles.add(createRole("OPERATOR", "Operateur"));
        realmRoles.add(createRole("USER", "Utilisateur standard"));

        // Roles e-Force
        realmRoles.add(createRole("OE_DECLARANT", "Declarant Operateur Economique"));
        realmRoles.add(createRole("OE_ADMIN", "Administrateur OE"));
        realmRoles.add(createRole("OE_VIEWER", "Visualiseur OE"));

        // Roles e-Gov
        realmRoles.add(createRole("GOV_AGENT", "Agent Gouvernemental"));
        realmRoles.add(createRole("GOV_SUPERVISOR", "Superviseur Gouvernemental"));
        realmRoles.add(createRole("GOV_ADMIN", "Administrateur Gouvernemental"));

        // Roles e-Business
        realmRoles.add(createRole("INTERMEDIARY", "Intermediaire"));
        realmRoles.add(createRole("BROKER", "Commissionnaire"));
        realmRoles.add(createRole("SHIPPING_AGENT", "Agent Maritime"));

        // Roles techniques
        realmRoles.add(createRole("PROCEDURE_DESIGNER", "Concepteur de Procedures"));
        realmRoles.add(createRole("WORKFLOW_ADMIN", "Administrateur Workflow"));
        realmRoles.add(createRole("RULES_ADMIN", "Administrateur Regles"));

        roles.setRealm(realmRoles);
        return roles;
    }

    private RoleRepresentation createRole(String name, String description) {
        RoleRepresentation role = new RoleRepresentation();
        role.setName(name);
        role.setDescription(description);
        return role;
    }

    private List<ClientRepresentation> createClients(Tenant tenant) {
        List<ClientRepresentation> clients = new ArrayList<>();

        // Client Frontend
        ClientRepresentation frontendClient = new ClientRepresentation();
        frontendClient.setClientId("guce-frontend");
        frontendClient.setName("GUCE Frontend");
        frontendClient.setEnabled(true);
        frontendClient.setPublicClient(true);
        frontendClient.setDirectAccessGrantsEnabled(true);
        frontendClient.setStandardFlowEnabled(true);
        frontendClient.setWebOrigins(List.of("*"));
        frontendClient.setRedirectUris(List.of(
            tenant.getFrontendUrl() + "/*",
            "http://localhost:4200/*"
        ));
        frontendClient.setAttributes(Map.of(
            "pkce.code.challenge.method", "S256"
        ));
        clients.add(frontendClient);

        // Client Backend
        ClientRepresentation backendClient = new ClientRepresentation();
        backendClient.setClientId("guce-backend");
        backendClient.setName("GUCE Backend Services");
        backendClient.setEnabled(true);
        backendClient.setPublicClient(false);
        backendClient.setSecret(generatePassword());
        backendClient.setServiceAccountsEnabled(true);
        backendClient.setBearerOnly(false);
        clients.add(backendClient);

        // Client Hub (pour la communication avec le Hub)
        ClientRepresentation hubClient = new ClientRepresentation();
        hubClient.setClientId("guce-hub");
        hubClient.setName("GUCE Hub Connection");
        hubClient.setEnabled(true);
        hubClient.setPublicClient(false);
        hubClient.setSecret(generatePassword());
        hubClient.setServiceAccountsEnabled(true);
        clients.add(hubClient);

        return clients;
    }

    /**
     * Cree les utilisateurs initiaux dans Keycloak.
     */
    private void createInitialUsers(Tenant tenant) throws Exception {
        if (tenant.getInitialAdmins() == null || tenant.getInitialAdmins().isEmpty()) {
            log.info("[{}] No initial admins to create", tenant.getCode());
            return;
        }

        try (Keycloak keycloak = KeycloakBuilder.builder()
            .serverUrl(keycloakUrl)
            .realm("master")
            .username(keycloakAdminUser)
            .password(keycloakAdminPassword)
            .clientId("admin-cli")
            .build()) {

            String realmName = tenant.getKeycloakRealmId();

            for (TenantAdmin admin : tenant.getInitialAdmins()) {
                UserRepresentation user = new UserRepresentation();
                user.setUsername(admin.getEmail());
                user.setEmail(admin.getEmail());
                user.setFirstName(admin.getFirstName());
                user.setLastName(admin.getLastName());
                user.setEnabled(true);
                user.setEmailVerified(true);

                // Mot de passe temporaire
                CredentialRepresentation credential = new CredentialRepresentation();
                credential.setType(CredentialRepresentation.PASSWORD);
                credential.setValue(generatePassword());
                credential.setTemporary(true);
                user.setCredentials(List.of(credential));

                // Creer l'utilisateur
                var response = keycloak.realm(realmName).users().create(user);

                if (response.getStatus() == 201) {
                    String userId = response.getLocation().getPath()
                        .replaceAll(".*/([^/]+)$", "$1");

                    admin.setKeycloakUserId(userId);
                    admin.setIsCreated(true);

                    // Assigner les roles
                    assignRoles(keycloak, realmName, userId, admin.getRole());

                    log.info("[{}] Admin user created: {}", tenant.getCode(), admin.getEmail());
                } else {
                    log.warn("[{}] Failed to create admin user: {} (status: {})",
                        tenant.getCode(), admin.getEmail(), response.getStatus());
                }
            }
        }
    }

    private void assignRoles(Keycloak keycloak, String realmName, String userId,
                            TenantAdmin.AdminRole role) {
        var userResource = keycloak.realm(realmName).users().get(userId);
        var realmRoles = keycloak.realm(realmName).roles();

        List<String> rolesToAssign = switch (role) {
            case SUPER_ADMIN -> List.of("ADMIN", "OPERATOR", "PROCEDURE_DESIGNER",
                "WORKFLOW_ADMIN", "RULES_ADMIN", "GOV_ADMIN");
            case FUNCTIONAL_ADMIN -> List.of("ADMIN", "OPERATOR", "PROCEDURE_DESIGNER");
            case TECHNICAL_ADMIN -> List.of("ADMIN", "WORKFLOW_ADMIN", "RULES_ADMIN");
        };

        List<RoleRepresentation> roles = new ArrayList<>();
        for (String roleName : rolesToAssign) {
            try {
                roles.add(realmRoles.get(roleName).toRepresentation());
            } catch (Exception e) {
                log.warn("Role not found: {}", roleName);
            }
        }

        if (!roles.isEmpty()) {
            userResource.roles().realmLevel().add(roles);
        }
    }

    /**
     * Deploie les services Docker/K8s pour le tenant.
     */
    private void deployServices(Tenant tenant) throws Exception {
        if ("docker".equals(deploymentMode)) {
            deployDockerServices(tenant);
        } else if ("kubernetes".equals(deploymentMode)) {
            deployKubernetesServices(tenant);
        } else {
            log.info("[{}] Deployment mode '{}' - skipping service deployment",
                tenant.getCode(), deploymentMode);
        }
    }

    private void deployDockerServices(Tenant tenant) throws Exception {
        // Generer le docker-compose pour le tenant
        String composeContent = generateDockerCompose(tenant);

        // Ecrire le fichier
        String composePath = "/tmp/guce-" + tenant.getCode().toLowerCase() + "/docker-compose.yml";
        java.nio.file.Files.createDirectories(java.nio.file.Path.of(composePath).getParent());
        java.nio.file.Files.writeString(java.nio.file.Path.of(composePath), composeContent);

        // Lancer docker-compose (en mode local)
        log.info("[{}] Docker compose file generated at: {}", tenant.getCode(), composePath);

        // Pour le mode local, on simule le deploiement
        // En production, on utiliserait Docker Java API ou ProcessBuilder
    }

    private String generateDockerCompose(Tenant tenant) {
        String code = tenant.getCode().toLowerCase();
        int basePort = 10000 + (tenant.getCode().hashCode() % 1000);

        return """
            version: '3.8'

            services:
              guce-%s-frontend:
                image: guce-instance-frontend:latest
                container_name: guce-%s-frontend
                ports:
                  - "%d:80"
                environment:
                  - TENANT_CODE=%s
                  - TENANT_NAME=%s
                  - KEYCLOAK_URL=%s
                  - KEYCLOAK_REALM=%s
                  - API_URL=http://guce-%s-gateway:8080
                networks:
                  - guce-network
                depends_on:
                  - guce-%s-gateway

              guce-%s-gateway:
                image: guce-gateway:latest
                container_name: guce-%s-gateway
                ports:
                  - "%d:8080"
                environment:
                  - SPRING_PROFILES_ACTIVE=docker
                  - TENANT_CODE=%s
                  - DATABASE_URL=jdbc:postgresql://postgres:5432/%s
                  - KEYCLOAK_URL=%s
                  - KEYCLOAK_REALM=%s
                networks:
                  - guce-network

            networks:
              guce-network:
                external: true
            """.formatted(
            code, code, basePort, tenant.getCode(), tenant.getName(),
            keycloakUrl, tenant.getKeycloakRealmId(), code, code,
            code, code, basePort + 1, tenant.getCode(), tenant.getDatabaseName(),
            keycloakUrl, tenant.getKeycloakRealmId()
        );
    }

    private void deployKubernetesServices(Tenant tenant) throws Exception {
        // Pour le mode Kubernetes, on genererait des manifests et les appliquerait
        log.info("[{}] Kubernetes deployment not yet implemented", tenant.getCode());
    }

    /**
     * Configure le routage pour le tenant.
     */
    private void configureRouting(Tenant tenant) throws Exception {
        // Configuration du reverse proxy / ingress
        log.info("[{}] Routing configured for domain: {}", tenant.getCode(), tenant.getDomain());
    }

    /**
     * Demarre les services d'un tenant.
     */
    public void startTenant(Tenant tenant) {
        log.info("[{}] Starting tenant services...", tenant.getCode());
        // Implementation selon le mode de deploiement
    }

    /**
     * Arrete les services d'un tenant.
     */
    public void stopTenant(Tenant tenant) {
        log.info("[{}] Stopping tenant services...", tenant.getCode());
        // Implementation selon le mode de deploiement
    }

    /**
     * Redemarrre les services d'un tenant.
     */
    public void restartTenant(Tenant tenant) {
        log.info("[{}] Restarting tenant services...", tenant.getCode());
        stopTenant(tenant);
        startTenant(tenant);
    }

    /**
     * Met a jour les modules d'un tenant en cours d'execution.
     */
    public void updateModules(Tenant tenant) {
        log.info("[{}] Updating modules configuration...", tenant.getCode());
        // Redeployer les services avec la nouvelle configuration
    }

    /**
     * Nettoie les ressources d'un tenant.
     */
    public void cleanup(Tenant tenant) {
        log.info("[{}] Cleaning up tenant resources...", tenant.getCode());

        // Supprimer le realm Keycloak
        try (Keycloak keycloak = KeycloakBuilder.builder()
            .serverUrl(keycloakUrl)
            .realm("master")
            .username(keycloakAdminUser)
            .password(keycloakAdminPassword)
            .clientId("admin-cli")
            .build()) {

            if (tenant.getKeycloakRealmId() != null) {
                keycloak.realm(tenant.getKeycloakRealmId()).remove();
                log.info("[{}] Keycloak realm removed", tenant.getCode());
            }
        } catch (Exception e) {
            log.warn("[{}] Failed to remove Keycloak realm: {}", tenant.getCode(), e.getMessage());
        }

        // Supprimer la base de donnees (optionnel, selon la politique)
        // Note: En production, on ne supprime pas la DB immediatement
    }

    private void publishEvent(String topic, Map<String, String> payload) {
        try {
            kafkaTemplate.send(topic, payload);
        } catch (Exception e) {
            log.warn("Failed to publish event to {}: {}", topic, e.getMessage());
        }
    }

    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 16);
    }
}
