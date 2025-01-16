import { patchState, signalStoreFeature, withState } from '@ngrx/signals';

import { inject } from '@angular/core';
import { withMethods } from "@ngrx/signals";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { SubscriptionDetails } from "../models/subscription.model";
import { SubscriptionService } from '../services/subscription.service';
import { initialState } from './states';

export const subscriptionActionsFeature = signalStoreFeature(
    withState(initialState),
    withMethods((store, subscriptionService = inject(SubscriptionService)) => ({

        // Load Subscriptions
        loadSubscriptions: rxMethod<SubscriptionDetails[]>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    subscriptionService.getListsSubscriptions().pipe(
                        tap({
                            next: (subscriptions) => patchState(store, { subscriptions, loading: false }),
                            error: (error) => patchState(store, { error: error.message, loading: false })
                        })
                    )
                )
            )
        ),
        // Add Subscription

        addSubscription: rxMethod<SubscriptionDetails>(
            pipe(
                tap(() => patchState(store, state => ({
                    // ... logique for adding subscription
                })))
            )
        ),
        updateSubscription: rxMethod<SubscriptionDetails>(
            pipe(
                tap(() => patchState(store, state => ({
                    // ... logique for updating subscription
                })))
            )
        ),
        deleteSubscription: rxMethod<{ id: string }>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(({ id }) =>
                    subscriptionService.DeleteSubscription(id).pipe(
                        tap(() => {
                            patchState(store, {
                                subscriptions: store.subscriptions().filter((subscription: SubscriptionDetails) => subscription.id !== id),
                            });
                        }),
                        catchError((error) => {
                            console.error("Erreur lors de la suppression de l'abonnement :", error);
                            patchState(store, { error: error.message || 'Erreur lors de la suppression', loading: false });
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
            patchState(store, { expandedMenuId: store.expandedMenuId() === id ? null : id });
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