import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cacheable } from 'ts-cacheable';
import { environment } from '../../../../environments/environment';
import { IUsers, UserUpdateDetails } from '../models/users/users.module';

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

  // Update user details
  @Cacheable()
  editUserDetails(id: string, user: UserUpdateDetails): Observable<IUsers> {
    return this.http.patch<IUsers>(`${this.apiUrl}/update/${id}`, user);
  }
  // Update pic user
  @Cacheable()
  editUserImages(id: string, imageFile: File): Observable<IUsers> {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    return this.http.patch<IUsers>(
      `${this.apiUrl}/update/${id}/images`,
      formData
    );
  }

  // Delete user
  @Cacheable()
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
