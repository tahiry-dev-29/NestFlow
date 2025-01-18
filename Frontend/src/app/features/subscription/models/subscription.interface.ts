import { SubscriptionDetails } from "./subscription.model";


/* {
  "status": {
      "remainingDays": 28,
      "progressPercentage": 93.54838709677419,
      "expired": false
  },
  "details": {
      "id": "491281ef-b6e5-4ac4-a1d7-6dc806678768",
      "fullname": "Cristina Quitzon",
      "email": "Elmer74@example.org",
      "tel": "726-217-8000",
      "adresse": "00154 Kaden Trail",
      "code": "$2a$12$t3XJ6sLQs40.P8eW///DmulBPD.UX5H9dDnf.JOwZqQRlEtbWkFkm",
      "subscriptionType": "CLASSIC",
      "channelCount": 500,
      "subscriptionStartDate": "2025-01-15T16:18:27.318",
      "subscriptionEndDate": "2025-02-15T16:18:27.318",
      "status": "ACTIVE",
      "price": 50000,
      "remainingDays": 28,
      "remainingHours": 675
  }
}, */
export interface SubscriptionWithDetails {
  status: {
    remainingDays: number | undefined;
    progressPercentage: number | undefined;
    expired: boolean | undefined;
  };
  details: SubscriptionDetails;
}


export interface SubscriptionState {
  subscriptionsWithDetails: SubscriptionWithDetails[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  expandedMenuId: number | null;
}

export enum TimeUnit {
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
  YEARS = 'YEARS'
}