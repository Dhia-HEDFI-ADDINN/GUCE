import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { from, switchMap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * JWT Interceptor for GUCE Instance
 * Injects the Keycloak access token and instance headers into all API requests
 */
export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Skip token injection for non-API requests
  if (!shouldInjectToken(req.url)) {
    return next(req);
  }

  // Get Keycloak instance from window (initialized by keycloak-angular)
  const keycloak = (window as any).keycloakInstance;

  if (!keycloak?.authenticated) {
    // Still add instance header even without auth
    const instanceReq = req.clone({
      setHeaders: {
        'X-Instance-Code': environment.instance.code
      }
    });
    return next(instanceReq);
  }

  // Check if token needs refresh
  return from(keycloak.updateToken(environment.keycloak.tokenMinValidity)).pipe(
    switchMap(() => {
      const token = keycloak.token;
      const headers: Record<string, string> = {
        'X-Instance-Code': environment.instance.code
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const authReq = req.clone({ setHeaders: headers });
      return next(authReq);
    }),
    catchError((error) => {
      console.warn('Failed to refresh token:', error);
      // If token refresh fails, proceed with instance header only
      const instanceReq = req.clone({
        setHeaders: {
          'X-Instance-Code': environment.instance.code
        }
      });
      return next(instanceReq);
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

  // Inject token for Hub communication
  if (environment.hub.enabled && url.startsWith(environment.hub.url)) {
    return true;
  }

  // Don't inject for Keycloak URLs
  if (url.includes(environment.keycloak.url)) {
    return false;
  }

  // Don't inject for external integrations (they have their own auth)
  const externalUrls = [
    environment.externalServices?.banking?.url,
    environment.externalServices?.customs?.url,
    environment.externalServices?.port?.url
  ].filter(Boolean);

  if (externalUrls.some(extUrl => extUrl && url.startsWith(extUrl))) {
    return false;
  }

  return false;
}
