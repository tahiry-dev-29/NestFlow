import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IUsers, TSignUp } from '../../users/models/users/users.module';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/users';

  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Unable to contact the server. Please check your internet connection.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request.';
      } else if (error.status === 401) {
        errorMessage = error.error?.message || 'Unauthorized. Please check your credentials.';
      } else if (error.status === 404) {
        errorMessage = error.error?.message || 'Resource not found.';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error.';
      } else {
        errorMessage = `Error code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  login(credentials: { mail: string; password: string }): Observable<string | null> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        if (response && response.token) {
          this.setToken(response.token);
          return response.token;
        }
        return null;
      }),
      catchError(this.handleError)
    );
  }

  signUp(user: TSignUp): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user).pipe(
      map(() => null),
      catchError(this.handleError)
    );
  }

  logout(userId: string): Observable<{ message: string }> {
    const token = this.getToken();
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout/${userId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }).pipe(
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<IUsers | null> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Token manquant ou expiré.'));
    }
    return this.http.get<IUsers>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      catchError(this.handleError)
    );
  }

  logoutUser(): Observable<Object> {
    return this.getCurrentUser().pipe(
      switchMap(user => {
        if (user?.id) {
          return this.logout(user.id).pipe(
            tap(() => {
              this.deleteToken();
            })
          );
        } else {
          return throwError(() => new Error('Impossible de déconnecter l’utilisateur (ID manquant).'));
        }
      }),
      catchError(this.handleError)
    );
  }

  validateToken(token: string): Observable<IUsers> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<IUsers>(`${environment.apiUrl}/auth/validate`, { headers });
  }
  

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getUserByToken(token: string): Observable<IUsers | null> {
    return this.http.get<IUsers>(`${this.apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .pipe(
        catchError(error => {
          if (error.status === 401) {
            this.logoutUserAndRedirect();
          }
          return this.handleError(error);
        })
      );
  }

  getToken(): string | null {
    const token = this.cookieService.get('Authorization');
    return token ? token : null;
  }

  setToken(token: string): void {
    this.cookieService.set('Authorization', token, 1, '/', 'localhost', true, 'Strict');
  }

  deleteToken(): void {
    this.cookieService.delete('Authorization');
  }

  logoutUserAndRedirect(): void {
    this.deleteToken();
    this.router.navigate(['/login']);
  }

  checkAndRedirectIfInvalidToken(): void {
    const token = this.getToken();
    if (token) {
      this.getUserByToken(token).subscribe({
        next: user => {
          if (!user) {
            this.logoutUserAndRedirect();
          }
        },
        error: () => {
          this.logoutUserAndRedirect();
        },
      });
    }
  }
}
