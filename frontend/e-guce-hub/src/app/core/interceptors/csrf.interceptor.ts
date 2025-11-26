import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * CSRF Protection Interceptor for E-GUCE Hub
 * Adds CSRF token to state-changing requests (POST, PUT, PATCH, DELETE)
 */
export const csrfInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Skip CSRF for non-API requests
  if (!req.url.startsWith(environment.api.baseUrl)) {
    return next(req);
  }

  // Skip CSRF for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next(req);
  }

  // Skip if CSRF is disabled in environment
  if (!environment.security.csrf.enabled) {
    return next(req);
  }

  // Get CSRF token from cookie
  const csrfToken = getCsrfTokenFromCookie(environment.security.csrf.cookieName);

  if (csrfToken) {
    const csrfReq = req.clone({
      setHeaders: {
        [environment.security.csrf.headerName]: csrfToken
      }
    });
    return next(csrfReq);
  }

  return next(req);
};

/**
 * Extract CSRF token from cookie
 */
function getCsrfTokenFromCookie(cookieName: string): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}
