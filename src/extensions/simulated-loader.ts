import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import type { TaskFnOptions } from '../core/taskScheduler.js';

import { createProgressEvent } from '../utils/xhr.js';
import { isString, isBlobOrFile, isNumber } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';
import { Status } from '../common/status.js';
import { sleep } from '../utils/sleep.js';
import { log } from '../common/console.js';

export interface SimulatedLoaderOptions {
    /** Action to run to trigger the load operation. Defaults to 'load' */
    actionLoad?: string;

    /** Action to run to abort the load operation. Defaults to 'abort' */
    actionAbort?: string;

    /** Maximum simulated load speed. Defaults to `1024000` */
    bitrate?: number;

    /** Delay in milliseconds between load ticks. Defaults to `250` */
    tickrate?: number;

    /** Delay before starting load. Defaults to `250` */
    connectionDelay?: number;

    /** Total parallel load operations. Defaults to `4` */
    parallel?: number;

    /** Delay until fake error thrown. Defaults to `undefined` */
    errorDelay?: number;

    /** Logs loading state to the developer console. Defaults to `true` */
    log?: boolean;

    /** File to fetch. Defaults to `undefined` */
    fetchFile?: (
        entry: FilePondEntry,
        options: {
            abortController: AbortController;
            onprogress: (e: ProgressEvent) => void;
            onabort: () => void;
        }
    ) => Promise<File>;
}

export const SimulatedLoader = createExtension({
    name: 'SimulatedLoader',
    type: 'loader',
    props: {
        actionLoad: 'load',
        actionAbort: 'abort',
        bitrate: 1024000,
        tickrate: 250,
        connectionDelay: 250,
        errorDelay: undefined,
        parallel: 4,
        log: true,
        fetchFile: undefined,
    } as SimulatedLoaderOptions,
    factory: ({ extensionName, props, didSetProps }, pond) => {
        const {
            setEntryExtensionStatus,
            getEntryExtensionStatus,
            createProgressHandler,
            removeEntries,
            updateEntry,
            pushTask,
            abortTasks,
            on,
        } = pond;

        /** Just a handy shortcut */
        let bytesPerTick: number;

        didSetProps(({ bitrate = 1024000, tickrate = 250 }: SimulatedLoaderOptions) => {
            bytesPerTick = (bitrate / 8) * (tickrate / 1000);
        });

        async function taskUrlToFileQueue(entry: FilePondEntry) {
            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_QUEUED',
            });
        }

        async function taskUrlToInfoSimulation(entry: FilePondFileEntry) {
            const { src, size = 1024 * 1024 } = entry;
            const { log, connectionDelay, errorDelay } = props;

            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            await sleep(connectionDelay);

            if (errorDelay) {
                await sleep(errorDelay);

                const error = 'Simulated error';

                setEntryExtensionStatus(entry, {
                    type: Status.Error,
                    code: 'LOAD_ERROR',
                    values: { error },
                });

                log && logState(['did throw load info error', entry.id]);

                // so scheduler aborts  rest of tasks
                throw error;
            }

            log && logState(['did load info', entry.id]);

            // update entry so we know size, name, and type before the blob is loaded
            updateEntry(entry, {
                name: (src as string).split('/').pop(),
                type: 'plain/text',
                size: size,
            });
        }

        /** Convert entry to a file object */
        async function taskUrlToFileSimulation(
            entry: FilePondFileEntry,
            { abortController }: TaskFnOptions
        ): Promise<void> {
            const { src, size = 1024 * 1024 } = entry;
            const {
                log,
                actionLoad,
                actionAbort,
                tickrate,
                connectionDelay,
                fetchFile,
                errorDelay,
            } = props;

            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            const onprogress = createProgressHandler(entry);

            await sleep(connectionDelay);

            if (errorDelay) {
                await sleep(errorDelay);

                const error = 'Simulated error';

                setEntryExtensionStatus(entry, {
                    type: Status.Error,
                    code: 'LOAD_ERROR',
                    values: { error },
                });

                log && logState(['did throw load data error', entry.id]);

                // so scheduler aborts  rest of tasks
                throw error;
            }

            return await new Promise((resolve) => {
                let bytesLoaded = 0;

                const intervalId = setInterval(async () => {
                    // aborted
                    if (abortController.signal.aborted) {
                        return;
                    }

                    // we calculate total bytes uploaded
                    bytesLoaded = Math.min(size, bytesLoaded + bytesPerTick);

                    // fire a progress event
                    onprogress(createProgressEvent(true, bytesLoaded, size));

                    // done!
                    if (bytesLoaded < size) {
                        return;
                    }

                    // fire a progress event
                    onprogress(createProgressEvent(true, size, size));

                    // stop loading
                    clearInterval(intervalId);

                    // we create a file
                    let file;
                    if (fetchFile) {
                        file = await fetchFile(entry, { abortController, onprogress, onabort });
                    } else {
                        await sleep(0);
                        // @ts-ignore
                        file = new File(['#'.repeat(size)], src.split('/').pop(), {
                            type: 'plain/text',
                        });
                    }

                    // update in one go
                    updateEntry(entry, {
                        file,
                        state: {
                            load: false,
                        },
                        extension: {
                            [extensionName]: {
                                status: {
                                    type: Status.Success,
                                    code: 'LOAD_COMPLETE',
                                },
                            },
                        },
                    });

                    log && logState(['did load data', entry.id]);

                    // @ts-ignore done
                    resolve();
                }, tickrate);

                // can abort
                abortController.signal.onabort = () => {
                    clearInterval(intervalId);

                    log && logState(['did abort load data', entry.id]);

                    updateEntry(entry, {
                        state: {
                            [actionLoad]: false,
                            [actionAbort]: false,
                        },
                    });

                    // we do this in a microtask as removing an entry also aborts all it's tasks and the `aborted` signal state is only set after this function completes
                    queueMicrotask(() => {
                        removeEntries(entry);
                    });
                };
            });
        }

        function handleUpdateEntry(entry: FilePondFileEntry) {
            const status = getEntryExtensionStatus(entry);

            // has current status
            const hasStatus = Object.keys(status).length > 0;

            // is in error state
            const hasFailed = status?.type === 'error';

            // already running tasks or already is blob or file
            if (hasFailed || isBlobOrFile(entry.file)) {
                return;
            }

            // get refs to source
            const { src, name, size } = entry;
            const { actionLoad, actionAbort, parallel } = props;

            // get refs to current state
            const load = entry.state[actionLoad];
            const abort = entry.state[actionAbort];

            // tests if has source, otherwise, no use for simulated loader
            const hasSource = isString(src);

            // no source, let's exit
            if (!hasSource) {
                return;
            }

            // abort loading this item
            if (abort) {
                abortTasks(entry.id);
                removeEntries(entry);
                return;
            }

            // load not requested
            if (load === false) {
                return;
            }

            // this trigger sekeleton animation to get name of file
            const hasFileInfo = isString(name) && isNumber(size);
            if (!hasFileInfo) {
                pushTask(entry.id, taskUrlToInfoSimulation);
                return;
            }

            // queue load itself
            if (!hasStatus) {
                pushTask(entry.id, taskUrlToFileQueue);
                return;
            }

            // let's convert to a File
            pushTask(entry.id, taskUrlToFileSimulation, { parallel });
        }

        function logState(action: string[]) {
            log('⧗', extensionName, '(', ...action, ')');
        }

        // listen for entry updates
        const unsubUpdateEntry = on('updateEntry', handleUpdateEntry);

        return {
            destroy: () => {
                unsubUpdateEntry();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        SimulatedLoader: SimulatedLoaderOptions;
    }
    interface defineFilePondOptions {
        SimulatedLoader: SimulatedLoaderOptions;
    }
}
