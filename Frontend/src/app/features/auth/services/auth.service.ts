import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService, CookieOptions } from 'ngx-cookie-service';
import { Observable, throwError, of, take, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUsers } from '../../users/models/users/users.module';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Constants
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'Authorization';
  private readonly COOKIE_OPTIONS: CookieOptions = {
    path: '/',
    secure: true,
    sameSite: 'Strict' as const,
    domain: 'localhost'
  };

  // State
  private currentUserSubject = new BehaviorSubject<IUsers | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Dependencies
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);

  constructor() {
    this.initializeCurrentUser();
  }

  // Authentication Methods
  login(credentials: { mail: string; password: string }): Observable<string | null> {
    return this.http.post<{ token: string }>(`${this.API_URL}/login`, credentials).pipe(
      map(response => response.token || null),
      tap(token => {
        if (token) {
          this.setToken(token);
          this.loadUserAndNavigate();
        }
      }),
      catchError(this.handleError)
    );
  }

  logoutUser(): Observable<Object> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser?.id) {
      return throwError(() => new Error('No active user session found.'));
    }

    return this.http.post<{ message: string }>(
      `${this.API_URL}/logout/${currentUser.id}`, 
      null, 
      this.getAuthHeaders()
    ).pipe(
      tap(() => this.clearUserSession()),
      finalize(() => this.router.navigate(['/login'])),
      catchError(this.handleError)
    );
  }

  logout(userId: string): Observable<any> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/logout/${userId}`, 
      null, 
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }

  // User Management Methods
  createUser(userData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, userData, {
      headers: new HttpHeaders(),
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Create user error:', error);
        return this.handleError(error);
      })
    );
  }

  getCurrentUser(): Observable<IUsers | null> {
    const token = this.getToken();
    if (!token) return of(null);

    return this.http.get<IUsers>(
      `${this.API_URL}/me`, 
      this.getAuthHeaders()
    ).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        this.currentUserSubject.next(null);
        return this.handleError(error);
      })
    );
  }

  // Token Management
  private getAuthHeaders() {
    const token = this.getToken();
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      withCredentials: true
    };
  }

  getToken(): string | null {
    try {
      return this.cookieService.get(this.TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    if (!token) return;
    
    try {
      this.cookieService.delete(this.TOKEN_KEY, '/');
      this.cookieService.set(
        this.TOKEN_KEY, 
        token, 
        {
          ...this.COOKIE_OPTIONS,
          expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        }
      );
    } catch {
      console.warn('Failed to set token');
    }
  }

  deleteToken(): void {
    try {
      this.cookieService.delete(this.TOKEN_KEY, '/', 'localhost');
    } catch {
      console.warn('Failed to delete token');
    }
  }

  // Authentication Status
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return this.checkDocumentCookies();
    }
    return true;
  }

  private checkDocumentCookies(): boolean {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith(`${this.TOKEN_KEY}=`));
    if (authCookie) {
      const tokenFromCookie = authCookie.split('=')[1];
      this.setToken(tokenFromCookie);
      return true;
    }
    return false;
  }

  // Utility Methods
  private initializeCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().pipe(take(1)).subscribe({
        next: user => user && this.currentUserSubject.next(user),
        error: () => this.logoutUserAndRedirect()
      });
    }
  }

  private loadUserAndNavigate(): void {
    this.getCurrentUser().pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.currentUserSubject.next(user);
          this.router.navigate(['/dashboard']);
        } else {
          this.logoutUserAndRedirect();
        }
      }
    });
  }

  private clearUserSession(): void {
    this.deleteToken();
    this.currentUserSubject.next(null);
  }

  logoutUserAndRedirect(): void {
    this.clearUserSession();
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    return throwError(() => new Error(errorMessage));
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Client-side error: ${error.error.message}`;
    }

    const statusMessages: { [key: number]: string } = {
      0: 'Server is unreachable. Please check your internet connection.',
      400: error.error?.message || 'Bad request - please check your input.',
      401: error.error?.message || 'Authentication failed - please login again.',
      403: error.error?.message || 'Access forbidden - insufficient permissions.',
      404: error.error?.message || 'Resource not found.',
      500: 'Internal server error - please try again later.'
    };

    if (error.status === 401) {
      this.logoutUserAndRedirect();
    }

    return statusMessages[error.status] || 
           `Server error ${error.status}: ${error.error?.message || error.message}`;
  }

  getUserByToken(token: string): Observable<IUsers | null> {
    if (!token) return of(null);

    return this.http.get<IUsers>(
      `${this.API_URL}/me`,
      {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
        withCredentials: true
      }
    ).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(error => {
        if (error.status === 401) {
          this.logoutUserAndRedirect();
        }
        return of(null);
      })
    );
  }
}
