/* import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers } from '../models/users/users.module';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAll(): Observable<IUsers[]> {
    return this.http.get<IUsers[]>(`${this.baseUrl}/lists`, { headers: this.getHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to load users', error))
    );
  }

  updateUser(userId: string, updates: Partial<IUsers>): Observable<IUsers> {
    return this.http.patch<IUsers>(`${this.baseUrl}/update/${userId}`, updates, { headers: this.getHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to update user', error))
    );
  }

  deleteUser(userId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${userId}`, { headers: this.getHeaders(), responseType: 'text' }).pipe(
      catchError((error) => this.handleError('Failed to delete user', error))
    );
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    return throwError(() => new Error(message));
  }
}
 */