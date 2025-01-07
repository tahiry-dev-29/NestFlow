import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers } from '../models/users/users.module';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = environment.apiUrl + '/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Injection de AuthService
  ) { }

  getAll(): Observable<IUsers[]> {
    const token = this.authService.getToken();  // Récupérer le jeton
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<IUsers[]>(`${this.baseUrl}/lists`, { headers }).pipe(
      catchError((error) => {
        console.error('Error while fetching users:', error);
        return throwError(() => new Error('Failed to load users.'));
      })
    );
  }

  updateUser(userId: string, updates: Partial<IUsers>) {
    const token = this.authService.getToken();  // Récupérer le jeton
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch<IUsers>(`${this.baseUrl}/update/${userId}`, updates, { headers }).pipe(
      catchError((error) => {
        console.error('Error while updating user:', error);
        return throwError(() => new Error('Failed to update user.'));
      })
    );
  }

  deleteUser(userId: string) {
    const token = this.authService.getToken();  // Récupérer le jeton
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}/delete/${userId}`, { headers, responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Error while deleting user:', error);
        return throwError(() => new Error('Failed to delete user.'));
      })
    );
  }

}
