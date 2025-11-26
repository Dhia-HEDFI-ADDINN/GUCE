package cm.guce.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration OpenAPI / Swagger pour la documentation des APIs.
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.application.name:GUCE Service}")
    private String applicationName;

    @Value("${guce.openapi.server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${guce.keycloak.auth-server-url:http://localhost:8180}")
    private String keycloakUrl;

    @Value("${guce.keycloak.realm:guce-cameroun}")
    private String realm;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url(serverUrl).description("Serveur principal")
                ))
                .components(new Components()
                        .addSecuritySchemes("oauth2", securityScheme()))
                .addSecurityItem(new SecurityRequirement().addList("oauth2"));
    }

    private Info apiInfo() {
        return new Info()
                .title("API " + applicationName)
                .description("""
                        API du Guichet Unique du Commerce Extérieur (GUCE).

                        Cette API fait partie de la plateforme e-GUCE 3G et permet :
                        - La gestion des procédures du commerce extérieur
                        - La soumission et le traitement des déclarations
                        - L'échange de documents électroniques
                        - Le paiement en ligne des droits et taxes

                        **Standards supportés** : UN/CEFACT, OMD, Recommandation 33 ONU
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("GUCE - Support Technique")
                        .email("support@guce.cm")
                        .url("https://www.guce.cm"))
                .license(new License()
                        .name("Propriétaire")
                        .url("https://www.guce.cm/license"));
    }

    private SecurityScheme securityScheme() {
        String authorizationUrl = String.format("%s/realms/%s/protocol/openid-connect/auth",
                keycloakUrl, realm);
        String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token",
                keycloakUrl, realm);

        return new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .description("Authentification OAuth2 via Keycloak")
                .flows(new OAuthFlows()
                        .authorizationCode(new OAuthFlow()
                                .authorizationUrl(authorizationUrl)
                                .tokenUrl(tokenUrl)));
    }
}
