import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private readonly PUBLIC_ROUTES = [
        '/login',
    ];

    constructor(
        private cookieService: CookieService,
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Ne pas ajouter le token pour les routes publiques
        if (this.isPublicRoute(req.url)) {
            return next.handle(req);
        }

        const token = this.cookieService.get('authToken');

        if (token) {
            const clonedReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            return next.handle(clonedReq).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        // Vérifier si l'erreur vient de la route /me
                        if (req.url.includes('/api/users/me')) {
                            this.authService.logoutUserAndRedirect();
                        } else {
                            // Pour les autres routes, simplement retourner l'erreur
                            return throwError(() => error);
                        }
                    }
                    return throwError(() => error);
                })
            );
        }

        // Si pas de token et route protégée, rediriger vers login
        if (!this.isPublicRoute(req.url)) {
            this.router.navigate(['/login']);
            return throwError(() => new Error('No token available'));
        }

        return next.handle(req);
    }

    private isPublicRoute(url: string): boolean {
        return this.PUBLIC_ROUTES.some(route => url.includes(route));
    }
}