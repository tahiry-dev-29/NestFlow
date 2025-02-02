import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, mergeMap, pipe, switchMap, tap } from 'rxjs';
import { ERROR_MESSAGES, SERVER_ERROR_MESSAGES, ERROR_MESSAGES_FORM } from '../../../../constantes';
import { IAuthCredentials } from '../../auth/models/auth/auth.module';
import { AuthService } from '../../auth/services/auth.service';
import { IUsers, UserState } from '../../users/models/users/users.module';
import { HttpErrorResponse } from '@angular/common/http';
// Types
interface ErrorResponse extends HttpErrorResponse {
  error: {
    message?: string;
    code?: string;
    validationErrors?: Record<string, string[]>;
  };
}

// Initial State
const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  currentUser: null,
  token: null,
};

const getInitialState = (): UserState => ({ ...initialState });

const handleHttpError = (store: any, error: ErrorResponse) => {
  const statusCode = error.status;
  let errorMessage: string;

  if (error.error?.validationErrors) {
    errorMessage = ERROR_MESSAGES_FORM.VALIDATION_ERROR;
  } else if (SERVER_ERROR_MESSAGES[statusCode as keyof typeof SERVER_ERROR_MESSAGES]) {
    errorMessage = SERVER_ERROR_MESSAGES[statusCode as keyof typeof SERVER_ERROR_MESSAGES];
  } else {
    errorMessage = error.error?.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  patchState(store, {
    error: errorMessage,
    loading: false,
  });

  return EMPTY;
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ loading, error, currentUser, token }) => ({
    selectLoading: computed(() => loading()),
    selectError: computed(() => error()),
    selectCurrentUser: computed(() => currentUser()),
    selectToken: computed(() => token())
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router), toastr = inject(ToastrService)) => {
    const resetAuthState = () => ({
      ...initialState
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
              tap(() => {
                patchState(store, { loading: false, error: null });
                toastr.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                router.navigate(['/login']);
              }),
              catchError((error: ErrorResponse) => handleHttpError(store, error)),
              finalize(() => patchState(store, { loading: false }))
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
                  patchState(store, {
                    error: ERROR_MESSAGES.INVALID_CREDENTIALS,
                    loading: false
                  });
                  toastr.error(ERROR_MESSAGES.INVALID_CREDENTIALS);
                  return EMPTY;
                }

                return authService.getUserByToken(token).pipe(
                  tap((user) => {
                    patchState(store, {
                      loading: false,
                      error: null,
                      currentUser: user,
                      token,
                    });
                    router.navigate(['/dashboard/overview']);
                    toastr.success('Bienvenue sur Nestflow !👌');
                  }),
                  catchError((error: ErrorResponse) => handleHttpError(store, error))
                );
              }),
              catchError((error: ErrorResponse) => handleHttpError(store, error)),
              finalize(() => patchState(store, { loading: false }))
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
                  patchState(store, {
                    error: ERROR_MESSAGES.USER_NOT_FOUND,
                    loading: false
                  });
                  toastr.error(ERROR_MESSAGES.USER_NOT_FOUND);
                  return EMPTY;
                }

                return authService.logout(currentUser.id).pipe(
                  tap(() => {
                    patchState(store, resetAuthState());
                    authService.deleteToken();
                    router.navigate(['/login']);
                    toastr.success('🚪 Logging out...');
                  }),
                  catchError((error: ErrorResponse) => {
                    const errorMessage = error.error?.message || ERROR_MESSAGES.LOGOUT_ERROR;
                    patchState(store, {
                      error: errorMessage,
                      loading: false
                    });
                    toastr.error(errorMessage);
                    return EMPTY;
                  }),
                  finalize(() => patchState(store, { loading: false }))
                );
              }),
              catchError((error: ErrorResponse) => handleHttpError(store, error))
            );
          })
        )
      )
    };
  })
);