/**
 * GUCE Instance HTTP Interceptors
 * Export all interceptors in the order they should be applied
 */

export { jwtInterceptor } from './jwt.interceptor';
export { csrfInterceptor } from './csrf.interceptor';
export { retryInterceptor } from './retry.interceptor';
export { errorInterceptor } from './error.interceptor';
export { loadingInterceptor } from './loading.interceptor';
export { authInterceptor } from './auth.interceptor';

import { HttpInterceptorFn } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';
import { csrfInterceptor } from './csrf.interceptor';
import { retryInterceptor } from './retry.interceptor';
import { errorInterceptor } from './error.interceptor';
import { loadingInterceptor } from './loading.interceptor';

/**
 * Ordered list of interceptors for Angular's provideHttpClient
 * Order matters:
 * 1. Loading - start tracking immediately
 * 2. JWT - add auth token and instance header
 * 3. CSRF - add CSRF token
 * 4. Retry - handle retries before errors
 * 5. Error - final error handling
 */
export const httpInterceptors: HttpInterceptorFn[] = [
  loadingInterceptor,
  jwtInterceptor,
  csrfInterceptor,
  retryInterceptor,
  errorInterceptor
];
