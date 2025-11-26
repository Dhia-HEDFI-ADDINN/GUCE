package cm.guce.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Configuration de sécurité Spring Security avec OAuth2/Keycloak.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/actuator/health/**").permitAll()
                        .requestMatchers("/actuator/info").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        // Endpoints admin
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN_TECHNIQUE")
                        // Tous les autres endpoints nécessitent une authentification
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(keycloakJwtConverter()))
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .build();
    }

    @Bean
    public JwtAuthenticationConverter keycloakJwtConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakGrantedAuthoritiesConverter());
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Convertisseur des rôles Keycloak vers Spring Security GrantedAuthorities.
     */
    private static class KeycloakGrantedAuthoritiesConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

        @Override
        @SuppressWarnings("unchecked")
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            Set<GrantedAuthority> authorities = new HashSet<>();

            // Extraction des rôles du realm (realm_access.roles)
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null && realmAccess.containsKey("roles")) {
                List<String> roles = (List<String>) realmAccess.get("roles");
                authorities.addAll(roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        .collect(Collectors.toSet()));
            }

            // Extraction des rôles du client (resource_access.{client}.roles)
            Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
            if (resourceAccess != null) {
                resourceAccess.forEach((clientId, access) -> {
                    if (access instanceof Map) {
                        Map<String, Object> clientAccess = (Map<String, Object>) access;
                        if (clientAccess.containsKey("roles")) {
                            List<String> roles = (List<String>) clientAccess.get("roles");
                            authorities.addAll(roles.stream()
                                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                                    .collect(Collectors.toSet()));
                        }
                    }
                });
            }

            // Extraction des groupes
            List<String> groups = jwt.getClaimAsStringList("groups");
            if (groups != null) {
                authorities.addAll(groups.stream()
                        .map(group -> new SimpleGrantedAuthority("GROUP_" + group.toUpperCase()))
                        .collect(Collectors.toSet()));
            }

            return authorities;
        }
    }
}
