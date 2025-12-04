import { requestIdleCallback } from './poly.js';

/** Asyncify requestIdleCallback */
export function idleCallbackPromise(): Promise<IdleDeadline> {
    return new Promise((resolve) => {
        requestIdleCallback(resolve);
    });
}
