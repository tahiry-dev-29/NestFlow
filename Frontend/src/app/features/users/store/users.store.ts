import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

export interface IUsers {
  id: number;
  fullname: string;
  email: string;
  status: 'active' | 'inactive';
  image: string;
  password: string;
}

export interface UserState {
  users: IUsers[];
  loading: boolean;
  error: string | null;
}

const getInitialState = (): UserState => {
  const storedState = localStorage.getItem('UserState');
  if (storedState) {
    return JSON.parse(storedState);
  }
  return {
    users: [],
    loading: false,
    error: null,
  };
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ users }) => ({
    activeUsers: computed(() => users().filter((user) => user.status === 'active')),
    inactiveUsers: computed(() => users().filter((user) => user.status === 'inactive')),
    filteredUsers: computed(() => (search: string | null) => {
      if (!search) return users();
      const lowerSearch = search.toLowerCase();
      return users().filter(
        (user) =>
          user.fullname.toLowerCase().includes(lowerSearch) ||
          user.email.toLowerCase().includes(lowerSearch)
      );
    }),
    totalUsers: computed(() => users().length),
    userStatusClass: computed(() => (status: 'active' | 'inactive') => 
      status === 'active' ? 'online' : 'offline'
    ),
  })),
  withMethods((store) => ({
    getUserById(id: number): IUsers | null {
      return store.users().find((user) => user.id === id) || null;
    },
    addUser(user: Omit<IUsers, 'id'>): void {
      const newId = Math.max(0, ...store.users().map((u) => u.id)) + 1;
      const newUser: IUsers = { ...user, id: newId };
      patchState(store, { users: [...store.users(), newUser] });
      this.saveToLocalStorage();
    },
    updateUser(id: number, updates: Partial<IUsers>): void {
      const user = this.getUserById(id);
      if (user) {
        const newUsers = store.users().map((u) => (u.id === id ? { ...u, ...updates } : u));
        patchState(store, { users: newUsers });
        this.saveToLocalStorage();
      }
      else {
        console.error(`User with id ${id} not found`);
      }
    },
    deleteUser(id: number): void {
      patchState(store, {
        users: store.users().filter((user) => user.id !== id),
      });
      this.saveToLocalStorage();
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { loading: isLoading });
    },
    setError(error: string | null): void {
      patchState(store, { error });
    },
    resetError(): void {
      patchState(store, { error: null });
    },
    saveToLocalStorage(): void {
      localStorage.setItem('UserState', JSON.stringify({
        users: store.users(),
        loading: store.loading(),
        error: store.error(),
      }));
    },
  }))
);