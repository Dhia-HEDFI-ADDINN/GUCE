import { inject } from '@angular/core';
import { CanActivateChildFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const RoleGuard: CanActivateChildFn = async (route: ActivatedRouteSnapshot) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRoles = keycloak.getUserRoles();
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    // Redirect to dashboard with access denied message
    await router.navigate(['/dashboard'], {
      queryParams: { error: 'access_denied' }
    });
    return false;
  }

  return true;
};
