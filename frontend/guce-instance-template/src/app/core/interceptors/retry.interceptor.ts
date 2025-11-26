import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Retry Interceptor for GUCE Instance
 * Automatically retries failed requests with exponential backoff
 */
export const retryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Skip retry for non-idempotent methods
  const nonIdempotentMethods = ['POST', 'PATCH'];
  const shouldRetry = !nonIdempotentMethods.includes(req.method.toUpperCase());

  // Skip retry for specific endpoints
  const noRetryEndpoints = [
    '/login',
    '/logout',
    '/payments/initiate',
    '/declarations/submit',
    '/workflow/complete'
  ];
  const isNoRetryEndpoint = noRetryEndpoints.some(endpoint => req.url.includes(endpoint));

  if (!shouldRetry || isNoRetryEndpoint) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: environment.api.retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on network errors or 5xx server errors
        if (!isRetryableError(error)) {
          return throwError(() => error);
        }

        // Exponential backoff: 1s, 2s, 4s, ...
        const delayMs = environment.api.retryDelay * Math.pow(2, retryCount - 1);
        console.log(`Retrying request (attempt ${retryCount}/${environment.api.retryAttempts}) after ${delayMs}ms`);

        return timer(delayMs);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (isRetryableError(error)) {
        console.error(`Request failed after ${environment.api.retryAttempts} retries:`, req.url);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Determine if error is retryable
 */
function isRetryableError(error: HttpErrorResponse): boolean {
  // Network errors (no status)
  if (error.status === 0) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Request timeout
  if (error.status === 408) {
    return true;
  }

  // Too many requests (rate limiting)
  if (error.status === 429) {
    return true;
  }

  return false;
}
