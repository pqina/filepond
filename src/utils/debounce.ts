import { noop } from './placeholder.js';

export function debounce(
    fn: (...args: any[]) => void,
    options?: {
        timeout?: number;
        beforeDebounce?: (...args: any[]) => unknown;
        runLast?: boolean;
    }
) {
    const { timeout = 16, beforeDebounce = noop, runLast = true } = options ?? {};

    let previousTimestamp: number;

    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: unknown[]) => {
        // should run always
        beforeDebounce(...args);

        // clear queueud last call
        clearTimeout(timeoutId);

        // what time is it now?
        const now = Date.now();

        // skip if too soon
        if (previousTimestamp && now - previousTimestamp < timeout) {
            // queue so we always call the last run of the debounced function (unless cancelled by a new run)
            if (runLast) {
                timeoutId = setTimeout(() => {
                    // so we can calculate dist with next run
                    previousTimestamp = Date.now();

                    fn(...args);
                }, now - previousTimestamp);
            }
            return;
        }

        // so we can calculate dist with next run
        previousTimestamp = now;

        // call function with passed args
        fn(...args);
    };
}
