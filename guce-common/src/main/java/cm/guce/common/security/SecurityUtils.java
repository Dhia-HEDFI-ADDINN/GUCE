package cm.guce.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utilitaires de sécurité pour accéder au contexte utilisateur.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class
    }

    /**
     * Récupère l'authentification courante.
     */
    public static Optional<Authentication> getCurrentAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    /**
     * Récupère l'ID utilisateur (subject du JWT).
     */
    public static Optional<String> getCurrentUserId() {
        return getCurrentAuthentication()
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken())
                .map(Jwt::getSubject);
    }

    /**
     * Récupère le nom d'utilisateur.
     */
    public static Optional<String> getCurrentUsername() {
        return getCurrentAuthentication()
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken())
                .map(jwt -> jwt.getClaimAsString("preferred_username"));
    }

    /**
     * Récupère l'email de l'utilisateur.
     */
    public static Optional<String> getCurrentUserEmail() {
        return getCurrentAuthentication()
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken())
                .map(jwt -> jwt.getClaimAsString("email"));
    }

    /**
     * Récupère le tenant ID (realm Keycloak).
     */
    public static Optional<String> getCurrentTenantId() {
        return getCurrentAuthentication()
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken())
                .map(jwt -> {
                    String issuer = jwt.getIssuer().toString();
                    // Extract realm from issuer URL: .../realms/guce-cameroun
                    String[] parts = issuer.split("/realms/");
                    return parts.length > 1 ? parts[1] : null;
                });
    }

    /**
     * Récupère les rôles de l'utilisateur.
     */
    public static Set<String> getCurrentUserRoles() {
        return getCurrentAuthentication()
                .map(Authentication::getAuthorities)
                .map(SecurityUtils::extractRoles)
                .orElse(Collections.emptySet());
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique.
     */
    public static boolean hasRole(GUCERole role) {
        return getCurrentUserRoles().contains(role.getRoleName());
    }

    /**
     * Vérifie si l'utilisateur a l'un des rôles spécifiés.
     */
    public static boolean hasAnyRole(GUCERole... roles) {
        Set<String> userRoles = getCurrentUserRoles();
        for (GUCERole role : roles) {
            if (userRoles.contains(role.getRoleName())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Vérifie si l'utilisateur est un administrateur.
     */
    public static boolean isAdmin() {
        return hasAnyRole(GUCERole.ADMIN_FONCTIONNEL, GUCERole.ADMIN_TECHNIQUE, GUCERole.SUPER_ADMIN);
    }

    private static Set<String> extractRoles(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .collect(Collectors.toSet());
    }

    /**
     * Récupère une claim personnalisée du JWT.
     */
    public static Optional<Object> getJwtClaim(String claimName) {
        return getCurrentAuthentication()
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken())
                .map(jwt -> jwt.getClaim(claimName));
    }
}
