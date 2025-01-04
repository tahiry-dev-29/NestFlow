import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { IUsers } from '../store/users.store';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseUrl = "http://localhost:8080/api";

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<IUsers[]>(`${this.baseUrl}/users/lists`).pipe(
      catchError((error) => {
        console.error('Error while fetching users:', error);
        return of([]); // Retourne un tableau vide en cas d'erreur
      })
    );
  }

  

  addUser(user: Omit<IUsers, 'id'>) {
    return this.http.post<IUsers>(`${this.baseUrl}/users/create`, user).pipe(
      catchError((error) => {
        console.error('Error while adding user:', error);
        return of(null); // Retourne null en cas d'erreur
      })
    );
  }

  updateUser(userId: string, updates: Partial<IUsers>) {
    return this.http.patch<IUsers>(`${this.baseUrl}/users/update/${userId}`, updates).pipe(
      catchError((error) => {
        console.error('Error while updating user:', error);
        return of(null); // Retourne null en cas d'erreur
      })
    );
  }

  deleteUser(userId: string) {
    return this.http.delete<boolean>(`${this.baseUrl}/users/delete/${userId}`).pipe(
      catchError((error) => {
        console.error('Error while deleting user:', error);
        return of(false); // Retourne false en cas d'erreur
      })
    );
  }
}
