import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUsers } from '../models/users/users.module';
import { Cacheable } from 'ts-cacheable';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);

  // Get users
  getUsers(): Observable<IUsers[]> {
    return this.http.get<IUsers[]>(`${this.apiUrl}/lists`);
  }

  // Get user by id
  @Cacheable()
  getUser(id: string): Observable<IUsers> {
    return this.http.get<IUsers>(`${this.apiUrl}/${id}`);
  }

  // Update user
  @Cacheable()
  updateUser(id: string, user: Partial<IUsers>): Observable<IUsers> {
    return this.http.patch<IUsers>(`${this.apiUrl}/update/${id}`, user);
  }

  // Delete user
  @Cacheable()
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
