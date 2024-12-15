import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ISubscription, SubscriptionState, SubscriptionType } from '../models/subscription.interface';

const SUBSCRIPTION_SETTINGS: Record<SubscriptionType, { duration: number; channels: number }> = {
  Basique: { duration: 30, channels: 250 },
  Classique: { duration: 30, channels: 500 },
};

const getInitialState = (): SubscriptionState => {
  const storedState = localStorage.getItem('subscriptionState');
  if (storedState) {
    return JSON.parse(storedState);
  }
  return {
    subscriptions: [
      {
        id: 1,
        fullname: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        tel: '0612345678',
        adresse: '123 Rue des Lilas',
        subscriptionType: 'Basique',
        progress: 0,
        active: true,
        channelCount: 250,
        password: 'pass123',
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        id: 2,
        fullname: 'Marie Curie',
        email: 'marie.curie@example.com',
        tel: '0623456789',
        adresse: '42 Avenue des Fleurs',
        subscriptionType: 'Classique',
        progress: 0,
        active: true,
        channelCount: 1000,
        password: 'pass456',
        subscriptionStartDate: new Date().toISOString().split('T')[0],
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ],
    loading: false,
    error: null,
    expandedId: null,
    expandedMenuId: null,
  };
};

export const SubscriptionStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ subscriptions }) => ({
    activeSubscriptions: computed(() =>
      subscriptions().filter((sub) => sub.active)
    ),
    inactiveSubscriptions: computed(() =>
      subscriptions().filter((sub) => !sub.active)
    ),
    filteredSubscriptions: computed(() => (menu: string, search: string) => {
      let filtered = subscriptions();

      if (menu === 'active') {
        filtered = filtered.filter((sub) => sub.active);
      } else if (menu === 'inactive') {
        filtered = filtered.filter((sub) => !sub.active);
      }

      if (search.trim()) {
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
      if (progress > 70) return 'bg-blue-500';
      if (progress > 30) return 'bg-yellow-500';
      return 'bg-red-500';
    }),
    subscriptionDetails: computed(() =>
      subscriptions().map((sub) => {
        const { remainingDays, progress, active } = calculateSubscriptionDetails(sub.subscriptionStartDate, sub.subscriptionEndDate);
        return { id: sub.id, remainingDays, progress, active };
      })
    ),
    getProgress: computed(() => subscriptions().map((sub) => calculateSubscriptionDetails(sub.subscriptionStartDate, sub.subscriptionEndDate).progress)),
  })),
  withMethods((store) => ({
    getSubscriptionById(id: number) {
      return store.subscriptions().find((sub) => sub.id === id) || null;  
    },
    recalculateProgress() {
      const updatedSubscriptions = store.subscriptions().map((sub) => {
        const { progress, active } = calculateSubscriptionDetails(sub.subscriptionStartDate, sub.subscriptionEndDate);
        return { ...sub, progress, active };
      });

      patchState(store, { subscriptions: updatedSubscriptions });
      this.saveToLocalStorage();
    },
    addSubscription(subscription: ISubscription) {
      const newId = Math.max(0, ...store.subscriptions().map((s) => s.id)) + 1;
      const startDate = new Date();
      const duration = SUBSCRIPTION_SETTINGS[subscription.subscriptionType].duration;
      const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
      
      const newSubscription: ISubscription = {
        ...subscription,
        id: newId,
        subscriptionStartDate: startDate.toISOString().split('T')[0],
        subscriptionEndDate: endDate.toISOString().split('T')[0],
      };
      
      const { progress, active } = calculateSubscriptionDetails(newSubscription.subscriptionStartDate, newSubscription.subscriptionEndDate);
      newSubscription.progress = progress;
      newSubscription.active = active;

      patchState(store, { subscriptions: [...store.subscriptions(), newSubscription] });
      this.saveToLocalStorage();
    },
    update(id: number, updates: Partial<ISubscription>) {
      const existingSubscription = store.subscriptions().find((sub) => sub.id === id);
      if (!existingSubscription) return;

      const updatedSubscription = {
        ...existingSubscription,
        ...updates,
      };

      if (updates.subscriptionType) {
        const startDate = new Date();
        const duration = SUBSCRIPTION_SETTINGS[updates.subscriptionType].duration;
        const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
        updatedSubscription.subscriptionStartDate = startDate.toISOString().split('T')[0];
        updatedSubscription.subscriptionEndDate = endDate.toISOString().split('T')[0];
      }

      const { progress, active } = calculateSubscriptionDetails(updatedSubscription.subscriptionStartDate, updatedSubscription.subscriptionEndDate);
      updatedSubscription.progress = progress;
      updatedSubscription.active = active;

      patchState(store, {
        subscriptions: store.subscriptions().map((sub) => (sub.id === id ? updatedSubscription : sub)),
      });
      this.saveToLocalStorage();
    },
    deleteSubscription(id: number) {
      patchState(store, {
        subscriptions: store.subscriptions().filter((sub) => sub.id !== id),
      });
      this.saveToLocalStorage();
    },
    toggleExpand(id: number | null) {
      patchState(store, { expandedId: store.expandedId() === id ? null : id });
      this.saveToLocalStorage();
    },
    toggleMenuExpand(id: number | null) {
      patchState(store, { expandedMenuId: store.expandedMenuId() === id ? null : id });
      this.saveToLocalStorage();
    },
    setLoading(isLoading: boolean) {
      patchState(store, { loading: isLoading });
      this.saveToLocalStorage();
    },
    setError(error: string | null) {
      patchState(store, { error });
      this.saveToLocalStorage();
    },
    resetError() {
      patchState(store, { error: null });
      this.saveToLocalStorage();
    },
    toggleDetails(id: number) {
      this.toggleExpand(id);
    },
    toggleMenu(id: number) {
      this.toggleMenuExpand(id);
    },
    saveToLocalStorage() {
      localStorage.setItem('subscriptionState', JSON.stringify({
        subscriptions: store.subscriptions(),
        loading: store.loading(),
        error: store.error(),
        expandedId: store.expandedId(),
        expandedMenuId: store.expandedMenuId(),
      }));
    },
  }))
);

function calculateSubscriptionDetails(startDateString: string, endDateString: string) {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  const currentDate = new Date();
  
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const progress = Math.max(0, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));
  const active = progress <= 100 && progress > 11;
  
  return { remainingDays, progress, active };
}
