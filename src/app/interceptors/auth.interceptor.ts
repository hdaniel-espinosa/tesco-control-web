import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * Adjunta el header Basic Auth guardado a cada llamada hacia la API, y si
 * el backend responde 401 (sesión inválida o expirada) limpia la sesión
 * local y regresa al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const authHeader = authService.getAuthHeader();
  const authReq = isApiRequest && authHeader ? req.clone({ setHeaders: { Authorization: authHeader } }) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (isApiRequest && error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
