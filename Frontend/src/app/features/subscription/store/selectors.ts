// Frontend/src/app/features/subscription/store/selectors.ts
import { computed } from "@angular/core";
import { signalStoreFeature, withComputed, withState } from "@ngrx/signals";
import { SubscriptionWithDetails } from "../interfaces/subscription.interface";
import { Status, SubscriptionType, TimeUnit } from "../models/subscription.model";
import { SubscriptionCalculator } from "../utils/subscription.constant";
import { initialState, SubscriptionState } from "./states";

export const subscriptionSelectorsFeature = signalStoreFeature(
    withState<SubscriptionState>(initialState),
    withComputed(({ subscriptionsWithDetails }) => ({
        filteredSubscriptions: computed(() => {
            return function (menu: string, search: string | null): SubscriptionWithDetails[] {
                let filtered = subscriptionsWithDetails();

                if (menu && menu !== 'all') {
                    filtered = filtered.filter((sub: SubscriptionWithDetails) => {
                        if (menu === 'active') return sub.status.expired === false;
                        if (menu === 'inactive') return sub.status.expired === true;
                        return true;
                    });
                }

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
            return (progress: number): string => {
                let baseClasses = 'transition-all duration-300 ease-in-out shadow-md bg-gradient-to-r striped-progress';

                if (progress > 95) return `${baseClasses} from-green-400 to-green-600`;
                if (progress > 90) return `${baseClasses} from-green-500 to-green-600`;
                if (progress > 85) return `${baseClasses} from-green-400 to-green-500`;
                if (progress > 80) return `${baseClasses} from-blue-400 to-blue-500`;
                if (progress > 75) return `${baseClasses} from-blue-400 to-blue-500`;
                if (progress > 50) return `${baseClasses} from-yellow-400 to-yellow-500`;
                if (progress > 40) return `${baseClasses} from-yellow-400 to-yellow-500`;
                if (progress > 30) return `${baseClasses} from-orange-400 to-orange-500`;
                if (progress > 20) return `${baseClasses} from-orange-400 to-orange-500`;
                if (progress > 10) return `${baseClasses} from-red-400 to-red-500`;
                return `${baseClasses} from-red-400 to-red-500`;
            };
        }),

        subscriptionStats: computed(() => {
            const subs = subscriptionsWithDetails();
            return {
                total: subs.length,
                active: subs.filter((sub: SubscriptionWithDetails) => !sub.status.expired).length,
                expired: subs.filter((sub: SubscriptionWithDetails) => sub.status.expired).length,
                expiringSoon: subs.filter((sub: SubscriptionWithDetails) =>
                    !sub.status.expired && (sub.status.remainingDays || 0) <= 7
                ).length
            };
        }),

        subscriptionChartData: computed(() => {
            const subs = subscriptionsWithDetails();
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                return date.toLocaleString('default', { month: 'short' });
            }).reverse();

            return {
                labels: last6Months,
                datasets: [
                    {
                        label: 'Active Subscriptions',
                        data: last6Months.map((month: string) => {
                            return subs.filter((sub: SubscriptionWithDetails) => {
                                const startDate = sub.details.subscriptionStartDate ? new Date(sub.details.subscriptionStartDate) : null;
                                return startDate && startDate.toLocaleString('default', { month: 'short' }) === month && !sub.status.expired;
                            }).length;
                        }),
                        backgroundColor: 'rgba(25, 135, 84, 0.2)',
                        borderColor: 'rgba(25, 135, 84, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Expired Subscriptions',
                        data: last6Months.map((month: string) => {
                            return subs.filter((sub: SubscriptionWithDetails) => {
                                const endDate = sub.details.subscriptionEndDate ? new Date(sub.details.subscriptionEndDate) : null;
                                return endDate && endDate.toLocaleString('default', { month: 'short' }) === month && sub.status.expired;
                            }).length;
                        }),
                        backgroundColor: 'rgba(220, 53, 69, 0.2)',
                        borderColor: 'rgba(220, 53, 69, 1)',
                        borderWidth: 2
                    }
                ]
            };
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
