import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService, CookieOptions } from 'ngx-cookie-service';
import { Observable, throwError, of, take, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUsers } from '../../users/models/users/users.module';
import { environment } from '../../../../environments/environment';
import { ERROR_MESSAGES, SERVER_ERROR_MESSAGES } from '../../../../constantes';

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


  // User Management Methods
  createUser(userData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, userData, {
      headers: new HttpHeaders(),
      withCredentials: true
    }).pipe(
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  // Get current user
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

  // Get token
  getToken(): string | null {
    try {
      return this.cookieService.get(this.TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  // Set token
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

  // Authentication Status
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return this.checkDocumentCookies();
    }
    return true;
  }

  // Check document cookies
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

  // Load user and navigate
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

  // Clear user session
  private clearUserSession(): void {
    this.deleteToken();
    this.currentUserSubject.next(null);
  }

  // Logout user
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

  // Logout user and redirect
  logoutUserAndRedirect(): void {
    this.clearUserSession();
    this.router.navigate(['/login']);
  }

  // Handle error
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      return throwError(() => new Error(ERROR_MESSAGES.LOGIN_ERROR));
    }

    const statusMessages: { [key: number]: string } = {
      0: SERVER_ERROR_MESSAGES[500],
      400: error.error?.message || SERVER_ERROR_MESSAGES[400],
      401: ERROR_MESSAGES.PASSWORD_OR_EMAIL_INCORRECT,
      403: SERVER_ERROR_MESSAGES[403],
      404: SERVER_ERROR_MESSAGES[404],
      500: SERVER_ERROR_MESSAGES[500]
    };

    if (error.status === 401) {
      this.logoutUserAndRedirect();
    }

    return throwError(() => new Error(statusMessages[error.status] || ERROR_MESSAGES.LOGIN_ERROR));
  }

  // Get user by token
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

  // Signup
  signup(formData: FormData): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }

    return this.http.post<any>(`${this.API_URL}/create`, formData, {
      headers: new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json'),
      withCredentials: true
    }).pipe(
      catchError(this.handleError.bind(this))
    );
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

  // Delete token
  deleteToken(): void {
    try {
      this.cookieService.delete(this.TOKEN_KEY, '/', 'localhost');
    } catch {
      console.warn('Failed to delete token');
    }
  }

  // Logout
  logout(userId: string): Observable<any> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/logout/${userId}`,
      null,
      this.getAuthHeaders()
    ).pipe(
      catchError(this.handleError)
    );
  }
}
