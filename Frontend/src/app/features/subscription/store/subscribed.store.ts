import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ISubscription } from '../models/subscription.interface';

// Define the state interface
export interface SubscriptionState {
  subscriptions: ISubscription[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  expandedMenuId: number | null;
}

// Constants for subscription settings
const SUBSCRIPTION_SETTINGS = {
  'Basique': {
    duration: 30, // 30 days
    channels: 250
  },
  'Classique': {
    duration: 90, // 90 days
    channels: 500
  }
};

// Initial state with mock data
const initialState: SubscriptionState = {
  subscriptions: [
    {
      id: 1,
      fullname: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      tel: '0612345678',
      adresse: '123 Rue des Lilas',
      createdAt: '2024-01-01',
      subscriptionType: 'Basique',
      progress: 75,
      active: true,
      channelCount: 250,
      password: 'pass123'
    },
    {
      id: 2,
      fullname: 'Marie Curie',
      email: 'marie.curie@example.com',
      tel: '0623456789',
      adresse: '456 Avenue des Fleurs',
      createdAt: '2024-01-02',
      subscriptionType: 'Classique',
      progress: 50,
      active: false,
      channelCount: 500,
      password: 'pass456'
    },
    {
      id: 3,
      fullname: 'YCurie',
      email: 'ymarie.curie@example.com',
      tel: '0623456789',
      adresse: '42756 Avenue des Fleurs',
      createdAt: '2024-01-02',
      subscriptionType: 'Basique',
      progress: 5,
      active: true,
      channelCount: 250,
      password: 'pass123'
    },
    {
      id: 4,
      fullname: 'rCurie',
      email: 'rcurie@example.com',
      tel: '0623456789',
      adresse: '5857 tt Fleurs',
      createdAt: '2024-01-02',
      subscriptionType: 'Basique',
      progress: 78,
      active: false,
      channelCount: 250,
      password: 'pass123'
    },
    {
      id: 5,
      fullname: 'oCurie',
      email: 'ddcurie@example.com',
      tel: '0623456789',
      adresse: '7857 Avenue des Fleurs',
      createdAt: '2024-01-02',
      subscriptionType: 'Classique',
      progress: 100,
      active: true,
      channelCount: 500,
      password: 'pass456'
    },
    {
      id: 6,
      fullname: 'Marie',
      email: 'vhcurie@example.com',
      tel: '0623456789',
      adresse: '41858 Avenue des Fleurs',
      createdAt: '2024-01-02',
      subscriptionType: 'Classique',
      progress: 90,
      active: false,
      channelCount: 500,
      password: 'pass456'
    },
  ],
  loading: false,
  error: null,
  expandedId: null,
  expandedMenuId: null,
};

// Create the store
export const SubscriptionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  // Computed values
  withComputed(({ subscriptions }) => ({
    activeSubscriptions: computed(() => 
      subscriptions().filter(sub => sub.active)
    ),
    inactiveSubscriptions: computed(() => 
      subscriptions().filter(sub => !sub.active)
    ),
    totalSubscriptions: computed(() => 
      subscriptions().length
    ),
    getProgressClasses: computed(() => (progress: number) => {
      if (progress === 100) return 'bg-green-500';
      if (progress >= 75) return 'bg-blue-500';
      if (progress >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    }),
    subscriptionDetails: computed(() => {
      return subscriptions().map(sub => {
        const startDate = new Date(sub.createdAt);
        const currentDate = new Date();
        const duration = SUBSCRIPTION_SETTINGS[sub.subscriptionType].duration;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration);
        
        const totalDays = duration;
        const elapsedDays = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, totalDays - elapsedDays);
        
        // Calculate progress as percentage of remaining days
        const progress = Math.max(0, Math.min(100, Math.round((remainingDays / totalDays) * 100)));
        
        return {
          id: sub.id,
          remainingDays,
          progress
        };
      });
    })
  })),

  // CRUD Methods
  withMethods(({ subscriptions, expandedId, expandedMenuId, ...store }) => ({
    // Create
    addSubscription(subscription: Omit<ISubscription, 'id'>) {
      const newId = Math.max(0, ...subscriptions().map(s => s.id)) + 1;
      const newSubscription = { ...subscription, id: newId };
      patchState(store, {
        subscriptions: [...subscriptions(), newSubscription],
        error: null
      });
    },

    // Read (filter by status)
    getSubscriptionsByStatus(active: boolean) {
      return subscriptions().filter(sub => sub.active === active);
    },

    // Update
    updateSubscription(id: number, updates: Partial<ISubscription>) {
      patchState(store, {
        subscriptions: subscriptions().map(sub =>
          sub.id === id ? { ...sub, ...updates } : sub
        ),
        error: null
      });
    },

    // Delete
    deleteSubscription(id: number) {
      patchState(store, {
        subscriptions: subscriptions().filter(sub => sub.id !== id),
        error: null
      });
    },

    // Toggle details
    toggleDetails(id: number) {
      patchState(store, { 
        expandedId: expandedId() === id ? null : id 
      });
    },

    // Toggle menu
    toggleMenu(id: number) {
      patchState(store, { 
        expandedMenuId: expandedMenuId() === id ? null : id 
      });
    },

    // Set loading state
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },

    // Set error state
    setError(error: string) {
      patchState(store, { error });
    },

    // Reset store
    reset() {
      patchState(store, initialState);
    }
  }))
);