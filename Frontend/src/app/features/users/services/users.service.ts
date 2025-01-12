import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUsers } from '../models/users/users.module';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  getUsers(): Observable<IUsers[]> {
    return this.http.get<IUsers[]>(this.apiUrl);
  }

  getUser(id: string): Observable<IUsers> {
    return this.http.get<IUsers>(`${this.apiUrl}/${id}`);
  }

  createUser(user: FormData): Observable<IUsers> {
    return this.http.post<IUsers>(this.apiUrl, user);
  }

  updateUser(id: string, user: FormData): Observable<IUsers> {
    return this.http.put<IUsers>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 
