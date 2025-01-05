import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service'; // Import de ngx-cookie-service
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router'; // Pour la redirection
import { IUsers } from '../../users/models/users/users.module';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router // Ajout du Router pour la redirection
  ) { }

  // Gestion des erreurs HTTP
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

  // Connexion
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

  // Inscription
  signUp(user: Omit<IUsers, 'id' | 'online' | 'active' | 'role'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user).pipe(
      map(() => {
        return null;
      }),
      catchError(this.handleError)
    );
  }

  // Déconnexion
  logout(userId: string): Observable<{ message: string }> {
    const token = this.getToken();
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout/${userId}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    }).pipe(
      catchError((error) => this.handleError(error)) // Gestion améliorée des erreurs
    );
  }

  // Obtenir l'utilisateur actuel
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

  // Déconnexion de l'utilisateur
  logoutUser(): Observable<Object> {
    return this.getCurrentUser().pipe(
      switchMap((user) => {
        if (user?.id) {
          return this.logout(user.id).pipe(
            tap(() => {
              this.deleteToken();
            }),
          );
        } else {
          return throwError(() => new Error('Impossible de déconnecter l’utilisateur (ID manquant).'));
        }
      }),
      catchError(this.handleError)
    );
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Obtenir l'utilisateur par le token
  getUserByToken(token: string): Observable<IUsers | null> {
    return this.http.get<IUsers>(`${this.apiUrl}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            // Si une erreur 401 est renvoyée, cela signifie que le token est invalide ou expiré
            this.logoutUserAndRedirect();
          }
          return this.handleError(error);
        })
      );
  }

  // Récupérer le token depuis le cookie
  getToken(): string | null {
    const token = this.cookieService.get('authToken');

    // Si un token existe
    if (token) {
      // Vérifier la validité du token en appelant /me
      this.getUserByToken(token).subscribe({
        next: (user) => {
          if (!user) {
            this.logoutUserAndRedirect(); // Si aucun utilisateur n'est associé au token, se déconnecter
          } else {
            // Le token est valide, l'utilisateur est trouvé, rien à faire
          }
        },
        error: (err) => {
          // Si une erreur se produit (ex : token invalide ou expiré), déconnecter et rediriger
          this.logoutUserAndRedirect();
        }
      });
      return token; // Retourner le token si tout va bien
    } else {
      // Si aucun token n'est trouvé, vérifier sa validité et rediriger si nécessaire
      this.checkAndRedirectIfInvalidToken();
      return null; // Retourner null car le token est manquant
    }
  }




  // Enregistrer le token dans le cookie
  setToken(token: string): void {
    this.cookieService.set('authToken', token, 1, '/', 'localhost', true, 'Strict');
  }

  // Supprimer le token du cookie
  deleteToken(): void {
    this.cookieService.delete('authToken');
  }

  // Supprimer le token et rediriger vers la page de login
  logoutUserAndRedirect(): void {
    this.deleteToken(); // Supprimer le token
    this.router.navigate(['/login']); // Rediriger vers la page de login
  }

  // Vérifier la validité du token et rediriger si nécessaire
  checkAndRedirectIfInvalidToken(): void {
    const token = this.getToken();
    if (token) {
      this.getUserByToken(token).subscribe({
        next: (user) => {
          if (!user) {
            this.logoutUserAndRedirect(); // Si l'utilisateur n'est pas trouvé, se déconnecter
          }
        },
        error: () => {
          this.logoutUserAndRedirect(); // Si une erreur se produit (par exemple 401), se déconnecter
        },
      });
    } else {
      this.logoutUserAndRedirect(); // Si aucun token n'est trouvé, se déconnecter
    }
  }
}