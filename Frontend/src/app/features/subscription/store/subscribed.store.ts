/* import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ISubscription, SubscriptionState, SubscriptionType } from '../models/subscription.interface';

export const SUBSCRIPTION_SETTINGS: Record<SubscriptionType, { duration: number; channels: number }> = {
  Basique: { duration: 31, channels: 300 },
  Classique: { duration: 31, channels: 500 },
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
    filteredSubscriptions: computed(() => (menu: string, search: string | null) => {
    
      let filtered = subscriptions();
    
      // Filtrage par menu
      if (menu && menu !== 'all') {
        filtered = filtered.filter((sub) => {
          if (menu === 'active') return sub.active === true;
          if (menu === 'inactive') return sub.active === false;
          return true;
        });
      }
      // Filtrage par recherche
      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchLower = search.toLowerCase().trim();
        filtered = filtered.filter((sub) =>
          sub.fullname.toLowerCase().includes(searchLower) ||
          sub.email.toLowerCase().includes(searchLower) ||
          sub.tel.toLowerCase().includes(searchLower) ||
          sub.id.toString().includes(searchLower)
        );
      }
      return filtered;
    }),
    totalSubscribers: computed(() => subscriptions().length),
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
      subscriptions().map((sub) => {
        const startDate = new Date(sub.subscriptionStartDate);
        const endDate = new Date(sub.subscriptionEndDate);
        const now = new Date();
        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        const elapsed = (now.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        const progress = duration > 0 ? Math.max(0, Math.min(100, (elapsed / duration) * 100)) : 0;
        return { id: sub.id, progress: Math.round(progress) };
      })
    ),
    isLoading: computed(() => loading),
  })),
  withMethods((store) => ({
    getSubscriptionById(id: number): ISubscription | null {
      return store.subscriptions().find((sub) => sub.id === id) || null;
    },
    getRemainingDays(id: number): number {
      const subscription = this.getSubscriptionById(id);
      if (!subscription) return 0;
      const endDate = new Date(subscription.subscriptionEndDate);
      const today = new Date();
      const differenceInTime = endDate.getTime() - today.getTime();
      return Math.max(0, Math.ceil(differenceInTime / (1000 * 3600 * 24)));
    },
    addSubscription(subscription: ISubscription): void {
      patchState(store, { loading: true });
      const newId = Math.max(0, ...store.subscriptions().map((s) => s.id)) + 1;
      const startDate = new Date();
      let endDate: Date;

      if (subscription.deadline) {
        endDate = new Date(subscription.deadline);
      } else {
        const duration = SUBSCRIPTION_SETTINGS[subscription.subscriptionType]?.duration || 30;
        endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
      }

      const newSubscription: ISubscription = {
        ...subscription,
        id: newId,
        subscriptionStartDate: startDate.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
      };
      patchState(store, { subscriptions: [...store.subscriptions(), newSubscription], loading: false });
      this.saveToLocalStorage();
    },
    update(id: number, updates: Partial<ISubscription>): void {
      patchState(store, { loading: true });
      const updatedSubscriptions = store.subscriptions().map((sub) => {
        if (sub.id === id) {
          const updatedSubscription = { ...sub, ...updates };
          let endDate: Date;

          if (updates.deadline) {
            endDate = new Date(updates.deadline);
          } else if (updates.subscriptionStartDate) {
            const startDate = new Date(updates.subscriptionStartDate);
            const duration = SUBSCRIPTION_SETTINGS[updatedSubscription.subscriptionType]?.duration || 30;
            endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
          } else {
            const now = new Date();
            const currentEndDate = new Date(updatedSubscription.subscriptionEndDate);
            const remainingDays = Math.max(0, Math.ceil((currentEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
            endDate = new Date(now.getTime() + remainingDays * 24 * 60 * 60 * 1000);
          }
          updatedSubscription.subscriptionEndDate = endDate.toISOString();
          return updatedSubscription;
        }
        return sub;
      });
      patchState(store, { subscriptions: updatedSubscriptions, loading: false });
      this.saveToLocalStorage();
    },
    deleteSubscription(id: number): void {
      patchState(store, { loading: true });
      patchState(store, { subscriptions: store.subscriptions().filter((sub) => sub.id !== id), loading: false });
      this.saveToLocalStorage();
    },
    toggleExpand(id: number | null): void {
      patchState(store, { expandedId: store.expandedId() === id ? null : id });
      this.saveToLocalStorage();
    },
    toggleMenuExpand(id: number | null): void {
      patchState(store, { expandedMenuId: store.expandedMenuId() === id ? null : id });
      this.saveToLocalStorage();
    },
    saveToLocalStorage(): void {
      localStorage.setItem('subscriptionState', JSON.stringify({
        subscriptions: store.subscriptions(),
        error: store.error(),
        expandedId: store.expandedId(),
        expandedMenuId: store.expandedMenuId(),
      }));
    },
    loadSubscriptions(): void {
      const storedState = localStorage.getItem('subscriptionState');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        patchState(store, { subscriptions: parsedState.subscriptions });
      }
    },
    closeExpandedMenu(): void { 
      patchState(store, { expandedMenuId: null });
      this.saveToLocalStorage();
    },
    toggleDetails(id: number | null): void {
      patchState(store, { expandedId: store.expandedId() === id ? null : id });
      this.saveToLocalStorage();
    },
  }))
); */