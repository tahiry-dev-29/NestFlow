import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers } from '../models/users/users.module';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  // Get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }

  // Get users
  getUsers(): Observable<IUsers[]> {
    return this.http.get<IUsers[]>(`${this.apiUrl}/lists`, { 
      headers: this.getAuthHeaders(),
      withCredentials: true 
    });
  }

  // Get user by id
  getUser(id: string): Observable<IUsers> {
    return this.http.get<IUsers>(`${this.apiUrl}/${id}`, { 
      headers: this.getAuthHeaders(),
      withCredentials: true 
    });
  }

  // Update user
  updateUser(id: string, user: Partial<IUsers>): Observable<IUsers> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
      
    return this.http.patch<IUsers>(`${this.apiUrl}/update/${id}`, user, {
      headers,
      withCredentials: true
    });
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { 
      headers: this.getAuthHeaders(),
      withCredentials: true 
    });
  }
} 
