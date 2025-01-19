import { SubscriptionWithDetails } from "../interfaces/subscription.interface";
import { SubscriptionDetails } from "../models/subscription.model";

export interface SubscriptionState {
    subscriptions: SubscriptionDetails[];
    subscriptionsWithDetails: SubscriptionWithDetails[];
    loading: boolean;
    error: string | null;
    expandedId: string | null;
    expandedMenuId: string | null;
}

export const initialState: SubscriptionState = {
    subscriptions: [],
    subscriptionsWithDetails: [],
    loading: false,
    error: null,
    expandedId: null,
    expandedMenuId: null,
};