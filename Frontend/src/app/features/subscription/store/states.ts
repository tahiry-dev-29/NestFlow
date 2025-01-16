import { SubscriptionDetails } from "../models/subscription.model";

export interface SubscriptionState {
    subscriptions: SubscriptionDetails[];
    loading: boolean;
    error: string | null;
    expandedId: string | null;
    expandedMenuId: string | null;
    // expandedDetails: string | null;
}

export const initialState: SubscriptionState = {
    subscriptions: [],
    loading: false,
    error: null,
    expandedId: null,
    expandedMenuId: null,
    // expandedDetails: null
};