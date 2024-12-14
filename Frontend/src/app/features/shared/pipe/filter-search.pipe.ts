import { Pipe, PipeTransform } from '@angular/core';
import { ISubscription } from '../../subscription/models/subscription.interface';

@Pipe({
  name: 'filterSubscribers',
  standalone: true,
})
export class FilterSubscribersPipe implements PipeTransform {
  transform(
    subscribers: ISubscription[],
    filterObj: { menu: string; search: string }
  ): ISubscription[] {
    if (!subscribers) return [];

    const { menu, search } = filterObj;

    let filtered = subscribers;

    
    if (menu === 'active') {
      filtered = filtered.filter((sub) => sub.progress < 50);
    } else if (menu === 'inactive') {
      filtered = filtered.filter((sub) => sub.progress >= 50);
    }

    if (typeof search === 'string' && search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.fullname.toLowerCase().includes(lowerSearch) ||
          sub.email.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }
}