import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { buildApiUrl } from './endpoint';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loginEndpoint = buildApiUrl(environment.apiBaseUrl, environment.apiEndpoints.authLogin);
  const token = request.url.startsWith(environment.apiBaseUrl) ? auth.token() : null;
  const authenticatedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && request.url !== loginEndpoint) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { reason: 'expired' } });
      }
      return throwError(() => error);
    }),
  );
};
