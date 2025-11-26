import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Loading Interceptor for E-GUCE Hub
 * Tracks HTTP requests to show/hide loading indicators
 */
export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loadingService = inject(LoadingService);

  // Skip loading indicator for certain requests
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  // Check for custom header to skip loading
  if (req.headers.has('X-Skip-Loading')) {
    const modifiedReq = req.clone({
      headers: req.headers.delete('X-Skip-Loading')
    });
    return next(modifiedReq);
  }

  // Start loading
  loadingService.startRequest(req.url);

  return next(req).pipe(
    finalize(() => {
      loadingService.endRequest(req.url);
    })
  );
};

/**
 * Determine if loading indicator should be skipped
 */
function shouldSkipLoading(req: HttpRequest<unknown>): boolean {
  const skipPatterns = [
    // Skip for polling endpoints
    '/health',
    '/status',
    '/ping',
    // Skip for background sync
    '/notifications/count',
    '/messages/unread',
    // Skip for WebSocket upgrade
    '/ws'
  ];

  return skipPatterns.some(pattern => req.url.includes(pattern));
}
