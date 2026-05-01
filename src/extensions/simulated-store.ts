import type { FilePondEntry } from '../types/index.js';
import type { StoreExtensionOptions, StoreTaskFnOptions } from './common/createStoreExtension.ts';
import { createStoreExtension } from './common/createStoreExtension.js';
import { isFile, isFileEntry } from '../utils/test.js';
import { getUniqueId } from '../utils/string.js';
import { createProgressEvent } from '../utils/xhr.js';
import { log } from '../common/console.js';
import { sleep } from '../utils/sleep.js';
import { noop } from '../utils/placeholder.js';

export interface SimulatedStoreOptions extends StoreExtensionOptions {
    /** Maximum simulated load speed. Defaults to `1024000` */
    bitrate?: number;

    /** Delay in milliseconds between load ticks. Defaults to `250` */
    tickrate?: number;

    /** Delay in milliseconds before starting load. Defaults to `250` */
    connectionDelay?: number;

    /** Total parallel load operations. Defaults to `4` */
    parallel?: number;

    /** Store hooks so we can throw errors */
    onstore?: (progress: number) => void;

    /** Restore hook so we can throw errors */
    onrestore?: (progress: number) => void;

    /** Release hook so we can throw errors */
    onrelease?: (progress: number) => void;

    /** Fetches an actual stored file to use for demo purposes. */
    fetchStoredFile?: (
        storageId: string,
        entry: FilePondEntry,
        options: {
            abortController: AbortController;
            onprogress: (e: ProgressEvent) => void;
            onabort: () => void;
        }
    ) => Promise<File>;

    /** Logs stored files to the developer console. Defaults to `true` */
    log?: boolean;
}

export const SimulatedStore = createStoreExtension({
    name: 'SimulatedStore',
    props: {
        bitrate: 1024000,
        tickrate: 250,
        connectionDelay: 250,
        fetchStoredFile: undefined,
        log: true,
    } as SimulatedStoreOptions,
    factory: ({ extensionName, props, didSetProps }) => {
        let bytesPerTick: number;

        didSetProps(({ bitrate = 1024000, tickrate = 250 }: SimulatedStoreOptions) => {
            bytesPerTick = (bitrate / 8) * (tickrate / 1000);
        });

        // We "store" our files in this map
        const SimulatedStore = new Map();

        async function storeEntry(
            entry: FilePondEntry,
            { abortController, onprogress, onabort }: StoreTaskFnOptions
        ): Promise<string | undefined> {
            // Needs to be of type File
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            let intervalId: ReturnType<typeof setTimeout>;

            // can abort
            abortController.signal.onabort = () => {
                clearInterval(intervalId);
                onabort();
            };

            const { log, connectionDelay, tickrate, onstore = noop } = props;
            await sleep(connectionDelay);

            // aborted while sleeping
            if (abortController.signal.aborted) {
                return;
            }

            const size = entry.size as number;

            return await new Promise((resolve, reject) => {
                let bytesUploaded = 0;

                intervalId = setInterval(() => {
                    // aborted
                    if (abortController.signal.aborted) {
                        return;
                    }

                    // we calculate total bytes uploaded
                    bytesUploaded = Math.min(size, bytesUploaded + bytesPerTick);

                    // this allows us to throw an error after x amount of bytes
                    try {
                        onstore(bytesUploaded / size);
                    } catch (error) {
                        log && logState(['error during store operation']);
                        clearInterval(intervalId);
                        reject(error);
                        return;
                    }

                    // fire a progress event
                    onprogress(createProgressEvent(true, bytesUploaded, size));

                    // done!
                    if (bytesUploaded === size) {
                        const id = getUniqueId();

                        SimulatedStore.set(id, entry);

                        // log current store state
                        log && logState(['did store', id]);

                        clearInterval(intervalId);
                        resolve(id);
                    }
                }, tickrate);
            });
        }

        async function restoreEntry(
            storageId: string,
            entry: FilePondEntry,
            options: StoreTaskFnOptions
        ) {
            const {
                log,
                connectionDelay,
                fetchStoredFile = () =>
                    new File(['Simulated'], 'Untitled.txt', { type: 'plain/text' }),
                onrestore = noop,
            } = props;

            await sleep(connectionDelay);

            // this allows us to throw an error after x amount of bytes
            try {
                onrestore();
            } catch (error) {
                log && logState(['error during restore operation']);
                throw error;
            }

            // we return the file we stored in our local cache
            if (SimulatedStore.has(storageId)) {
                log && logState(['did restore', storageId]);

                return SimulatedStore.get(storageId);
            }

            // load remote file
            return await fetchStoredFile(storageId, entry, options);
        }

        async function releaseEntry(storageId: string): Promise<boolean> {
            const { log, connectionDelay, onrelease = noop } = props;
            await sleep(connectionDelay);

            // this allows us to throw an error after x amount of bytes
            try {
                onrelease();
            } catch (error) {
                log && logState(['error during release operation']);
                throw error;
            }

            SimulatedStore.delete(storageId);

            // log current store state
            log && logState(['did release', storageId]);

            return true;
        }

        function logState(action: string[]) {
            log('⛃', extensionName, '(', ...action, ')');
            Array.from(SimulatedStore).forEach(([key, value], index, arr) => {
                log(' ', index < arr.length - 1 ? '├─' : '└─', key, value);
            });
        }

        return {
            storeEntry,
            restoreEntry,
            releaseEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        SimulatedStore: SimulatedStoreOptions;
    }
    interface defineFilePondOptions {
        SimulatedStore: SimulatedStoreOptions;
    }
}
