import { SubscriptionDetails, SubscriptionType, TimeUnit } from "../models/subscription.model";

export interface SubscriptionState {
    subscriptionsWithDetails: SubscriptionWithDetails[];
    loading: boolean;
    error: string | null;
    expandedId: number | null;
    expandedMenuId: number | null;
}

export interface SubscriptionWithDetails {
    status: {
        remainingDays: number | undefined;
        progressPercentage: number | undefined;
        expired: boolean | undefined;
    };
    details: SubscriptionDetails;
}

export type AddSubscription = Omit<SubscriptionDetails, 'id' | 'subscriptionStartDate' | 'subscriptionEndDate' | 'remainingHours' | 'remainingDays' | 'status' | 'price' | 'channelCount'>;

export type ReNewSubscription = {
    renewalPeriod: number;
    unit: TimeUnit;
    newType: SubscriptionType;
}



