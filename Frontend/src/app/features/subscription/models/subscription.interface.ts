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
  deadline?: string;
  progress: number | null;
  active: boolean;
  [key: string]: any;
}

export interface SubscriptionState {
  subscriptions: ISubscription[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  expandedMenuId: number | null;
}
