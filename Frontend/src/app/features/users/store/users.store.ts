import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, pipe, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers, UserState } from '../models/users/users.module';
import { UsersService } from '../services/users.service';

const getInitialState = (): UserState => ({
  users: [],
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  currentUser: null,
});

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ users, loading, error }) => ({
    activeUsers: computed(() => users().filter((user) => user.online)),
    inactiveUsers: computed(() => users().filter((user) => !user.online)),
    totalUsers: computed(() => users().length),
    userStatusClass: computed(() => (online: boolean) => (online ? 'online' : 'offline')),
    selectLoading: computed(() => loading()),
    selectError: computed(() => error()),
  })),
  withMethods((store, http = inject(HttpClient), authService = inject(AuthService), usersService = inject(UsersService))=> ({
    loadUsers: rxMethod<IUsers[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const token = authService.getToken();
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          return http.get<IUsers[]>(`${environment.apiUrl}/users/lists`, { headers }).pipe(
            tap((users) => patchState(store, { users, loading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return throwError(() => new Error('Failed to load users.'));
            })
          );
        })
      )
    ),

    deleteUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) => {
          const token = authService.getToken();
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          return http.delete(`${environment.apiUrl}/users/delete/${userId}`, { headers, responseType: 'text' }).pipe(
            tap(() => {
              patchState(store, {
                users: store.users().filter((user) => user.id !== userId),
                loading: false,
              });
            }),
            catchError((error) => {
              console.error('Error while deleting user:', error);
              patchState(store, { error: error.message, loading: false });
              return throwError(() => new Error('Failed to delete user.'));
            })
          );
        })
      )
    ),
    
    updateUser(userId: string, updates: FormData | Partial<IUsers>): Observable<IUsers> {
      patchState(store, { loading: true, error: null });
      
      const formData = updates instanceof FormData ? updates : this.convertToFormData(updates);
      
      return usersService.updateUser(userId, formData).pipe(
        tap((updatedUser) => {
          const updatedUsers = store.users().map((user) => 
            user.id === userId ? updatedUser : user
          );
          patchState(store, { users: updatedUsers, loading: false });
        }),
        catchError((error) => {
          patchState(store, { error: error.message, loading: false });
          return throwError(() => error);
        })
      );
    },

    convertToFormData(data: Partial<IUsers>): FormData {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      return formData;
    },

    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },

    
  }))
);
