export type SubscriptionType = 'Basique' | 'Classique';

export interface ISubscription {
  id: number;
  fullname: string;
  email: string;
  tel: string;
  adresse: string;
  subscriptionType: SubscriptionType;
  channelCount: number;
  password: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  active: boolean;
  progress: number | null;
  [key: string]: any;
}

export interface SubscriptionState {
  subscriptions: ISubscription[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  expandedMenuId: number | null;
}
