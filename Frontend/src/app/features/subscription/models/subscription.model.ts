export enum SubscriptionType {
  BASIC = 'BASIC',
  CLASSIC = 'CLASSIC',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum TimeUnit {
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
  YEARS = 'YEARS'
}

export class SubscriptionDetails {
  id: string | undefined;
  fullname: string | undefined;
  email: string | undefined;
  tel: string | undefined;
  adresse: string | undefined;
  code!: string;
  subscriptionType: SubscriptionType | undefined;
  channelCount: number | undefined;

  subscriptionStartDate: Date | undefined;
  subscriptionEndDate: Date | undefined;
  status: Status | undefined;
  price: number | undefined;
  remainingHours: number | undefined;
  remainingDays: number | undefined;
}