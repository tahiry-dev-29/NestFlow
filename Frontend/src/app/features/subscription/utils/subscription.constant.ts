import { SubscriptionType, TimeUnit } from "../models/subscription.model";

export const SUBSCRIPTION_CONFIG = {
  [SubscriptionType.BASIC]: {
    basePrice: 30000,
    baseChannels: 250,
    channelPriceRate: 1.2
  },
  [SubscriptionType.CLASSIC]: {
    basePrice: 50000,
    baseChannels: 500,
    channelPriceRate: 1.5
  }
} as const;

export const MAX_DURATION = {
  [TimeUnit.MONTHS]: 12,
  [TimeUnit.DAYS]: 365,
  [TimeUnit.WEEKS]: 52,
  [TimeUnit.YEARS]: 1
} as const;

export const MAX_CHANNEL_COUNT = {
  [SubscriptionType.BASIC]: 250,
  [SubscriptionType.CLASSIC]: 500
} as const;

export class PriceCalculator {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  divide(divisor: number): PriceCalculator {
    this.value = Number((this.value / divisor).toFixed(2));
    return this;
  }

  multiply(multiplier: number): PriceCalculator {
    this.value = Number((this.value * multiplier).toFixed(2));
    return this;
  }

  getValue(): number {
    return this.value;
  }
}

export class ChannelCalculator {
  constructor(
    private type: SubscriptionType,
    private customChannelCount?: number
  ) {}

  getBaseChannelCount(): number {
    return SUBSCRIPTION_CONFIG[this.type].baseChannels;
  }

  getCustomChannelCount(): number {
    return this.customChannelCount || this.getBaseChannelCount();
  }

  getChannelPriceRate(): number {
    return SUBSCRIPTION_CONFIG[this.type].channelPriceRate;
  }

  calculateExtraChannelPrice(): number {
    const channelCount = this.getCustomChannelCount();
    const baseCount = this.getBaseChannelCount();
    const rate = this.getChannelPriceRate();

    if (channelCount <= baseCount) {
      return 0;
    }

    const extraChannels = channelCount - baseCount;
    return extraChannels * rate;
  }
}

export class SubscriptionCalculator {
  private calculator: PriceCalculator;
  private channelCalc: ChannelCalculator;
  private type: SubscriptionType;

  constructor(
      type: SubscriptionType | null | undefined,
      private duration: number,
      private unit: TimeUnit,
      customChannelCount?: number
  ) {
      this.type = type ?? SubscriptionType.BASIC;
      const config = SUBSCRIPTION_CONFIG[this.type];

      if (!config) {
          console.error(`Invalid subscription type: ${type}`);
          this.calculator = new PriceCalculator(0);
          this.channelCalc = new ChannelCalculator(SubscriptionType.BASIC, customChannelCount);
          return;
      }

      const basePrice = config.basePrice;
      this.calculator = new PriceCalculator(basePrice);
      this.channelCalc = new ChannelCalculator(this.type, customChannelCount);
  }

  calculateTimeBasedPrice(): number {
    switch (this.unit) {
      case TimeUnit.DAYS:
        return this.calculator
          .divide(30)
          .multiply(this.duration)
          .getValue();

      case TimeUnit.WEEKS:
        return this.calculator
          .divide(4)
          .multiply(this.duration)
          .getValue();

      case TimeUnit.MONTHS:
        return this.calculator
          .multiply(this.duration)
          .getValue();

      case TimeUnit.YEARS:
        return this.calculator
          .multiply(this.duration * 12)
          .getValue();

      default:
        throw new Error(`Unité de temps non supportée: ${this.unit}`);
    }
  }

  calculateTotalPrice(): number {
    const timeBasedPrice = this.calculateTimeBasedPrice();
    const extraChannelPrice = this.channelCalc.calculateExtraChannelPrice();
    return timeBasedPrice + extraChannelPrice;
  }

  getChannelCount(): number {
    return this.channelCalc.getCustomChannelCount();
  }
}