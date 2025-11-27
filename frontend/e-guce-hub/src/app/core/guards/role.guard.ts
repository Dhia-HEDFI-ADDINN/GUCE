import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  try {
    const userRoles = keycloak.getUserRoles();
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (hasRequiredRole) {
      return true;
    }

    // Redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  } catch {
    router.navigate(['/unauthorized']);
    return false;
  }
};
