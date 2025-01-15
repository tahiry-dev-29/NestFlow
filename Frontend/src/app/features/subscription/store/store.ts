import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { subscriptionSelectorsFeature } from "./selectors";
import { initialState, SubscriptionState } from "./states";
import { subscriptionActionsFeature } from "./actions";

export const SubscriptionStore = signalStore(
    { providedIn: 'root' },
    withState<SubscriptionState>(initialState),
    subscriptionSelectorsFeature,
    subscriptionActionsFeature,
);