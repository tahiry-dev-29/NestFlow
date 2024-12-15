import { inject, Pipe, PipeTransform } from '@angular/core';
import { ISubscription } from '../../subscription/models/subscription.interface';
import { SubscriptionStore } from '../../subscription/store/subscribed.store';

@Pipe({
  name: 'filterSubscribers',
  standalone: true,
})
export class FilterSubscribersPipe implements PipeTransform {
  private store = inject(SubscriptionStore);

  transform(
    subscribers: ISubscription[],
    filterObj: { menu: string; search: string }
  ): ISubscription[] {
    const { menu, search } = filterObj;
    return this.store.filteredSubscriptions()(menu, search);
  }
}