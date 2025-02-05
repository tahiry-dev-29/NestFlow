import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieOptions, CookieService } from 'ngx-cookie-service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ERROR_MESSAGES, SERVER_ERROR_MESSAGES } from '../../../../constantes';
import { environment } from '../../../../environments/environment';
import { IUsers, ROLE } from '../../users/models/users/users.module';
import { Cacheable } from 'ts-cacheable';

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
    domain: environment.cookieDomain || 'localhost',
  };

  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);

  // Auth methods
  @Cacheable()
  login(credentials: {
    mail: string;
    password: string;
  }): Observable<string | null> {
    return this.http
      .post<{ token: string }>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(({ token }) => token || null),
        tap((token) => token && this.setTokenAndLoadUser(token)),
        catchError(this.handleError.bind(this))
      );
  }

  @Cacheable()
  logout(userId?: string): Observable<any> {
    const logoutUrl = userId
      ? `${this.API_URL}/logout/${userId}`
      : `${this.API_URL}/logout`;
    return this.http.post<{ message: string }>(logoutUrl, null).pipe(
      tap(() => this.clearUserSession()),
      catchError(this.handleError.bind(this))
    );
  }

  @Cacheable()
  signup(formData: FormData): Observable<any> {
    return this.http
      .post(`${this.API_URL}/create`, formData)
      .pipe(catchError(this.handleError.bind(this)));
  }

  // Token management
  private setTokenAndLoadUser(token: string): void {
    this.setToken(token);
    this.getUserByToken(token).subscribe();
  }

  private setToken(token: string): void {
    if (!token) return;
    try {
      this.cookieService.set(this.TOKEN_KEY, token, {
        ...this.COOKIE_OPTIONS,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error('Token setting failed:', error);
    }
  }

  getToken(): string | null {
    try {
      return this.cookieService.get(this.TOKEN_KEY) || null;
    } catch (error) {
      return null;
    }
  }

  private clearUserSession(): void {
    try {
      this.cookieService.delete(
        this.TOKEN_KEY,
        '/',
        this.COOKIE_OPTIONS.domain
      );
    } catch (error) {}
  }

  // User management
  @Cacheable()
  getCurrentUser(): Observable<IUsers | null> {
    return this.http
      .get<IUsers>(`${this.API_URL}/me`)
      .pipe(catchError(() => of(null)));
  }

  getUserByToken(token: string): Observable<IUsers | null> {
    if (!token) return of(null);
    this.setToken(token);
    return this.getCurrentUser();
  }

  getCurrentUserRole(): Observable<ROLE | undefined> {
    return this.getCurrentUser().pipe(
      map((user) => user?.role),
      catchError(() => of(undefined))
    );
  }

  // Utility methods
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  logoutUserAndRedirect(): void {
    this.logout().subscribe(() => this.router.navigate(['/login']));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    if (error.status === 401) {
      this.logoutUserAndRedirect();
    }
    return throwError(() => new Error(errorMessage));
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return ERROR_MESSAGES.LOGIN_ERROR;
    }

    const statusMessages: Record<number, string> = {
      0: SERVER_ERROR_MESSAGES[500],
      400: error.error?.message || SERVER_ERROR_MESSAGES[400],
      401: ERROR_MESSAGES.PASSWORD_OR_EMAIL_INCORRECT,
      403: SERVER_ERROR_MESSAGES[403],
      404: SERVER_ERROR_MESSAGES[404],
      500: SERVER_ERROR_MESSAGES[500],
    };

    return statusMessages[error.status] || ERROR_MESSAGES.LOGIN_ERROR;
  }
}
