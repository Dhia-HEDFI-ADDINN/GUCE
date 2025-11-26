import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * JWT Interceptor for E-GUCE Hub
 * Injects the Keycloak access token into all API requests
 */
export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Skip token injection for non-API requests
  if (!shouldInjectToken(req.url)) {
    return next(req);
  }

  // Get Keycloak instance from window (initialized by keycloak-angular)
  const keycloak = (window as any).keycloakInstance;

  if (!keycloak?.authenticated) {
    return next(req);
  }

  // Check if token needs refresh
  return from(keycloak.updateToken(environment.keycloak.tokenMinValidity)).pipe(
    switchMap(() => {
      const token = keycloak.token;
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    }),
    catchError((error) => {
      console.warn('Failed to refresh token:', error);
      // If token refresh fails, proceed without token
      // The auth interceptor will handle 401 errors
      return next(req);
    })
  );
};

/**
 * Determine if token should be injected for this URL
 */
function shouldInjectToken(url: string): boolean {
  // Inject token for API requests
  if (url.startsWith(environment.api.baseUrl)) {
    return true;
  }

  // Inject token for WebSocket upgrade requests
  if (url.startsWith(environment.websocket.url.replace('ws', 'http'))) {
    return true;
  }

  // Don't inject for Keycloak URLs (it handles its own auth)
  if (url.includes(environment.keycloak.url)) {
    return false;
  }

  // Don't inject for external URLs
  if (url.startsWith('http') && !url.includes(window.location.hostname)) {
    return false;
  }

  return false;
}
