// Frontend/src/app/features/subscription/store/selectors.ts
import { signalStoreFeature, withState } from "@ngrx/signals";
import { computed } from "@angular/core";
import { withComputed } from "@ngrx/signals";
import { Status, SubscriptionDetails, SubscriptionType } from "../models/subscription.model";
import { SubscriptionState } from "./states";
import { initialState } from "./states";
import { SubscriptionWithDetails, TimeUnit } from "../models/subscription.interface";
import { SubscriptionCalculator } from "../utils/subscription.constant";

export const subscriptionSelectorsFeature = signalStoreFeature(
    withState<SubscriptionState>(initialState),

    withComputed(({ subscriptionsWithDetails }) => ({
        filteredSubscriptions: computed(() => {
            return function (menu: string, search: string | null): SubscriptionWithDetails[] {
                let filtered = subscriptionsWithDetails();

                // Filtrage par menu
                if (menu && menu !== 'all') {
                    filtered = filtered.filter((sub: SubscriptionWithDetails) => {
                        if (menu === 'active') return sub.status.expired === false;
                        if (menu === 'inactive') return sub.status.expired === true;
                        return true;
                    });
                }

                // Filtrage par recherche
                if (search && typeof search === 'string' && search.trim() !== '') {
                    const searchLower = search.toLowerCase().trim();
                    filtered = filtered.filter((sub: SubscriptionWithDetails) =>
                        sub.details.fullname?.toLowerCase().includes(searchLower) ||
                        sub.details.email?.toLowerCase().includes(searchLower) ||
                        sub.details.tel?.toLowerCase().includes(searchLower) ||
                        sub.details.id?.toString().includes(searchLower)
                    );
                }
                return filtered;
            }
        }),

        getProgressClasses: computed(() => {
            // Définir le type de la fonction retournée
            return function (progress: number): string {
                if (progress > 90) return 'bg-green-500';
                if (progress > 80) return 'bg-green-400';
                if (progress > 70) return 'bg-blue-500';
                if (progress > 60) return 'bg-blue-400';
                if (progress > 50) return 'bg-yellow-500';
                if (progress > 40) return 'bg-yellow-400';
                if (progress > 30) return 'bg-orange-500';
                if (progress > 20) return 'bg-orange-400';
                if (progress > 10) return 'bg-red-400';
                return 'bg-red-500';
            }
        }),

        calculateTimeBasedPrice: computed(() => {
            return (
                type: SubscriptionType,
                duration: number,
                unit: TimeUnit,
                customChannelCount?: number
            ): number => {
                const calculator = new SubscriptionCalculator(
                    type,
                    duration,
                    unit,
                    customChannelCount
                );
                return calculator.calculateTimeBasedPrice();
            };
        }),

        channelCount: computed(() => {
            return (
                type: SubscriptionType,
                customChannelCount?: number
            ): number => {
                const calculator = new SubscriptionCalculator(
                    type,
                    1,
                    TimeUnit.MONTHS,
                    customChannelCount
                );
                return calculator.getChannelCount();
            };
        }),
        totalPrice: computed(() => {
            return (
                type: SubscriptionType,
                duration: number,
                unit: TimeUnit,
                customChannelCount?: number
            ): number => {
                const calculator = new SubscriptionCalculator(
                    type,
                    duration,
                    unit,
                    customChannelCount
                );
                return calculator.calculateTotalPrice();
            };
        })
    }))
);
