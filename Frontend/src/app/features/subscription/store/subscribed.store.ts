import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ISubscription, SubscriptionState, SubscriptionType } from '../models/subscription.interface';

export const SUBSCRIPTION_SETTINGS: Record<SubscriptionType, { duration: number; channels: number }> = {
  Basique: { duration: 30, channels: 250 },
  Classique: { duration: 30, channels: 500 },
};

const getInitialState = (): SubscriptionState => {
  const storedState = localStorage.getItem('subscriptionState');
  if (storedState) {
    return JSON.parse(storedState);
  }
  return {
    subscriptions: [],
    loading: false,
    error: null,
    expandedId: null,
    expandedMenuId: null,
  };
};

export const SubscriptionStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ subscriptions, loading }) => ({
    activeSubscriptions: computed(() =>
      subscriptions().filter((sub) => sub.active)
    ),
    inactiveSubscriptions: computed(() =>
      subscriptions().filter((sub) => !sub.active)
    ),
    filteredSubscriptions: computed(() => (menu: string, search: string | null) => {
      let filtered = subscriptions();

      if (menu === 'active') {
        filtered = filtered.filter((sub) => sub.active);
      } else if (menu === 'inactive') {
        filtered = filtered.filter((sub) => !sub.active);
      }

      if (search && typeof search === 'string') {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(
          (sub) =>
            sub.fullname.toLowerCase().includes(lowerSearch) ||
            sub.email.toLowerCase().includes(lowerSearch) ||
            sub.tel.includes(lowerSearch)
        );
      }

      return filtered;
    }),
    totalSubscriptions: computed(() => subscriptions().length),
    getProgressClasses: computed(() => (progress: number) => {
      if (progress > 90) return 'bg-green-500';
      if (progress > 80) return 'bg-green-400';
      if (progress > 70) return 'bg-blue-500';
      if (progress > 60) return 'bg-blue-400';
      if (progress > 50) return 'bg-yellow-500';
      if (progress > 40) return 'bg-yellow-400';
      if (progress > 30) return 'bg-orange-500';
      if (progress > 20) return 'bg-orange-400';
      if (progress > 10) return 'bg-red-400';
      return 'bg-red-500';
    }),
    subscriptionProgress: computed(() =>
      subscriptions().map(sub => {
        const startDate = new Date(sub.subscriptionStartDate);
        const endDate = new Date(sub.subscriptionEndDate);
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        const remainingDays = Math.max(0, (endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        const progress = (duration > 0) ? ((duration - remainingDays) / duration) * 100 : 0;
        return {
          id: sub.id,
          progress: Math.round(progress),
        };
      })
    ),
    isLoading: computed(() => loading())
  })),
  withMethods((store) => ({
    getSubscriptionById(id: number): ISubscription | null {
      return store.subscriptions().find((sub) => sub.id === id) || null;
    },
    addSubscription(subscription: ISubscription): void {
      patchState(store, { loading: true });
      const newId = Math.max(0, ...store.subscriptions().map((s) => s.id)) + 1;
      const startDate = new Date();

      const newSubscription: ISubscription = {
        ...subscription,
        id: newId,
        subscriptionStartDate: startDate.toISOString(),
        subscriptionEndDate: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        active: true,
      };

      setTimeout(() => {
        patchState(store, { 
          subscriptions: [...store.subscriptions(), newSubscription],
          loading: false 
        });
        this.saveToLocalStorage();
      }, 1000);
    },
    update(id: number, updates: Partial<ISubscription>): void {
      patchState(store, { loading: true });
      const existingSubscription = store.subscriptions().find((sub) => sub.id === id);
      if (!existingSubscription) {
        patchState(store, { loading: false });
        return;
      }

      const updatedSubscription = {
        ...existingSubscription,
        ...updates,
      };

      if (updates.subscriptionType) {
        const startDate = new Date(updatedSubscription.subscriptionStartDate);
        updatedSubscription.subscriptionEndDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      setTimeout(() => {
        patchState(store, {
          subscriptions: store.subscriptions().map((sub) => (sub.id === id ? updatedSubscription : sub)),
          loading: false
        });
        this.saveToLocalStorage();
      }, 1000);
    },
    deleteSubscription(id: number): void {
      patchState(store, { loading: true });
      setTimeout(() => {
        patchState(store, {
          subscriptions: store.subscriptions().filter((sub) => sub.id !== id),
          loading: false
        });
        this.saveToLocalStorage();
      }, 1000);
    },
    toggleExpand(id: number | null): void {
      patchState(store, { expandedId: store.expandedId() === id ? null : id });
      this.saveToLocalStorage();
    },
    toggleMenuExpand(id: number | null): void {
      patchState(store, { expandedMenuId: store.expandedMenuId() === id ? null : id });
      this.saveToLocalStorage();
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { loading: isLoading });
      this.saveToLocalStorage();
    },
    setError(error: string | null): void {
      patchState(store, { error });
      this.saveToLocalStorage();
    },
    resetError(): void {
      patchState(store, { error: null });
      this.saveToLocalStorage();
    },
    toggleDetails(id: number): void {
      this.toggleExpand(id);
    },
    toggleMenu(id: number): void {
      this.toggleMenuExpand(id);
    },
    closeExpandedMenu() {
      this.toggleMenuExpand(null);
    },
    saveToLocalStorage(): void {
      localStorage.setItem('subscriptionState', JSON.stringify({
        subscriptions: store.subscriptions(),
        loading: store.loading(),
        error: store.error(),
        expandedId: store.expandedId(),
        expandedMenuId: store.expandedMenuId(),
      }));
    },
    loadSubscriptions(): void {
      patchState(store, { loading: true });
      setTimeout(() => {
        const storedState = localStorage.getItem('subscriptionState');
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          patchState(store, { 
            subscriptions: parsedState.subscriptions,
            loading: false 
          });
        } else {
          patchState(store, { loading: false });
        }
      }, 1000);
    },
    filterAndSearch(menu: string, search: string | null): void {
      patchState(store, { loading: true });
      setTimeout(() => {
        const filtered = store.filteredSubscriptions()(menu, search);
        patchState(store, { 
          subscriptions: filtered,
          loading: false 
        });
      }, 500);
    }
  }))
);
