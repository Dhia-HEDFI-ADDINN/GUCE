import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { environment } from '@env/environment';
import { httpInterceptors } from './core/interceptors';
import { AuthService } from './core/services/auth.service';

/**
 * Initialize Keycloak and Auth Service
 */
function initializeKeycloak(keycloak: KeycloakService, authService: AuthService) {
  return async () => {
    await keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256' // PKCE for enhanced security
      },
      enableBearerInterceptor: false, // We use custom interceptors
      bearerExcludedUrls: ['/assets']
    });

    // Initialize auth service after Keycloak is ready
    await authService.initialize();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(withInterceptors(httpInterceptors)),
    importProvidersFrom(KeycloakAngularModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, AuthService]
    }
  ]
};
