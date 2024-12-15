export type SubscriptionType = 'Basique' | 'Classique';

export interface ISubscription {
  id: number;
  fullname: string;
  email: string;
  tel: string;
  adresse: string;
  subscriptionType: SubscriptionType;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  progress: number;
  active: boolean;
  channelCount: number;
  password: string;
}

export interface SubscriptionState {
  subscriptions: ISubscription[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  expandedMenuId: number | null;
}