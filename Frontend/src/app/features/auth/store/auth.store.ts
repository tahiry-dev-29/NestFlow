import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, mergeMap, Observable, pipe, switchMap, tap } from 'rxjs';
import { ERROR_MESSAGES } from '../../../../constantes';
import { IAuthCredentials } from '../../auth/models/auth/auth.module';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers, UserState } from '../../users/models/users/users.module';

// Memoize initial state
const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  currentUser: null,
};

const getInitialState = (): UserState => ({ ...initialState });

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ loading, error }) => ({
    selectLoading: computed(() => loading()),
    selectError: computed(() => error()),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router), toastr = inject(ToastrService)) => {
    const resetAuthState = () => ({
      isAuthenticated: false,
      currentUser: null,
      token: null,
      loading: false,
      error: null
    });

    const setErrorState = (errorMessage: string) => ({
      ...resetAuthState(),
      error: errorMessage,
      loading: false
    });

    return {
      getUserById: (userId: string): IUsers | undefined => {
        return store.users().find((user) => user.id === userId);
      },

      signup: rxMethod<FormData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((formData) =>
            authService.signup(formData).pipe(
              tap(_ => {
                patchState(store, { loading: false });
                toastr.success('User created successfully!');
              }),
              catchError((error) => {
                const errorMessage = error?.error?.message || 'Failed to create user';
                patchState(store, { error: errorMessage, loading: false });
                toastr.error(errorMessage);
                return EMPTY;
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
                if (!token) {
                  patchState(store, setErrorState(ERROR_MESSAGES.INVALID_CREDENTIALS));
                  toastr.error(ERROR_MESSAGES.INVALID_CREDENTIALS);
                  return EMPTY;
                }

                return authService.getUserByToken(token).pipe(
                  tap((user) => {
                    patchState(store, {
                      isAuthenticated: true,
                      loading: false,
                      token,
                      currentUser: user
                    });
                    router.navigate(['/dashboard/overview']);
                    toastr.success('Bienvenue sur Nestflow !👌');
                  }),
                  catchError((error) => {
                    const errorMessage = error?.error?.message || ERROR_MESSAGES.USER_RETRIEVAL;
                    patchState(store, setErrorState(errorMessage));
                    toastr.error(errorMessage);
                    return EMPTY;
                  })
                );
              }),
              catchError((error) => {
                const errorMessage = error?.error?.message || ERROR_MESSAGES.PASSWORD_OR_EMAIL_INCORRECT;
                patchState(store, setErrorState(errorMessage));
                return EMPTY;
              })
            )
          )
        )
      ),

      logout: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const token = authService.getToken();
            if (!token) {
              patchState(store, resetAuthState());
              router.navigate(['/login']);
              return EMPTY;
            }

            return authService.getUserByToken(token).pipe(
              switchMap((currentUser) => {
                if (!currentUser) {
                  patchState(store, setErrorState(ERROR_MESSAGES.USER_NOT_FOUND));
                  toastr.error(ERROR_MESSAGES.USER_NOT_FOUND);
                  return EMPTY;
                }

                return authService.logout(currentUser.id).pipe(
                  tap(() => {
                    patchState(store, resetAuthState());
                    authService.deleteToken();
                    router.navigate(['/login']);
                  }),
                  catchError((error) => {
                    patchState(store, { error: error.message, loading: false });
                    toastr.error('Disconnection failed : ' + error.message);
                    return EMPTY;
                  })
                );
              }),
              catchError((error) => {
                patchState(store, { error: error.message, loading: false });
                toastr.error(ERROR_MESSAGES.LOGOUT_ERROR + error.message);
                return EMPTY;
              })
            );
          })
        )
      ),

      checkAuthStatus: () => {
        const token = authService.getToken();
        if (token) {
          patchState(store, { isAuthenticated: true, token });
        }
      },
    };
  })
);