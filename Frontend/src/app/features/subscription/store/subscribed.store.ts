import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
export interface CounterState {
    count: number;
}

const initialCounterState: CounterState = {
    count: 0
}

export const CounterStore = signalStore(
    withState(initialCounterState),
    withMethods(({ count, ...store }) => ({
        increment() {
            patchState(store, { count: count() + 1 });
        },
        decrement() {
            patchState(store, { count: count() - 1 });
        },
        reset() {
            patchState(store, { count: 0 });
        },
    }))
);