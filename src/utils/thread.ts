import functionToBlob from './functionToBlob.js';
import { arrayRemoveInPlace } from './array.js';
import { requestIdleCallback } from './poly.js';
import { createObjectURL } from './objectURL.js';

const wrapFunction = (fn: Function | string) => `function () {
    self.onmessage = function (message) {
        (${fn.toString()}).apply(
            null, 
            message.data.concat([
                function (err, response, transferList = []) {
                    const message = { content: response, error: err };
                    return self.postMessage(message, transferList);
                },
                {
                    onprogress: function({ lengthComputable, loaded, total }) {
                        self.postMessage({ type: 'progress', content: { lengthComputable, loaded, total }, error: null })
                    }
                }
            ])
        )
    }
}`;

interface PooledWorker {
    busy: boolean;
    fnStr: string;
    url: string;
    worker: Worker;
    terminationTimeout: ReturnType<typeof setTimeout> | undefined;
    terminate: () => void;
}

interface Task {
    fn: Function | string;
    fnStr?: string;
    args: any[];
    options: ThreadOptions;
    promise: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void };
}

interface ThreadOptions {
    abortController?: AbortController;
    transferList?: Transferable[];
    onabort?: () => void;
    onprogress?: (e: ProgressEvent) => void;
}

// this holds all active workers
const workerPool: PooledWorker[] = [];

// this holds queueud tasks for when all threads are occupied
const taskQueue: Task[] = [];

// time till a idle worker is automatically terminated instead of re-used
const WORKER_TERMINATION_TIMEOUT = 5000;

/** Run this function in a thread */
export function thread(fn: Function | string, args: any[], options: ThreadOptions = {}) {
    return new Promise((resolve, reject) => {
        // get maximum workers
        const MAX_WORKERS = navigator.hardwareConcurrency;

        // this helps with queueing
        const runTask = ({ fn, args, options, promise }: Task) => {
            const {
                abortController = new AbortController(),
                transferList = [],
                onabort,
                onprogress,
            } = options;

            // find available worker (if worker is busy, create new worker, else has to wait for thread)
            const fnStr = fn.toString();
            let pooledWorker = workerPool.find((worker) => worker.fnStr === fnStr && !worker.busy);

            // none found, let's create one
            if (!pooledWorker) {
                // if none found and all worker spots are taken up by busy workers we wait for a spot to free up
                if (workerPool.filter((worker) => !worker.busy).length >= MAX_WORKERS) {
                    // need to queue tasks for when workers become available
                    const task: Task = {
                        fn,
                        fnStr,
                        args,
                        options,
                        promise: { resolve, reject },
                    };

                    // add to queue
                    taskQueue.push(task);

                    // if aborter earlier, remove task from queue
                    abortController.signal.onabort = () => {
                        arrayRemoveInPlace(taskQueue, (queuedTask: Task) => queuedTask === task);

                        if (onabort) {
                            onabort();
                        }
                    };

                    // now we wait
                    return;
                }

                // create worker for this function
                const workerFn = wrapFunction(fn);

                // create a new Web Worker
                const url = createObjectURL(functionToBlob(workerFn));
                const worker = new window.Worker(url);

                // create a pooled worker, this object will contain the worker and active messages
                pooledWorker = {
                    busy: false,
                    fnStr,
                    url,
                    worker,
                    terminationTimeout: undefined,
                    terminate: () => {
                        // no need to handle idle termination
                        clearTimeout((pooledWorker as PooledWorker).terminationTimeout);
                        (pooledWorker as PooledWorker).worker.terminate();

                        // free memory
                        URL.revokeObjectURL(url);

                        // remove from pool
                        arrayRemoveInPlace(
                            workerPool,
                            (worker: PooledWorker) => worker === pooledWorker
                        );

                        // run next queued task
                        if (!taskQueue.length) {
                            return;
                        }

                        runTask(taskQueue.shift() as Task);
                    },
                };

                // remove an idling worker from pool to make room for new worker
                const idleWorker = workerPool.find((worker) => worker.busy === false);
                idleWorker?.terminate();

                // add worker to pool so we can use it later
                workerPool.push(pooledWorker as PooledWorker);
            }

            // now in use
            pooledWorker.busy = true;
            clearTimeout(pooledWorker.terminationTimeout);

            // handle received messages
            pooledWorker.worker.onmessage = function (e) {
                const { type, content, error } = e.data;

                // route progress event
                if (type === 'progress') {
                    return onprogress && onprogress(content);
                }

                // automatically clean up idle workers after a certain time
                clearTimeout(pooledWorker.terminationTimeout);
                pooledWorker.terminationTimeout = setTimeout(() => {
                    pooledWorker.terminate();
                }, WORKER_TERMINATION_TIMEOUT);

                // resolve or reject message based on response from worker
                error ? promise.reject(error) : promise.resolve(content);

                // no longer busy
                pooledWorker.busy = false;

                // no similar tasks in queue
                const similarTasks = taskQueue.filter((task) => task.fnStr === pooledWorker.fnStr);
                if (!similarTasks.length) {
                    return;
                }

                // get next similar task
                const nextTask = similarTasks.shift() as Task;

                // remove from queue
                arrayRemoveInPlace(taskQueue, (task: Task) => task.fn === nextTask.fn);

                // run the similar task
                requestIdleCallback(() => {
                    runTask(nextTask);
                });
            };

            // post message and wait for response
            pooledWorker.worker.postMessage(args, transferList);

            // set up abort handler
            if (abortController) {
                abortController.signal.onabort = () => {
                    pooledWorker.terminate();

                    if (onabort) {
                        onabort();
                    }
                };
            }
        };

        // try for first time
        runTask({ fn, args, options, promise: { resolve, reject } });
    });
}
