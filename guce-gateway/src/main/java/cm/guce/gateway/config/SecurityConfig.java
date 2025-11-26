package cm.guce.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for the API Gateway
 * Handles JWT validation, CORS, and route-based authorization
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeExchange(exchanges -> exchanges
                // Public endpoints
                .pathMatchers("/actuator/health", "/actuator/info").permitAll()
                .pathMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // Authentication endpoints
                .pathMatchers("/api/v1/auth/**").permitAll()

                // Tenant management - Hub admins only
                .pathMatchers("/api/v1/tenants/**").hasAnyRole("SUPER_ADMIN", "TENANT_MANAGER")

                // Generator - Hub admins and operators
                .pathMatchers("/api/v1/generator/**").hasAnyRole("SUPER_ADMIN", "GENERATOR_OPERATOR")

                // Monitoring - Various roles
                .pathMatchers(HttpMethod.GET, "/api/v1/monitoring/**").hasAnyRole("SUPER_ADMIN", "MONITORING_VIEWER", "TENANT_MANAGER")
                .pathMatchers("/api/v1/monitoring/**").hasRole("SUPER_ADMIN")

                // Templates - Hub admins and template managers
                .pathMatchers(HttpMethod.GET, "/api/v1/templates/**").authenticated()
                .pathMatchers("/api/v1/templates/**").hasAnyRole("SUPER_ADMIN", "TEMPLATE_MANAGER")

                // Admin endpoints - Super admin only
                .pathMatchers("/api/v1/admin/**").hasRole("SUPER_ADMIN")

                // Referential data - Read access for authenticated users
                .pathMatchers(HttpMethod.GET, "/api/v1/referential/**").authenticated()
                .pathMatchers("/api/v1/referential/**").hasAnyRole("SUPER_ADMIN", "ADMIN_FONCTIONNEL")

                // Procedures and declarations - Various roles
                .pathMatchers("/api/v1/procedures/**").authenticated()
                .pathMatchers("/api/v1/declarations/**").authenticated()

                // Documents
                .pathMatchers("/api/v1/documents/**").authenticated()

                // Payments
                .pathMatchers("/api/v1/payments/**").authenticated()

                // Notifications
                .pathMatchers("/api/v1/notifications/**").authenticated()

                // Audit - Admin only
                .pathMatchers("/api/v1/audit/**").hasAnyRole("SUPER_ADMIN", "ADMIN_FONCTIONNEL")

                // Workflow
                .pathMatchers("/api/v1/workflow/**").authenticated()

                // All other requests require authentication
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtDecoder(jwtDecoder()))
            )
            .build();
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        return ReactiveJwtDecoders.fromIssuerLocation(issuerUri);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:4200",      // Hub frontend dev
            "http://localhost:4201",      // Instance frontend dev
            "https://e-guce-hub.com",     // Hub frontend prod
            "https://*.guce-*.com"        // Instance frontends prod
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "X-Total-Count", "X-Request-Id"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
