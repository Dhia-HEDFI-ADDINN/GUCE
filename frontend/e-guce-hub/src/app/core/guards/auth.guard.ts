import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const AuthGuard: CanActivateFn = async () => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const isAuthenticated = await keycloak.isLoggedIn();

  if (!isAuthenticated) {
    await keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
    return false;
  }

  return true;
};
