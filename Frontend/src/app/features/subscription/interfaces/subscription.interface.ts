import { SubscriptionDetails, SubscriptionType, TimeUnit } from "../models/subscription.model";


export interface SubscriptionWithDetails {
    status: {
        remainingDays: number | undefined;
        progressPercentage: number | undefined;
        expired: boolean | undefined;
    };
    details: SubscriptionDetails;
}

export type AddSubscription = Omit<SubscriptionDetails, 'id' | 'subscriptionStartDate' | 'subscriptionEndDate' | 'remainingHours' | 'status' | 'remainingDays'>;

export type EditSubscription = Omit<SubscriptionDetails, 'subscriptionStartDate' | 'subscriptionEndDate' | 'remainingHours' | 'remainingDays' | 'status' | 'price' | 'channelCount' |'subscriptionType' | 'timeUnit' | 'duration'>;


export type RenewSubscriptionData = {
    id: string;
    renewalPeriod: number;
    unit: TimeUnit;
    newType: SubscriptionType;
}



