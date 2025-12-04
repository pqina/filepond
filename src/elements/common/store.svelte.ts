import { isFunction } from '../../utils/test.js';

export function gate(shouldUpdate: any, initialValueOrUpdater: any) {
    let store = $state.raw();

    if (isFunction(initialValueOrUpdater)) {
        $effect(() => {
            const value = initialValueOrUpdater();
            if (!shouldUpdate(store, value)) {
                return;
            }
            store = value;
        });
    } else {
        store = initialValueOrUpdater;
    }

    return {
        set current(value) {
            if (store === undefined) {
                store = value;
                return;
            }

            if (!shouldUpdate(store, value)) {
                return;
            }

            store = value;
        },
        get current() {
            return store;
        },
    };
}
