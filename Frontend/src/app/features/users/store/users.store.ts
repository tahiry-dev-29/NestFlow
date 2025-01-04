import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, Observable, of, pipe, switchMap, tap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { UsersService } from '../services/users.service';
import { ToastrService } from 'ngx-toastr';

export interface IUsers {
  id: string;
  name: string;
  firstName: string;
  mail: string;
  password: string;
  imageUrl?: string;
  online: boolean;
  active: boolean;
  role: UserEntity.ROLE;
}

export namespace UserEntity {
  export enum ROLE {
    ADMIN,
    USER,
  }
}

export interface UserState {
  users: IUsers[];
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  currentUser: IUsers | null | undefined;
}

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
  withComputed(({ users }) => ({
    activeUsers: computed(() => users().filter((user) => user.online)),
    inactiveUsers: computed(() => users().filter((user) => !user.online)),
    totalUsers: computed(() => users().length),
    userStatusClass: computed(() => (status: boolean) => (status ? 'online' : 'offline')),
    selectLoading: computed(() => loading()),
    selectError: computed(() => error()),
  })),
  withMethods((store, userService = inject(UsersService), authService = inject(AuthService), router = inject(Router), toastr = inject(ToastrService)) => ({
    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },
    loadUsers: rxMethod<Observable<void>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          return userService.getAll().pipe(
            tap((users) => patchState(store, { users, loading: false })),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(undefined);
            })
          );
        })
      )
    ),

    addUser: rxMethod<Omit<IUsers, 'id'>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((user) =>
          userService.addUser(user).pipe(
            tap((newUser: IUsers | null) => {
              if (newUser) {
                patchState(store, { users: [...store.users(), newUser], loading: false });
              } else {
                patchState(store, { error: 'Failed to add user',
                  loading: false });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(null);
            })
          )
        )
      )
    ),
    updateUser: rxMethod<{ userId: string; updates: Partial<IUsers> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ userId, updates }) =>
          userService.updateUser(userId, updates).pipe(
            tap((updatedUser) => {
              if (updatedUser) {
                patchState(store, {
                  users: store.users().map((user) => (user.id === userId ? updatedUser : user)),
                  loading: false,
                });
              } else {
                patchState(store, { error: 'Failed to update user', loading: false });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(null);
            })
          )
        )
      )
    ),
    deleteUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          userService.deleteUser(userId).pipe(
            tap((success) => {
              if (success) {
                patchState(store, { users: store.users().filter((user) => user.id !== userId), loading: false });
              } else {
                patchState(store, { error: 'Failed to delete user', loading: false });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(false);
            })
          )
        )
      )
    ),

    signup: rxMethod<Omit<IUsers, 'id' | 'online' | 'active' | 'role'>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((user) =>
          authService.signUp(user).pipe(
            tap(() => {
              patchState(store, { loading: false });
              router.navigate(['/login']);
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              return of(null);
            })
          )
        )
      )
    ),

    login: rxMethod<{ mail: string; password: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((credentials) =>
          authService.login(credentials).pipe(
            switchMap((token) => { // Use switchMap to chain the getUserByToken call
              if (token) {
                return authService.getUserByToken(token).pipe(
                  tap((user) => {
                    patchState(store, { isAuthenticated: true, loading: false, token, currentUser: user });
                    router.navigate(['/dashboard/overview']);
                    toastr.success('Connexion réussie ! Bienvenue 👋');
                  }),
                  catchError((error) => {
                    patchState(store, { error: error.message, loading: false, isAuthenticated: false, currentUser: null });
                    return of(null); // Important: Return of(null) to complete the outer observable
                  })
                );
              } else {
                patchState(store, { error: 'Invalid credentials', loading: false, isAuthenticated: false, currentUser: null });
                return of(null); // Important: Return of(null) to complete the outer observable
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false, isAuthenticated: false, currentUser: null });
              return of(null);
            })
          )
        )
      )
    ),

    logout: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const userId = store.currentUser()?.id;
          if (userId) {
            return authService.logout(userId).pipe(
              tap(() => {
                patchState(store, { isAuthenticated: false, loading: false, token: null, currentUser: null });
                router.navigate(['/login']);
              }),
              catchError((error) => {
                patchState(store, { error: error.message, loading: false });
                return of(null);
              })
            );
          } else {
            patchState(store, { error: 'Utilisateur non trouvé', loading: false });
            return of(null);
          }
        }),
        catchError((error) => {
          patchState(store, { error: error.message, loading: false });
          return of(null);
        })
      )
    ),

    checkAuthStatus: () => {
      const token = authService.getToken();
      if (token) {
        patchState(store, { isAuthenticated: true, token: token });
      }
    },
  }))
);

function loading(): boolean {
  const store = inject(UserStore);
  return store.selectLoading();
}

function error(): boolean {
  const store = inject(UserStore);
  return store.selectError();
}