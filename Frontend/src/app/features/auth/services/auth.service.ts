import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.example.com';
  private tokenKey = 'auth_token';

  // private router = inject(Router);
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);

  signUp(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      map((response: any) => {
        if (response.token) {
          this.setToken(response.token);
        }
        return response;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.cookieService.delete(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.cookieService.check(this.tokenKey);
  }

  getToken(): string | null {
    return this.cookieService.get(this.tokenKey);
  }

  private setToken(token: string): void {
    this.cookieService.set(this.tokenKey, token, {
      expires: 1, // 1 day
      secure: true,
      sameSite: 'Strict',
      path: '/'
    });
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}