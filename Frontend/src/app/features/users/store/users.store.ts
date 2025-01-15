import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, Observable, pipe, switchMap, tap, throwError } from 'rxjs';
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
  withMethods((store, usersService = inject(UsersService))=> ({
    // Load users
    loadUsers: rxMethod<IUsers[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          return usersService.getUsers().pipe(
            tap((users) => patchState(store, { users, loading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return throwError(() => new Error('Failed to load users.'));
            })
          );
        })
      )
    ),

    // Delete user
    deleteUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) => {
          return usersService.deleteUser(userId).pipe(
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
    
    updateUser(userId: string, updates: Partial<IUsers>): Observable<IUsers> {
      patchState(store, { loading: true, error: null });
      
      return usersService.updateUser(userId, updates).pipe(
        switchMap(() => {
          // use service to update user
          return usersService.updateUser(userId, updates).pipe(
            tap((updatedUser) => {
              patchState(store, { users: store.users().map((user) => user.id === userId ? updatedUser : user), loading: false });
            })
          );
        }),
        catchError((error) => {
          patchState(store, { error: error.message, loading: false });
          return throwError(() => error);
        })
      );
    },


    // Get user by id
    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },
    
  }))
);
