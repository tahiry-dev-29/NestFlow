import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, pipe, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers, UserState } from '../models/users/users.module';

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
    userStatusClass: computed(() => (status: boolean) => (status ? 'online' : 'offline')),
    selectLoading: computed(() => loading()),
    selectError: computed(() => error()),
  })),
  withMethods((store, http = inject(HttpClient), authService = inject(AuthService)) => ({
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
    
    updateUser(userId: string, updates: Partial<IUsers>): void {
      const updatedUsers = store.users().map((user) => {
        if (user.id === userId) {
          return { ...user, ...updates };
        }
        return user;
      });
      patchState(store, { users: updatedUsers });
    },

    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },
  }))
);
