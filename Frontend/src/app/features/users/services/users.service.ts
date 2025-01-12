import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUsers } from '../models/users/users.module';
import { AuthService } from '../../auth/services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json');
  }

  getUsers(): Observable<IUsers[]> {
    return this.http.get<IUsers[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUser(id: string): Observable<IUsers> {
    return this.http.get<IUsers>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createUser(user: FormData): Observable<IUsers> {
    return this.authService.createUser(user).pipe(
      map(response => response.user)
    );
  }

  updateUser(id: string, user: FormData): Observable<IUsers> {
    return this.http.put<IUsers>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
} 
