import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { UsersService } from '../services/users.service';
import { ToastrService } from 'ngx-toastr';
import { UserState, IUsers, IUserUpdateResponse, IUserUpdateRequest, TSignUp } from '../models/users/users.module';
import { IAuthCredentials } from '../../auth/models/auth/auth.module';

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
  withMethods((store, userService = inject(UsersService), authService = inject(AuthService), router = inject(Router), toastr = inject(ToastrService)) => ({
    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },
    loadUsers: rxMethod<IUsers[]>(
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
    updateUser: rxMethod<IUserUpdateRequest>(pipe(
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
    )),

    deleteUser: rxMethod<string>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap((userId) =>
        userService.deleteUser(userId).pipe(
          tap((response) => {
            // Ici, on suppose que `response` est le message de succès renvoyé par le backend
            if (response === "User deleted successfully.") {
              patchState(store, { users: store.users().filter((user) => user.id !== userId), loading: false });
            } else {
              patchState(store, { error: 'Failed to delete user', loading: false });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.message, loading: false });
            return of("Failed");
          })
        )
      )
    )),
    signup: rxMethod<TSignUp>(
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
    login: rxMethod<IAuthCredentials>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((credentials) =>
          authService.login(credentials).pipe(
            switchMap((token) => {
              if (token) {
                return authService.getUserByToken(token).pipe(
                  tap((user) => {
                    patchState(store, { isAuthenticated: true, loading: false, token, currentUser: user });
                    router.navigate(['/dashboard/overview']);
                    toastr.success('Connexion réussie ! Bienvenue 👋');
                  }),
                  catchError((error) => {
                    patchState(store, { error: error.message, loading: false, isAuthenticated: false, currentUser: null });
                    return of(null);
                  })
                );
              } else {
                patchState(store, { error: 'Invalid credentials', loading: false, isAuthenticated: false, currentUser: null });
                return of(null);
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
        switchMap(() =>
          authService.getUserByToken(authService.getToken()!).pipe(
            switchMap((currentUser) => {
              if (currentUser) {
                return authService.logout(currentUser.id).pipe(
                  tap(() => {
                    patchState(store, {
                      isAuthenticated: false,
                      token: null,
                      currentUser: null,
                      loading: false,
                    });
                    authService.deleteToken();
                    toastr.success('Déconnexion réussie 👋');
                    router.navigate(['/login']);
                  }),
                  catchError((error) => {
                    patchState(store, { error: error.message, loading: false });
                    toastr.error('Échec de la déconnexion : ' + error.message);
                    return of(null);
                  })
                );
              } else {
                const error = 'Utilisateur non trouvé';
                patchState(store, { error, loading: false });
                toastr.error(error);
                return of(null);
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.message, loading: false });
              toastr.error('Erreur lors de la récupération de l’utilisateur : ' + error.message);
              return of(null);
            })
          )
        )
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
