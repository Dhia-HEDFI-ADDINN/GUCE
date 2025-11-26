import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Error Interceptor for GUCE Instance
 * Centralizes error handling, logging, and navigation
 */
export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error for monitoring
      logError(req, error);

      // Handle specific error codes
      switch (error.status) {
        case 401:
          handleUnauthorized(router);
          break;

        case 403:
          handleForbidden(router, req.url);
          break;

        case 404:
          // Let component handle 404 for resources
          break;

        case 503:
          handleServiceUnavailable(router);
          break;
      }

      // Transform error for better handling by components
      const transformedError = transformError(error);
      return throwError(() => transformedError);
    })
  );
};

/**
 * Log error to console and potentially to monitoring service
 */
function logError(req: HttpRequest<unknown>, error: HttpErrorResponse): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    instance: environment.instance.code,
    url: req.url,
    method: req.method,
    status: error.status,
    statusText: error.statusText,
    message: error.message,
    error: error.error
  };

  // Always log to console in non-production
  if (!environment.production) {
    console.error('HTTP Error:', errorLog);
  }

  // In production, send to logging service
  if (environment.production && environment.logging?.enabled) {
    sendToLoggingService(errorLog);
  }
}

/**
 * Send error to external logging service
 */
function sendToLoggingService(errorLog: any): void {
  // Placeholder for logging service integration
}

/**
 * Handle 401 Unauthorized
 */
function handleUnauthorized(router: Router): void {
  const keycloak = (window as any).keycloakInstance;

  if (keycloak?.authenticated) {
    // Token might have expired, try to re-login
    keycloak.login({
      redirectUri: window.location.href
    });
  } else {
    // Not authenticated, redirect to login
    router.navigate(['/'], {
      queryParams: { error: 'session_expired' }
    });
  }
}

/**
 * Handle 403 Forbidden
 */
function handleForbidden(router: Router, requestUrl: string): void {
  // Check if it's a workflow/admin action
  if (requestUrl.includes('/admin/') || requestUrl.includes('/workflow/')) {
    router.navigate(['/portal/dashboard'], {
      queryParams: { error: 'forbidden', action: 'admin' }
    });
  } else {
    router.navigate(['/portal/dashboard'], {
      queryParams: { error: 'forbidden' }
    });
  }
}

/**
 * Handle 503 Service Unavailable
 */
function handleServiceUnavailable(router: Router): void {
  router.navigate(['/maintenance']);
}

/**
 * Transform HTTP error to application error format
 */
function transformError(error: HttpErrorResponse): AppError {
  let message = 'Une erreur inattendue s\'est produite';
  let code = 'UNKNOWN_ERROR';
  let details: any = null;

  if (error.error instanceof ErrorEvent) {
    // Client-side error
    message = error.error.message;
    code = 'CLIENT_ERROR';
  } else {
    // Server-side error
    if (error.error?.message) {
      message = error.error.message;
    } else {
      message = getDefaultMessage(error.status);
    }

    if (error.error?.code) {
      code = error.error.code;
    } else {
      code = `HTTP_${error.status}`;
    }

    details = error.error?.details || error.error?.errors;
  }

  return {
    status: error.status,
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get default message for HTTP status code (French)
 */
function getDefaultMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Requête invalide. Veuillez vérifier vos données.',
    401: 'Votre session a expiré. Veuillez vous reconnecter.',
    403: 'Vous n\'avez pas les droits nécessaires pour cette action.',
    404: 'La ressource demandée n\'a pas été trouvée.',
    409: 'Un conflit est survenu. La ressource a peut-être été modifiée.',
    422: 'Les données soumises sont invalides.',
    429: 'Trop de requêtes. Veuillez réessayer plus tard.',
    500: 'Une erreur interne du serveur s\'est produite.',
    502: 'Le serveur est temporairement indisponible.',
    503: 'Le service est temporairement indisponible.',
    504: 'La requête a expiré. Veuillez réessayer.'
  };

  return messages[status] || `Une erreur s'est produite (${status})`;
}

/**
 * Application error interface
 */
export interface AppError {
  status: number;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
