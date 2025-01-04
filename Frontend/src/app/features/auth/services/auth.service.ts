import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; // Import de ngx-cookie-service
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { IUsers } from '../../users/store/users.store'; // Supposons que vous ayez un modèle User

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = "Unable to contact the server. Please check your internet connection.";
      } else if (error.status === 400) {
        errorMessage = error.error?.message || "Invalid request.";
      } else if (error.status === 401) {
        errorMessage = error.error?.message || "Unauthorized. Please check your credentials.";
      } else if (error.status === 404) {
        errorMessage = error.error?.message || "Resource not found.";
      } else if (error.status === 500) {
        errorMessage = "Internal server error.";
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

  signUp(user: Omit<IUsers, 'id' | 'online' | 'active' | 'role'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user).pipe(
      map(() => {
        return null;
      }),
      catchError(this.handleError)
    );
  }

  logout(userId: string): Observable<Object> {
    return this.http.post(`${this.apiUrl}/logout/${userId}`, {}).pipe(
      tap(() => {
        this.deleteToken();
      }),
      catchError(this.handleError)
    );
  }

  getUserByToken(token: string): Observable<IUsers | null> {
    return this.http.get<IUsers>(`${this.apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .pipe(
        catchError(this.handleError)
      );
  }

  getToken(): string | null {
    return this.cookieService.get('authToken') || null;
  }

  setToken(token: string): void {
    this.cookieService.set('authToken', token, 1, '/', 'localhost', true, 'Strict');
  }

  deleteToken(): void {
    this.cookieService.delete('authToken');
  }
}
