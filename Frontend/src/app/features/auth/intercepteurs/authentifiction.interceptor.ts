import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ERROR_MESSAGES, SERVER_ERROR_MESSAGES } from '../../../../constantes';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const token = cookieService.get('Authorization');
  const isApiUrl = req.url.startsWith(environment.apiUrl);

  // Skip token for login/register
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // Add token for API requests
  if (isApiUrl && token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
      withCredentials: true
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401 || 403:
            cookieService.delete('Authorization', '/');
            router.navigate(['/login']);
            toastr.error(ERROR_MESSAGES.TOKEN_EXPIRED);
            break;
          case 400:
            toastr.error(SERVER_ERROR_MESSAGES[400]);
            break;
          case 404:
            toastr.error(SERVER_ERROR_MESSAGES[404]);
            toastr.error(SERVER_ERROR_MESSAGES[500]);
            break;
          default:
            toastr.error(SERVER_ERROR_MESSAGES[500]);
            break;
        }
        return throwError(() => error);
      })
    );
  }

  // For API requests without token, still add withCredentials
  if (isApiUrl) {
    const authReq = req.clone({
      withCredentials: true
    });
    return next(authReq);
  }

  return next(req);
};