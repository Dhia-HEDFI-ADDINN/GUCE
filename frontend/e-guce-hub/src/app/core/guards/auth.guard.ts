import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  try {
    const isLoggedIn = keycloakService.isLoggedIn();

    if (!isLoggedIn) {
      // Try to login, but if Keycloak is not available, allow access (dev mode)
      try {
        await keycloakService.login({
          redirectUri: window.location.origin + state.url
        });
        return false;
      } catch {
        // Keycloak not available - allow access in dev mode
        console.warn('Keycloak not available - running in dev mode without authentication');
        return true;
      }
    }

    // Vérification des rôles si spécifiés dans la route
    const requiredRoles = route.data?.['roles'] as string[];
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = keycloakService.getUserRoles();
      // If no roles returned, allow access (dev mode)
      if (!userRoles || userRoles.length === 0) {
        return true;
      }
      const hasRequiredRole = requiredRoles.some(role => keycloakService.isUserInRole(role));
      if (!hasRequiredRole) {
        router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  } catch {
    // Keycloak error - allow access in dev mode
    console.warn('Keycloak error - running in dev mode without authentication');
    return true;
  }
};
