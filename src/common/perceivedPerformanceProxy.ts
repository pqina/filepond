import type { FilePondEntry, Progress } from '../types/index.js';
import { randomNumberBetween } from '../utils/math.js';

function createPerceivedPerformanceProcess(
    onprogress: (e: Progress) => void,
    abortController: AbortController,
    config: { minDuration: number; maxDuration: number; minStep: number; maxStep: number }
): Promise<void> {
    return new Promise((resolve) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        let duration = randomNumberBetween(config.minDuration, config.maxDuration);
        const start = Date.now();
        const lengthComputable = true;
        const total = 1;
        let loaded = 0;

        abortController.signal.onabort = () => {
            clearTimeout(timeoutId);
        };

        onprogress({ lengthComputable, loaded, total });

        const tick = () => {
            if (abortController.signal.aborted) {
                return;
            }

            const runtime = Date.now() - start;

            // random timeout till next tick
            let delay = randomNumberBetween(config.minStep, config.maxStep);

            // make sure delay doesn't cause max duration to exceed
            if (runtime + delay > duration) {
                delay = runtime + delay - duration;
            }

            // current progress
            loaded = (runtime / duration) * total;
            onprogress({
                lengthComputable,
                loaded: Math.min(loaded, total),
                total,
            });

            // done!
            if (loaded >= total) {
                return resolve();
            }

            // wait till next tick
            timeoutId = setTimeout(tick, delay);
        };

        // start
        tick();
    });
}

/**
 * Simulate progress, we'll look at progress from actual upload and compare to simulated progress, we'll use the lower progress value
 */
export function createPerceivedPerformanceProxy(fn: any, options: any) {
    // this is a simulated progress operation

    // this creates a store that automatically shows perceived performance or normal storage operation
    return async function (
        entry: FilePondEntry,
        {
            onprogress,
            onabort,
            abortController,
        }: {
            onprogress: (e: Progress) => void;
            onabort: () => void;
            abortController: AbortController;
        }
    ) {
        // used to cancel perceived performance store operations
        const perceivedPerformanceAbortController = new AbortController();

        // tracks progress of both stores
        let perceivedProgress: Progress;
        let actualProgress: Progress;

        // handles progress updates
        function handleProgressUpdate() {
            if (!actualProgress || !perceivedProgress) {
                return;
            }

            // so we can more easily compare both progress values
            const perceivedProgressFraction = perceivedProgress.loaded / perceivedProgress.total;
            const actualProgressFraction = actualProgress.loaded / actualProgress.total;

            // use smaller progress value
            if (perceivedProgressFraction < actualProgressFraction) {
                return onprogress({ ...perceivedProgress, lengthComputable: true });
            }

            onprogress(actualProgress);
        }

        // start perceived progress
        const perceivedPromise = createPerceivedPerformanceProcess(
            (progress) => {
                const total = options?.total || actualProgress?.total || 100;

                perceivedProgress = {
                    lengthComputable: true,
                    loaded: Math.round(progress.loaded * total),
                    total,
                };

                handleProgressUpdate();
            },

            // if we abort we abort simulation as well
            perceivedPerformanceAbortController,

            options
        );

        // start actual storage
        const actualPromise = fn(entry, {
            onprogress: (progress: Progress) => {
                actualProgress = progress;

                handleProgressUpdate();
            },
            onabort: () => {
                // need to call perceivedPerformancePromise abortController to cancel perceived performance updates
                perceivedPerformanceAbortController.abort();

                // run actual handle abort logic
                onabort();
            },
            abortController,
        });

        return new Promise((resolve, reject) => {
            // only interested in actual process return value
            Promise.all([actualPromise, perceivedPromise])
                .then((res) => {
                    // we're only interested in the actual value
                    resolve(res[0]);
                })
                .catch((err) => {
                    // when the actual upload failes, abort the perceived performance updater
                    perceivedPerformanceAbortController.abort();

                    // pass to scheduler
                    reject(err);
                });
        });
    };
}
