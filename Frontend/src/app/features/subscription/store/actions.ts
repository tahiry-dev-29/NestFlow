import { patchState, signalStoreFeature, withState } from '@ngrx/signals';

import { inject } from '@angular/core';
import { withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, of, pipe, switchMap, tap } from 'rxjs';
import {
  AddSubscription,
  EditSubscription,
  RenewSubscriptionData,
  SubscriptionWithDetails,
} from '../interfaces/subscription.interface';
import { SubscriptionDetails } from '../models/subscription.model';
import { SubscriptionService } from '../services/subscription.service';
import { initialState, SubscriptionState } from './states';

export const subscriptionActionsFeature = signalStoreFeature(
  withState<SubscriptionState>(initialState),
  withMethods((store, subscriptionService = inject(SubscriptionService)) => ({
    getById(id: string): SubscriptionWithDetails | undefined {
      return store
        .subscriptionsWithDetails()
        .find((subscription) => subscription.details.id === id);
    },

    LoadSubscriptionWithDetails: rxMethod<SubscriptionWithDetails[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(() =>
          subscriptionService.getStatusSubscriptions().pipe(
            tap({
              next: (subscriptions) =>
                patchState(store, {
                  subscriptionsWithDetails: subscriptions,
                  loading: true,
                }),
              error: (error) =>
                patchState(store, { error: error.message, loading: false }),
            })
          )
        ),
        tap(() => patchState(store, { loading: false }))
      )
    ),

    addSubscription: rxMethod<AddSubscription>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((newSubscription) =>
          subscriptionService
            .AddSubscription(newSubscription as SubscriptionDetails)
            .pipe(
              tap(() => {
                patchState(store, {
                  subscriptions: [
                    ...store.subscriptions(),
                    newSubscription as SubscriptionDetails,
                  ],
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || "Erreur lors de l'ajout",
                  loading: false,
                });
                return of(null);
              })
            )
        ),
        tap(() => patchState(store, { loading: false }))
      )
    ),
    updateSubscription: rxMethod<EditSubscription>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((subscription: EditSubscription) => {
          if (!subscription.id) {
            return of(null);
          }
          return subscriptionService
            .EditSubscription(subscription.id, subscription)
            .pipe(
              tap(() => {
                const updatedSubscriptions = store
                  .subscriptions()
                  .map((sub) =>
                    sub.id === subscription.id
                      ? { ...sub, ...subscription }
                      : sub
                  );
                patchState(store, { subscriptions: updatedSubscriptions });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Erreur lors de la mise à jour',
                  loading: false,
                });
                return of(null);
              })
            );
        }),
        tap(() => patchState(store, { loading: false }))
      )
    ),
    deleteSubscription: rxMethod<{ id: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id }) =>
          subscriptionService.DeleteSubscription(id).pipe(
            tap(() => {
              patchState(store, {
                subscriptionsWithDetails: store
                  .subscriptionsWithDetails()
                  .filter(
                    (subscription: SubscriptionWithDetails) =>
                      subscription.details.id !== id
                  ),
              });
            }),
            catchError((error) => {
              patchState(store, {
                error: error.message || 'Erreur lors de la suppression',
                loading: false,
              });
              return of(null);
            })
          )
        ),
        tap(() => patchState(store, { loading: false }))
      )
    ),

    reNewSubscription: rxMethod<RenewSubscriptionData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((subscription: RenewSubscriptionData) =>
          subscriptionService
            .ReNewSubscription(subscription.id, subscription)
            .pipe(
              tap(() => {
                patchState(store, {
                  subscriptionsWithDetails: store
                    .subscriptionsWithDetails()
                    .map((sub) =>
                      sub.details.id === subscription.id
                        ? {
                            ...sub,
                            details: { ...sub.details, ...subscription },
                          }
                        : sub
                    ),
                });
              }),
              catchError((error) => {
                patchState(store, {
                  error: error.message || 'Erreur lors de la renouvellement',
                  loading: false,
                });
                return of(null);
              })
            )
        ),
        tap(() => patchState(store, { loading: false }))
      )
    ),

    // Helpers methods
    toggleExpand(id: string | undefined): void {
      patchState(store, { expandedId: store.expandedId() === id ? null : id });
    },

    toggleMenuExpand(id: string | undefined): void {
      patchState(store, {
        expandedMenuId: store.expandedMenuId() === id ? null : id,
      });
    },

    closeExpandedMenu(): void {
      patchState(store, { expandedMenuId: null });
    },

    toggleDetails(id: string | undefined): void {
      patchState(store, { expandedId: store.expandedId() === id ? null : id });
    },

    closeExpandedId(): void {
      patchState(store, { expandedId: null });
    },
  }))
);
