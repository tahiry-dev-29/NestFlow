import { SubscriptionDetails } from "../../models/subscription.model";

export type AddSubscription = Omit<SubscriptionDetails, 'id' | 'subscriptionStartDate' | 'subscriptionEndDate' | 'remainingHours' | 'remainingDays' |  'status' | 'price' | 'channelCount'>;