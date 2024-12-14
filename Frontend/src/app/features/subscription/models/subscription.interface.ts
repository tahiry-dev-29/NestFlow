export type SubscriptionType = 'Basique' | 'Classique';

export interface ISubscription {
  id: number;
  fullname: string ;
  email: string;
  tel: string;
  adresse: string;
  createdAt: string;
  subscriptionType: SubscriptionType;
  progress: number;
  active: boolean;
  channelCount: number;
  password: string;
}

export type TypeNewSubscription = Omit<ISubscription, 'id'>;