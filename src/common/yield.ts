import { sleep } from '../utils/sleep.js';
import { supportsYieldScheduler } from '../utils/support.js';

const yieldSchedulerSupported = async function yieldScheduler() {
    return await scheduler.yield();
};

const yieldSchedulerFallback = async function yieldScheduler() {
    return await sleep(0);
};

export const yieldScheduler = supportsYieldScheduler()
    ? yieldSchedulerSupported
    : yieldSchedulerFallback;
