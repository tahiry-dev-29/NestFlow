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

    // Filtrage par menu (statut)
    if (menu === 'active') {
      filtered = filtered.filter((sub) => sub.active);
    } else if (menu === 'inactive') {
      filtered = filtered.filter((sub) => !sub.active);
    }

    // Filtrage par recherche
    if (search) {
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