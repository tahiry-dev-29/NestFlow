import { signalStore } from "@ngrx/signals";
import { subscriptionActionsFeature } from "./actions";
import { subscriptionSelectorsFeature } from "./selectors";

export const SubscriptionStore = signalStore(
    { providedIn: 'root' },
    subscriptionSelectorsFeature,
    subscriptionActionsFeature,
);