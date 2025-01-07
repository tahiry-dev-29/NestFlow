import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { catchError, mergeMap, of, pipe, switchMap, tap } from 'rxjs';
import { IAuthCredentials } from '../../auth/models/auth/auth.module';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers, TSignUp, UserState } from '../../users/models/users/users.module';

const getInitialState = (): UserState => ({
  users: [],
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  currentUser: null,
});

export const AuthStore = signalStore(
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
  withMethods((store, authService = inject(AuthService), router = inject(Router), toastr = inject(ToastrService)) => ({
    getUserById: (userId: string): IUsers | undefined => {
      return store.users().find((user) => user.id === userId);
    },
    
    signup: rxMethod<TSignUp>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((user) =>
          authService.signUp(user).pipe(
            tap((response) => {
              console.log('Réponse brute du serveur :', response);
              patchState(store, { loading: false });
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
            mergeMap((token) => {
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