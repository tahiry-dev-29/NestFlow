import { patchState, signalStoreFeature, withState } from '@ngrx/signals';

import { inject } from '@angular/core';
import { withMethods } from "@ngrx/signals";
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { SubscriptionDetails } from "../models/subscription.model";
import { SubscriptionService } from '../services/subscription.service';
import { initialState } from './states';
import { AddSubscription } from '../components/interfaces/subscription.interface';

export const subscriptionActionsFeature = signalStoreFeature(
    withState(initialState),
    withMethods((store, subscriptionService = inject(SubscriptionService)) => ({

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
        getStatusSubscription: rxMethod<string>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap((id: string) =>
                    subscriptionService.getStatusSubscriptions(id).pipe(
                        tap({
                            next: (subscriptions) => patchState(store, { subscriptions, loading: false }),
                            error: (error) => patchState(store, { error: error.message, loading: false })
                        })
                    )
                )
            )
        ),

        addSubscription: rxMethod<AddSubscription>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap((newSubscription) =>
                    subscriptionService.AddSubscription(newSubscription as SubscriptionDetails).pipe(
                        tap(() => {
                            patchState(store, {
                                subscriptions: [...store.subscriptions(), newSubscription as SubscriptionDetails],
                            });
                        }),
                        catchError((error) => {
                            patchState(store, { error: error.message || 'Erreur lors de l\'ajout', loading: false });
                            return of(null);
                        })
                    )
                ),
                tap(() => patchState(store, { loading: false }))
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