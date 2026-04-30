import type { ExtensionAPI, ExtensionOptions } from './createExtension.js';
import type { FilePondEntry, FilePondFileEntry } from '../../types/index.js';
import type { TaskFnOptions } from '../../core/taskScheduler.js';

import { createExtension } from './createExtension.js';
import { isBlob, isFile, isFileEntry, isNullOrUndefined } from '../../utils/test.js';
import { Status } from '../../common/status.js';
import { debounce } from '../../utils/debounce.js';
import { createPerceivedPerformanceProxy } from '../../common/perceivedPerformanceProxy.js';

export type StoreFactory = (
    instance: ExtensionOptions,
    api: ExtensionAPI
) => StoreExtensionFunctions;

export interface StoreTaskFnOptions extends TaskFnOptions {
    onprogress: (e: ProgressEvent) => void;
    onabort: () => void;
}

export interface StoreExtensionFunctions {
    storeEntry: FunctionStore;
    restoreEntry?: FunctionRestore;
    releaseEntry?: FunctionRelease;
}

export interface StoreExtensionOptions {
    /** If an upload is really fast, will show simulated progress to instill confidence in upload, configure with `PerceivedPerformanceOptions`. By default isn't set, when set to `true` the following settings are used:
    
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

    /** How many of these store operations can run in parallel */
    parallel?: number;

    /** The key to use when setting the storage id */
    valueKey?: string;

    /** Action to run to trigger the store operation, defaults to 'store' */
    actionStore?: string;

    /** Action to run to trigger the load operation, defaults to 'load' */
    actionLoad?: string;

    /** Action to run to trigger the abort operation, defaults to 'abort' */
    actionAbort?: string;

    /**
     * Determines if we should store the entry, if returns true, the `actionStore` prop is set
     * automatically. When this prop is set the `actionStore` prop cannot be set to `false` to
     * reset the store operation
     */
    shouldStore: (entry: FilePondEntry) => Promise<boolean>;
}

export type FunctionStore = (
    entry: FilePondFileEntry,
    options: StoreTaskFnOptions
) => Promise<string | boolean | void>;

export type FunctionRestore = (
    storageId: string,
    entry: FilePondFileEntry,
    options: StoreTaskFnOptions
) => Promise<File | void>;

export type FunctionRelease = (
    storageId: string,
    entry: FilePondFileEntry,
    options?: TaskFnOptions & {
        onabort?: () => void;
    }
) => Promise<boolean | void>;

/** Used to simulate load or store progress, the progress duration will be random between `minDuration` and `maxDuration` the progress step length will be random between `minStep` and `maxStep` */
export interface PerceivedPerformanceOptions {
    /** The minimum duration of the operation in milliseconds */
    minDuration: number;

    /** The maximum duration of the operation in milliseconds  */
    maxDuration: number;

    /** The minimum duration till next step in milliseconds  */
    minStep: number;

    /** The maximum duration till next step in milliseconds  */
    maxStep: number;
}

export function createStoreExtension(
    extensionName: string,
    storeOptions: StoreExtensionOptions,
    storeFactory: StoreFactory
) {
    return createExtension(
        extensionName,
        {
            perceivedPerformance: null,
            parallel: 4,
            actionStore: 'store',
            actionLoad: 'load',
            actionAbort: 'abort',
            valueKey: 'value',
            ...storeOptions,
        },
        (state, pond) => {
            const { props, didSetProps } = state;
            const {
                on,
                setExtensionStatus,
                updateEntry,
                removeEntries,
                pushTask,
                abortTask,
                getEntryExtensionState,
                getEntryExtensionStatus,
                setEntryExtensionStatus,
                createProgressHandler,
            } = pond;

            // is set when updating
            let perceivedPerformanceConfig: PerceivedPerformanceOptions | null = null;

            // called when props are updated
            didSetProps(({ perceivedPerformance }) => {
                // update perceived perf config
                if (perceivedPerformance === true) {
                    // use default config
                    perceivedPerformanceConfig = {
                        minDuration: 1000,
                        maxDuration: 1500,
                        minStep: 50,
                        maxStep: 250,
                    };
                } else if (perceivedPerformance) {
                    // use custom config
                    perceivedPerformanceConfig = perceivedPerformance;
                } else {
                    // no perceived perf
                    perceivedPerformanceConfig = null;
                }
            });

            // gets the store methods
            const { restoreEntry, storeEntry, releaseEntry } = storeFactory(state, pond) ?? {};

            /**
             * Calls custom store function and handles default responses to abort task and update
             * entry state
             */
            async function taskStoreEntry(
                entry: FilePondFileEntry,
                { abortController }: TaskFnOptions
            ) {
                // store file
                setEntryExtensionStatus(entry, {
                    type: Status.System,
                    code: 'STORE_BUSY',
                    progress: Infinity,
                });

                try {
                    const shouldUsePerceivedPerformance =
                        perceivedPerformanceConfig && !document.hidden;

                    // determine if we should use perceived performance
                    const storeFn = shouldUsePerceivedPerformance
                        ? createPerceivedPerformanceProxy(storeEntry, {
                              ...perceivedPerformanceConfig,
                              total: entry.size,
                          })
                        : storeEntry;

                    // start storage process
                    const { actionStore, actionAbort, valueKey } = props;

                    const response = await storeFn(entry, {
                        onprogress: createProgressHandler(entry),
                        onabort: () => {
                            updateEntry(entry, {
                                state: {
                                    // don't abort again
                                    [actionAbort]: false,

                                    // need to halt store action or will keep storing
                                    [actionStore]: null,

                                    // reset storage key
                                    [valueKey]: null,
                                },
                                extension: {
                                    [extensionName]: {
                                        status: {
                                            type: Status.System,
                                            code: 'STORE_ABORT',
                                        },
                                    },
                                },
                            });
                        },
                        abortController,
                    });

                    // update store state with storage key if returned
                    if (!isNullOrUndefined(response)) {
                        updateEntry(entry, {
                            state: {
                                [valueKey]: response,
                            },
                            extension: {
                                [extensionName]: {
                                    status: {
                                        type: Status.Success,
                                        code: 'STORE_COMPLETE',
                                    },
                                },
                            },
                        });
                    }
                } catch (error) {
                    // set error status
                    setEntryExtensionStatus(entry, {
                        type: Status.Error,
                        code: 'STORE_ERROR',
                        values: { error },
                    });

                    // pass to taskScheduler so other tasks are cancelled
                    throw error;
                }
            }

            /** Restores an entry to a File by value */
            async function taskRestoreEntry(
                entry: FilePondFileEntry,
                { abortController }: TaskFnOptions
            ) {
                // can't restore entry without a restore implementation
                if (!restoreEntry) {
                    return;
                }

                setEntryExtensionStatus(entry, {
                    type: Status.System,
                    code: 'RESTORE_BUSY',
                    progress: Infinity,
                });

                // we only need current value to restore
                const { valueKey } = props;
                const value = entry.state[valueKey];

                // try to restore
                try {
                    let response = await restoreEntry(value, entry, {
                        onprogress: createProgressHandler(entry),
                        abortController,
                        onabort: () => {
                            setEntryExtensionStatus(entry, {
                                type: Status.System,
                                code: 'RESTORE_ABORT',
                            });
                        },
                    });

                    // now update state
                    updateEntry(entry, {
                        // if response is a blob we need BlobLoader to load the source
                        src: isBlob(response) ? response : entry.src,

                        // if response is a file we can skip straight to file
                        file: isFile(response) ? response : null,

                        // new state
                        state: {
                            // remember storage key
                            [valueKey]: value,
                        },
                        extension: {
                            [extensionName]: {
                                // need to re-evaluate if we can store this file
                                canStore: true,

                                // done!
                                status: {
                                    type: Status.System,
                                    code: 'RESTORE_COMPLETE',
                                },
                            },
                        },
                    });
                } catch (error) {
                    // set error state
                    setEntryExtensionStatus(entry, {
                        type: Status.Error,
                        code: 'RESTORE_ERROR',
                        values: { error },
                    });

                    // pass to scheduler so other tasks are cancelled
                    throw error;
                }
            }

            /** Restores an entry to a File by value */
            async function taskReleaseEntry(
                entry: FilePondFileEntry,
                { abortController }: TaskFnOptions
            ) {
                const { valueKey, actionLoad, actionStore, shouldStore } = props;

                try {
                    const value = entry.state[valueKey];

                    // not stored yet
                    if (isNullOrUndefined(value)) {
                        return;
                    }

                    // set base state
                    setEntryExtensionStatus(entry, {
                        type: Status.System,
                        code: 'RELEASE_BUSY',
                        progress: Infinity,
                    });

                    // determine if we can release without removing, if shouldStore returns true, we can't release without removing the file as it would automatically be uploaded again
                    let removeOnRelease = false;
                    if (shouldStore) {
                        const shouldRevertStore = entry.state[actionStore] === false;

                        // we should only remove on release when store is set to false (as we can't revert when instant storing)
                        removeOnRelease = (await shouldStore(entry)) && shouldRevertStore;
                    }

                    // we can restore, if not a file, let's restore file before release
                    if (restoreEntry && !isFile(entry.file) && !removeOnRelease) {
                        let response = await restoreEntry(value, entry, {
                            onprogress: createProgressHandler(entry),
                            abortController,
                            onabort: () => {
                                setEntryExtensionStatus(entry, {
                                    type: Status.System,
                                    code: 'RELEASE_ABORT',
                                });
                            },
                        });

                        // we now have the file
                        updateEntry(entry, {
                            file: response,
                        });
                    }

                    // found custom undo function to release entry data
                    if (releaseEntry) {
                        // now release uploaded file from storage
                        const success = await releaseEntry(value, entry, {
                            abortController,
                            onabort: () => {
                                setEntryExtensionStatus(entry, {
                                    type: Status.System,
                                    code: 'RELEASE_ABORT',
                                });
                            },
                        });

                        // didn't fail
                        if (success !== false) {
                            updateEntry(entry, {
                                state: {
                                    [valueKey]: null,
                                    [actionLoad]: null,
                                },
                                extension: {
                                    [extensionName]: {
                                        canStore: true,
                                        status: {
                                            type: Status.System,
                                            code: 'RELEASE_COMPLETE',
                                        },
                                    },
                                },
                            });
                        }
                    } else {
                        // no custom function to release entry data, let's just update state instead
                        updateEntry(entry, {
                            state: {
                                [valueKey]: null,
                                [actionLoad]: null,
                            },
                            extension: {
                                [extensionName]: {
                                    status: {
                                        type: Status.System,
                                        code: 'RELEASE_COMPLETE',
                                    },
                                },
                            },
                        });
                    }

                    // should remove on release
                    if (removeOnRelease) {
                        removeEntries(entry);
                    }
                } catch (error) {
                    // set error state
                    setEntryExtensionStatus(entry, {
                        type: Status.Error,
                        code: 'RELEASE_ERROR',
                        values: { error },
                    });

                    // pass to scheduler so other tasks are cancelled
                    throw error;
                }
            }

            /** Releases an entry on file removal */
            async function handleRemoveEntry(entry: FilePondFileEntry) {
                const { valueKey } = props;

                // TODO: should make this release call configurable (add shouldRelease prop?)
                if (!releaseEntry) {
                    return;
                }

                const value = entry.state[valueKey];
                const couldRelease = !isNullOrUndefined(value);
                const status = getEntryExtensionStatus(entry);
                const canRelease = status?.code !== 'RESTORE_ERROR';

                // can't release as was not restored
                if (!couldRelease || !canRelease) {
                    return;
                }

                // value is set so entry is stored, let's release
                try {
                    await releaseEntry(value, entry);
                } catch (error) {
                    // TODO: something went wrong when removing the file, there's not a lot we can do about it now?
                }
            }

            /** Runs when file data has changed (or when it's first received) */
            async function handleUpdateEntryData(entry: FilePondEntry) {
                // get entry state props to determine if we should load/save entry
                const status = getEntryExtensionStatus(entry);
                const { valueKey, actionStore, actionLoad, actionAbort } = props;

                const value = entry.state[valueKey] ?? null;
                const store = isNullOrUndefined(entry.state[actionStore])
                    ? null
                    : entry.state[actionStore];

                // we don't have a value, so now we need to determine if we can store this file
                if (isNullOrUndefined(value)) {
                    // is new file, let's set initial state
                    updateEntry(entry, {
                        state: {
                            [valueKey]: value,
                            [actionStore]: store,
                        },
                        extension: {
                            [extensionName]: {
                                // so we can match on extension actions
                                actions: [actionStore, actionLoad, actionAbort],

                                // null means undetermined if we can activate, will trigger new test
                                canStore: null,

                                // awaiting new test
                                status: {
                                    type: Status.System,
                                    code: 'STORE_LIMBO',
                                },
                            },
                        },
                    });

                    return;
                }

                // we have a value, so now we need to determine if the current file (that trigger this updated) is the stored file

                // we just restored this file as the RESTORE_COMPLETE state is set and the file object was updated
                // 1. this means we have a value, or we could not have restored the file
                // 2. the value is still set because it's still relevant
                if (status.code === 'RESTORE_COMPLETE') {
                    return;
                }

                // 1. we updated the file data but the current storage state is COMPLETE
                // 2. meaning the previous file was uploaded,
                // 3. meaning we need to release the previous file
                if (store !== false && status.code === 'STORE_COMPLETE') {
                    pushTask(entry.id, taskReleaseEntry);

                    setEntryExtensionStatus(entry, {
                        type: Status.System,
                        code: 'STORE_IDLE',
                    });
                    return;
                }

                // mark as a stored file
                updateEntry(entry, {
                    state: {
                        [valueKey]: value,
                        [actionStore]: store,
                    },
                    extension: {
                        [extensionName]: {
                            canStore: true,
                            status: {
                                type: Status.Success,
                                code: 'STORE_COMPLETE',
                            },
                        },
                    },
                });
            }

            /** Tests if this entry is stored */
            async function taskIsStored(entry: FilePondEntry) {
                // get entry state props to determine if we should load/save entry
                const { valueKey } = props;

                const value = entry.state[valueKey];
                const { canStore } = getEntryExtensionState(entry);

                // not stored, we done
                if (!value) {
                    return;
                }

                // we can store this file, so we will eventually land in taskStore
                if (canStore) {
                    return;
                }

                // so we can't store this file, but it could already be stored, so at this point we should assume it's stored and set STORE_COMPLETE
                setEntryExtensionStatus(entry, {
                    type: Status.Success,
                    code: 'STORE_COMPLETE',
                });
            }

            /** Tests if this entry can be stored */
            async function taskCanStore(entry: FilePondEntry) {
                // this task won't run if an earlier task has thrown error (for example validation), so IDLE state will only be reached when all is fine
                const { valueKey } = props;

                // so we can prepare entry state, if `valueKey` is set, we know a store extension will store this file
                const value = entry.state[valueKey];

                // determine if we _can_ _in theory_ activate the store logic
                const canStore = isFileEntry(entry) && isFile(entry.file);

                // udpate store activation status
                updateEntry(entry, {
                    state: {
                        [valueKey]: value ?? null,
                    },
                    extension: {
                        [extensionName]: {
                            canStore,
                            status: {
                                type: Status.System,
                                code: canStore ? 'STORE_READY' : 'STORE_IDLE',
                            },
                        },
                    },
                });
            }

            /** Tests if should instantly store entry */
            async function taskShouldStore(entry: FilePondEntry) {
                const { actionStore, shouldStore } = props;

                if (!shouldStore) {
                    return;
                }

                const store = await shouldStore(entry);

                // trigger store
                updateEntry(entry, {
                    state: {
                        [actionStore]: store,
                    },
                });
            }

            /** Marks the entry as queued */
            async function taskQueueEntry(entry: FilePondEntry) {
                setEntryExtensionStatus(entry, {
                    code: 'STORE_QUEUED',
                    type: Status.System,
                    progress: Infinity,
                });
            }

            /** Runs on each entry update and determines which tasks to queue */
            async function handleUpdateEntry(entry: FilePondEntry) {
                // get entry state props to determine if we should load/save entry
                const { valueKey, parallel, actionLoad, actionStore, actionAbort, shouldStore } =
                    props;
                const store = entry.state[actionStore];
                const load = entry.state[actionLoad];
                const abort = entry.state[actionAbort];

                // get extension entry props to help determine what next step to take
                const value = entry.state[valueKey];
                const status = getEntryExtensionStatus(entry);
                const { canStore = null } = getEntryExtensionState(entry); // canStore is true if is file, if hasn't defined extension object yet, it defaults to null which triggers a test
                const hasStored = !isNullOrUndefined(value);

                // not sure if we can store this file, let's test it
                if (canStore === null) {
                    pushTask(entry.id, taskCanStore);
                    return;
                }

                // `store` is null
                // - we use shouldStore (if supplied) to determine if we should run store operations
                if (store === null && shouldStore) {
                    // did abort a previous store operation
                    if (abort === false) {
                        removeEntries(entry);
                        return;
                    }

                    // test if we should store
                    pushTask(entry.id, taskShouldStore);
                    return;
                }

                // we have a value and we're not a file, means we previously stored this item and could restore it from the server
                const canRestore = !isNullOrUndefined(restoreEntry);
                const couldRestore =
                    hasStored && !isFile((entry as FilePondFileEntry).file) && canRestore;
                const shouldRestore = load === true;
                if (couldRestore && shouldRestore) {
                    pushTask(entry.id, taskRestoreEntry, { parallel });
                    return;
                }

                // we have a storage id so this entry is stored and could be released
                const couldRelease = hasStored;
                const shouldRelease = store === false;
                if (couldRelease && shouldRelease) {
                    // can do infinite release calls as they're really quick
                    pushTask(entry.id, taskReleaseEntry);
                    return;
                }

                // if we've determined we can't store this entry, we can exit here
                if (canStore === false) {
                    // if the file data is updated we re-evaluate `canStore` via `handleUpdateEntryData`
                    pushTask(entry.id, taskIsStored);
                    return;
                }

                // we don't have a storage id but shouldRelease
                const couldAbort = !hasStored && canStore;
                const isStoring = status?.code === 'STORE_BUSY';
                const shouldAbort = store === true && abort === true;
                if (couldAbort && shouldAbort) {
                    abortTask(entry.id, taskStoreEntry);
                    if (!isStoring) {
                        updateEntry(entry, {
                            state: {
                                [actionAbort]: false,
                                [actionStore]: null,
                            },
                            extension: {
                                [extensionName]: {
                                    status: {
                                        type: Status.System,
                                        code: 'STORE_READY',
                                    },
                                },
                            },
                        });
                    }
                    return;
                }

                // queue first
                const hasQueued = status?.code === 'STORE_QUEUED';
                const hasError = status?.code === 'STORE_ERROR';
                if (
                    !hasStored &&
                    !hasQueued &&
                    !hasError &&
                    !isStoring &&
                    store === true &&
                    canStore
                ) {
                    pushTask(entry.id, taskQueueEntry);
                    return;
                }

                // if already stored it's possible that it's stored partially, so we can ask the store to store again
                if (!hasStored && !isStoring && store === true && canStore) {
                    pushTask(entry.id, taskStoreEntry, {
                        parallel,
                    });
                    return;
                }
            }

            /** Tests if all entries have been stored */
            function handleUpdateEntries(entries: FilePondEntry[]) {
                // get valueKey so we can auto detect
                const { valueKey } = props;
                if (!valueKey) {
                    return;
                }

                // loop over entries and find if all entries stored
                for (const entry of entries) {
                    // is stored
                    if (!isNullOrUndefined(entry.state[valueKey])) {
                        continue;
                    }

                    // no storage key yet, all relevant items must be stored
                    return setExtensionStatus({
                        type: Status.Error,
                        code: 'STORE_AWAITING_COMPLETION',
                        meta: { flag: 'customError' },
                    });
                }

                // all good!
                setExtensionStatus({
                    type: Status.System,
                    code: 'VALIDATION_COMPLETE',
                });
            }

            const unsubUpdateEntryData = on('updateEntryData', handleUpdateEntryData);
            const unsubUpdate = on('updateEntry', handleUpdateEntry);
            const unsubRemove = on('removeEntry', handleRemoveEntry);
            const unsubUpdateEntries = on('updateEntries', debounce(handleUpdateEntries));

            return {
                destroy() {
                    unsubUpdateEntryData();
                    unsubUpdate();
                    unsubUpdateEntries();
                    unsubRemove();
                },
            };
        }
    );
}
