import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieOptions, CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ERROR_MESSAGES, SERVER_ERROR_MESSAGES } from '../../../../constantes';
import { environment } from '../../../../environments/environment';
import { IUsers, ROLE } from '../../users/models/users/users.module';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'Authorization';
  private readonly COOKIE_OPTIONS: CookieOptions = {
    path: '/',
    secure: environment.production,
    sameSite: 'Strict' as const,
    domain: environment.cookieDomain || 'localhost'
  };

  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);

  // Méthodes d'authentification
  login(credentials: { mail: string; password: string }): Observable<string | null> {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, credentials).pipe(
      map(response => response?.token || null),
      tap(token => {
        if (token) {
          this.setToken(token);
          this.getUserByToken(token).subscribe();
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(userId?: string): Observable<any> {
    const logoutUrl = userId ? `${this.API_URL}/logout/${userId}` : `${this.API_URL}/logout`;
    return this.http.post<{ message: string }>(logoutUrl, null).pipe(
      tap(() => this.clearUserSession()),
      catchError(this.handleError.bind(this))
    );
  }

  // Gestion du token
  setToken(token: string): void {
    if (!token) return;
    try {
      this.cookieService.set(this.TOKEN_KEY, token, {
        ...this.COOKIE_OPTIONS,
        expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  }

  getToken(): string | null {
    try {
      return this.cookieService.get(this.TOKEN_KEY) || null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  deleteToken(): void {
    try {
      this.cookieService.delete(this.TOKEN_KEY, '/', this.COOKIE_OPTIONS.domain);
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  // Gestion de l'utilisateur
  getCurrentUser(): Observable<IUsers | null> {
    return this.http.get<IUsers>(`${this.API_URL}/me`).pipe(
      catchError(error => {
        return of(null);
      })
    );
  }

  getUserByToken(token: string): Observable<IUsers | null> {
    if (!token) return of(null);
    this.setToken(token)
    return this.getCurrentUser();
  }


  // Gestion des erreurs
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      errorMessage = ERROR_MESSAGES.LOGIN_ERROR;
    } else {
      const statusMessages: { [key: number]: string } = {
        0: SERVER_ERROR_MESSAGES[500],
        400: error.error?.message || SERVER_ERROR_MESSAGES[400],
        401: ERROR_MESSAGES.PASSWORD_OR_EMAIL_INCORRECT,
        403: SERVER_ERROR_MESSAGES[403],
        404: SERVER_ERROR_MESSAGES[404],
        500: SERVER_ERROR_MESSAGES[500]
      };
      errorMessage = statusMessages[error.status] || ERROR_MESSAGES.LOGIN_ERROR;

      if (error.status === 401) {
        this.logoutUserAndRedirect();
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  private clearUserSession(): void {
    this.deleteToken();
  }

  logoutUserAndRedirect(): void {
    this.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    });
  }

  signup(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/create`, formData).pipe(
      catchError(this.handleError.bind(this))
    );
  }

}