import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        router.navigate(['/']);
      }
      if (error.status === 403) {
        // Forbidden - redirect to dashboard
        router.navigate(['/dashboard'], {
          queryParams: { error: 'forbidden' }
        });
      }
      return throwError(() => error);
    })
  );
};
