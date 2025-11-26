import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Error Interceptor for E-GUCE Hub
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
          handleForbidden(router);
          break;

        case 404:
          // Don't redirect for API 404s - let the component handle it
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
  if (environment.production && environment.logging.enabled) {
    // Could send to Sentry, LogRocket, etc.
    // This is a placeholder for external logging integration
    sendToLoggingService(errorLog);
  }
}

/**
 * Send error to external logging service
 */
function sendToLoggingService(errorLog: any): void {
  // Placeholder for logging service integration
  // Example: Sentry.captureException(new Error(JSON.stringify(errorLog)));
}

/**
 * Handle 401 Unauthorized
 */
function handleUnauthorized(router: Router): void {
  // Clear any stored auth state
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
function handleForbidden(router: Router): void {
  router.navigate(['/dashboard'], {
    queryParams: { error: 'forbidden' }
  });
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
  let message = 'An unexpected error occurred';
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
 * Get default message for HTTP status code
 */
function getDefaultMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may have been modified.',
    422: 'The submitted data is invalid.',
    429: 'Too many requests. Please try again later.',
    500: 'An internal server error occurred.',
    502: 'The server is temporarily unavailable.',
    503: 'The service is temporarily unavailable.',
    504: 'The request timed out. Please try again.'
  };

  return messages[status] || `An error occurred (${status})`;
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
