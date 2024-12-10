/* import { Injectable } from '@angular/core';
import { createSignalStore, SignalStore } from '@ngrx/signals';
import { ISubscription } from '../models/subscription.interface';

interface SubscriptionState {
  subscribers: ISubscription[];
  filter: string;
  searchTerm: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionStore extends SignalStore<SubscriptionState> {
  constructor() {
    super({
      subscribers: [
        {
            id: 1,
            fullname: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            tel: '0612345678',
            adresse: '123 Rue des Lilas',
            createdAt: '2024-01-01',
            progress: 75,
            active: true,
          },
          {
            id: 2,
            fullname: 'Marie Curie',
            email: 'marie.curie@example.com',
            tel: '0623456789',
            adresse: '456 Avenue des Fleurs',
            createdAt: '2024-01-02',
            progress: 50,
            active: false,
          },
          {
            id: 3,
            fullname: 'YCurie',
            email: 'ymarie.curie@example.com',
            tel: '0623456789',
            adresse: '42756 Avenue des Fleurs',
            createdAt: '2024-01-02',
            progress: 5,
            active: true,
          },
          {
            id: 4,
            fullname: 'rCurie',
            email: 'rcurie@example.com',
            tel: '0623456789',
            adresse: '5857 tt Fleurs',
            createdAt: '2024-01-02',
            progress: 78,
            active: false,
          },
          {
            id: 5,
            fullname: 'oCurie',
            email: 'ddcurie@example.com',
            tel: '0623456789',
            adresse: '7857 Avenue des Fleurs',
            createdAt: '2024-01-02',
            progress: 100,
            active: true,
          },
          {
            id: 6,
            fullname: 'Marie',
            email: 'vhcurie@example.com',
            tel: '0623456789',
            adresse: '41858 Avenue des Fleurs',
            createdAt: '2024-01-02',
            progress: 90,
            active: false,
          },
      ],
      filter: 'all',
      searchTerm: '',
    });
  }
  setFilter(filter: string) {
    this.updateState({ filter });
  }

  setSearchTerm(term: string) {
    this.updateState({ searchTerm: term });
  }

  get filteredSubscribers() {
    return this.select((state) => {
      let filtered = state.subscribers;

      if (state.filter === 'active') {
        filtered = filtered.filter((sub) => sub.active);
      } else if (state.filter === 'inactive') {
        filtered = filtered.filter((sub) => !sub.active);
      }

      if (state.searchTerm) {
        const term = state.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (sub) =>
            sub.fullname.toLowerCase().includes(term) ||
            sub.email.toLowerCase().includes(term)
        );
      }

      return filtered;
    });
  }
} */