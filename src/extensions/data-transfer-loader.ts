import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import type { PerceivedPerformanceOptions } from './common/createStoreExtension.ts';

import { createExtension } from './common/createExtension.js';
import { didAbort } from '../utils/abort.js';
import { isDataTransfer, isDirectoryEntry, isFileEntry } from '../utils/test.js';
import { Status } from '../common/status.js';
import {
    dataTransferToFiles,
    readEntriesFromDataTransfer,
    shouldLoadWithIdleCallback,
} from '../common/readEntriesFromDataTransfer.js';
import { flattenTree } from '../utils/tree.js';
import { createPerceivedPerformanceProxy } from '../common/perceivedPerformanceProxy.js';

export interface DataTransferLoaderOptions {
    /** Should we show the progress indicator for a minimum amount of time, configure with `PerceivedPerformanceOptions`. By default isn't set, when set to `true` the following settings are used:
    
    ```js
    {
        minDuration: 500,
        maxDuration: 750,
        minStep: 50,
        maxStep: 150
    }
    ```
    */
    perceivedPerformance?: boolean | PerceivedPerformanceOptions;

    /** Action to run to trigger the load operation, defaults to `'load'` */
    actionLoad?: string;

    /** Action to run to trigger the abort operation, defaults to `'abort'` */
    actionAbort?: string;

    /**
     * How we deal with directory structures, defaults to `'flatten'`. Currently doesn't support other values.
     */
    mode: 'flatten';
}

export const DataTransferLoader = createExtension({
    name: 'DataTransferLoader',
    type: 'loader',
    props: {
        actionLoad: 'load',
        actionAbort: 'abort',
        mode: 'flatten',
    } as DataTransferLoaderOptions,
    factory: (state, pond) => {
        const { props, didSetProps } = state;

        const {
            on,
            removeEntries,
            replaceEntry,
            pushTask,
            abortTasks,
            setEntryExtensionStatus,
            getEntryExtensionStatus,
        } = pond;

        // is set when updating props
        let perceivedPerformanceConfig: PerceivedPerformanceOptions | null = null;

        // called when props are updated
        didSetProps(({ perceivedPerformance }: DataTransferLoaderOptions) => {
            // update perceived perf config
            if (perceivedPerformance === true) {
                // use default config
                perceivedPerformanceConfig = {
                    minDuration: 500,
                    maxDuration: 750,
                    minStep: 50,
                    maxStep: 150,
                };
            } else if (perceivedPerformance) {
                // use custom config
                perceivedPerformanceConfig = perceivedPerformance;
            } else {
                // no perceived perf
                perceivedPerformanceConfig = null;
            }
        });

        /** Converts a DataTransfer to separate entries */
        async function taskConvertDataTransferToEntries(
            entry: FilePondFileEntry,
            { signal }: { signal: AbortSignal }
        ) {
            const { mode } = props;

            // now busy loading
            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            let entries;
            try {
                if (shouldLoadWithIdleCallback(entry.src as DataTransfer)) {
                    const shouldUsePerceivedPerformance =
                        perceivedPerformanceConfig && !document.hidden;

                    // determine if we should use perceived performance
                    const readEntries = shouldUsePerceivedPerformance
                        ? createPerceivedPerformanceProxy(readEntriesFromDataTransfer, {
                              ...perceivedPerformanceConfig,
                          })
                        : readEntriesFromDataTransfer;

                    // @ts-ignore
                    const rawEntries = await readEntries(entry.src, {
                        signal,
                        onprogress: ({ loaded, total }) => {
                            setEntryExtensionStatus(entry, {
                                type: Status.System,
                                code: 'LOAD_BUSY',
                                progress: loaded / total,
                                values: {
                                    processed: loaded,
                                    total: total,
                                },
                            });
                        },
                    });

                    // flatten folder
                    if (mode === 'flatten') {
                        entries = flattenTree(rawEntries, 'entries')
                            .filter((rawEntry) => !isDirectoryEntry(rawEntry))
                            .map((rawEntry) => {
                                return {
                                    src: rawEntry,
                                    origin: entry.origin,
                                    containerId: entry.id,
                                };
                            });
                    }
                } else {
                    entries = (await dataTransferToFiles(entry.src as DataTransfer)).map(
                        (file) => ({
                            src: file,
                            origin: entry.origin,
                            containerId: entry.id,
                        })
                    );
                }
            } catch (error) {
                if (didAbort(signal, error)) {
                    removeEntries(entry);
                    return;
                }

                setEntryExtensionStatus(entry, {
                    type: Status.Error,
                    code: 'LOAD_ERROR',
                    values: { error },
                });

                // so scheduler aborts  rest of tasks
                throw error;
            }

            // done!
            setEntryExtensionStatus(entry, {
                type: Status.Success,
                code: 'LOAD_COMPLETE',
            });

            // @ts-ignore replace data transfer entry with a list of entries
            replaceEntry(entry, entries);
        }

        function handleUpdateEntry(entry: FilePondEntry) {
            // get extension entry props to help determine what next step to take
            const status = getEntryExtensionStatus(entry);

            // is in error state
            const hasFailed = status?.type === 'error';

            // already running tasks or can't convert to file
            if (hasFailed || !isFileEntry(entry) || !isDataTransfer(entry.src)) {
                return;
            }

            // get refs to source
            const { actionAbort } = props;

            // get refs to current state
            const abort = entry.state[actionAbort];

            // abort loading this item
            if (abort) {
                abortTasks(entry.id);
                return;
            }

            // expand directory
            pushTask(entry.id, taskConvertDataTransferToEntries);
        }

        // when an entry is updated we check if it's a Blob, if so we queue our Blob to File task, else we ignore
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
        DataTransferLoader: DataTransferLoaderOptions;
    }
    interface DefineFilePondOptions {
        DataTransferLoader?: DataTransferLoaderOptions;
    }
}
