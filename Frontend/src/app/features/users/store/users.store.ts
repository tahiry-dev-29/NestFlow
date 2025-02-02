import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  concatMap,
  Observable,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { IUsers, UserState } from '../models/users/users.module';
import { UsersService } from '../services/users.service';

const getInitialState = (): UserState => ({
  users: [],
  loading: false,
  error: null,
  currentUser: null,
  token: null,
});

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ users, loading, error, token }) => ({
    activeUsers: computed(() => users().filter((user) => user.online)),
    inactiveUsers: computed(() => users().filter((user) => !user.online)),
    totalUsers: computed(() => users().length),
    userStatusClass: computed(
      () => (online: boolean) => online ? 'online' : 'offline'
    ),
    selectLoading: computed(() => loading()),
    selectError: computed(() => error()),
    selectToken: computed(() => token()),
  })),
  withMethods((store, usersService = inject(UsersService)) => ({
    // Get user by id
    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },

    // Load users
    loadUsers: rxMethod<IUsers[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(() =>
          usersService.getUsers().pipe(
            tap({
              next: (subscriptions) =>
                patchState(store, { users: subscriptions, loading: false }),
              error: (error) =>
                patchState(store, { error: error.message, loading: false }),
            })
          )
        ),
        tap(() => patchState(store, { loading: false }))
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
              patchState(store, { error: error.message, loading: false });
              return of(error);
            })
          );
        })
      )
    ),

    updateUser(userId: string, updates: Partial<IUsers>): Observable<IUsers> {
      patchState(store, { loading: true, error: null });

      return usersService.updateUser(userId, updates).pipe(
        switchMap(() => {
          return usersService.updateUser(userId, updates).pipe(
            tap((updatedUser) => {
              patchState(store, {
                users: store
                  .users()
                  .map((user) => (user.id === userId ? updatedUser : user)),
                loading: false,
              });
            })
          );
        }),
        catchError((error) => {
          patchState(store, { error: error.message, loading: false });
          return of(error);
        })
      );
    },
  }))
);
