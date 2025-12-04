import type { ExtensionManagerAPI } from '../../core/extensionManager.js';
import type { ExtensionAPI, ExtensionInstance, ExtensionOptions } from './createExtension.js';
import type { FilePondEntry, FilePondFileEntry, Progress } from '../../types/index.js';

import { createExtension } from './createExtension.js';
import {
    isBlobOrFile,
    isFile,
    isFileEntry,
    isFunction,
    isNullOrUndefined,
} from '../../utils/test.js';
import { cloneFile, cloneFileWithOptions } from '../../utils/file.js';
import { Status } from '../../common/status.js';

export type TransformFactory = (
    instance: ExtensionOptions,
    api: ExtensionAPI
) => TransformExtensionFunctions;

export interface TransformExtensionFunctions {
    /** Determines if we even can transform this entry */
    canTransformEntry?: (entry: FilePondEntry) => Promise<boolean> | boolean;

    /** Runs before the transformEntry function, useful for loading dependencies */
    prepareTransformEntry?: (
        entry: FilePondFileEntry & { file: File },
        options: { abortController: AbortController; onprogress: (e: Progress) => void }
    ) => Promise<void>;

    /** Transforms the passed FilePond entry */
    transformEntry: (
        entry: FilePondFileEntry & { file: File },
        options: { abortController: AbortController; onprogress: (e: Progress) => void }
    ) =>
        | Promise<{ file: File; history?: any[] } | File | undefined | null>
        | { file: File; history?: any[] }
        | File
        | undefined
        | null;
}

export interface TransformExtensionOptions {
    /** Action to run to trigger this extension, defaults to "transform" */
    actionTransform?: string;

    /** Action to run to trigger file load */
    actionLoad?: string;

    /**
     * Determines if we should transform the entry, if true, the `actionTransfrom` prop is set
     * automatically. When this prop is set the `actionTransform` prop cannot be set to `false` to
     * reset the transform
     */
    shouldTransform?: (entry: FilePondEntry) => Promise<boolean>;

    /** How many transform operations can run in parallel, defaults to `1` */
    parallel?: number;
}

export function createTransformExtension(
    extensionName: string,
    transformProps: TransformExtensionOptions,
    transformFactory: TransformFactory
): (pond: ExtensionManagerAPI) => ExtensionInstance {
    return createExtension(
        extensionName,
        {
            // default action props
            actionTransform: 'transform',
            actionLoad: 'load',
            shouldTransform: undefined,
            parallel: 1,
            filterEntry: (_: FilePondEntry) => true,
            ...transformProps,
        },
        (state, pond) => {
            const { props } = state;

            const {
                on,
                updateEntry,
                pushTask,
                abortTask,
                abortTasks,
                setEntryExtensionStatus,
                getEntryExtensionState,
                setEntryExtensionState,
                createProgressHandler,
            } = pond;

            // get transform functions
            const {
                transformEntry = () => null,
                canTransformEntry = (entry) => isFileEntry(entry) && isBlobOrFile(entry.file),
                prepareTransformEntry = undefined,
            } = transformFactory(state, pond);

            /** Transforms the passed entry */
            async function taskTransform(
                entry: FilePondFileEntry & { file: File },
                { abortController }: { abortController: AbortController }
            ) {
                const { actionTransform, actionLoad, shouldTransform } = props;

                // run before transform
                if (isFunction(prepareTransformEntry)) {
                    setEntryExtensionStatus(entry, {
                        type: Status.System,
                        code: 'TRANSFORM_PREPARE',
                        progress: Infinity,
                    });

                    try {
                        await prepareTransformEntry(entry, {
                            abortController,
                            onprogress: createProgressHandler(entry),
                        });
                    } catch (error) {
                        setEntryExtensionStatus(entry, {
                            type: Status.Error,
                            code: 'TRANSFORM_PREPARE_ERROR',
                            values: { error },
                        });
                        return;
                    }

                    setEntryExtensionStatus(entry, {
                        type: Status.System,
                        code: 'TRANSFORM_PREPARE_COMPLETE',
                    });
                }

                // editing state
                setEntryExtensionStatus(entry, {
                    type: Status.System,
                    code: 'TRANSFORM_BUSY',
                    progress: Infinity,
                });

                // transform entry
                let transformResult;
                try {
                    transformResult = await transformEntry(entry, {
                        abortController,
                        onprogress: createProgressHandler(entry),
                    });
                } catch (error) {
                    setEntryExtensionStatus(entry, {
                        type: Status.Error,
                        code: 'TRANSFORM_ERROR',
                        values: { error },
                    });

                    // don't pass to schedular, as that would block all other tasks, and the transform task can be retried

                    return;
                }

                // pick next transform action state, if auto transformed we should not auto-transform again
                const entryState = {
                    [actionTransform]: isFunction(shouldTransform) ? false : null,
                };

                // no changes made, stop here
                if (!transformResult) {
                    updateEntry(entry, {
                        state: entryState,
                        extension: {
                            [extensionName]: {
                                status: {
                                    type: Status.System,
                                    code: 'TRANSFORM_CANCEL',
                                },
                            },
                        },
                    });
                    return;
                }

                // get transform result content
                let { file: output, history } = isFile(transformResult)
                    ? { file: transformResult }
                    : transformResult;

                // make sure output file always has later date than input file
                if (output.lastModified <= entry.file.lastModified) {
                    output = cloneFileWithOptions(output, {
                        lastModified: output.lastModified + 1,
                    });
                }

                // get input (if already defined)
                const { input } = getEntryExtensionState(entry);

                // now update state in one go
                updateEntry(
                    // current entry
                    entry,

                    // transformed file props
                    {
                        file: output,
                    },

                    // programmatically updated props
                    {
                        // we don't transform again
                        state: {
                            ...entryState,
                            [actionLoad]: null,
                        },

                        // did edit Entry
                        extension: {
                            [extensionName]: {
                                // the input file used
                                input: input ?? (entry as FilePondFileEntry).file,

                                // data for this edit
                                history,

                                // update status
                                status: {
                                    type: Status.System,
                                    code: 'TRANSFORM_COMPLETE',
                                },
                            },
                        },
                    }
                );
            }

            /** Resets all edits back to original file */
            async function taskResetTransform(entry: FilePondEntry) {
                const { actionTransform } = props;
                const { input } = getEntryExtensionState(entry);

                // cancel all remaining tasks
                abortTasks(entry.id);

                // reset entry
                updateEntry(
                    // current entry
                    entry,

                    // reset to original file
                    {
                        file: cloneFile(input),
                    },

                    // reset all changes
                    {
                        state: {
                            [actionTransform]: null,
                        },
                        extension: {
                            [extensionName]: {
                                input: null,
                                history: [],

                                status: {
                                    type: Status.System,
                                    code: 'TRANSFORM_IDLE',
                                },
                            },
                        },
                    }
                );
            }

            /** This runs when the file has changed or when we've not tested yet */
            async function taskShouldTransform(entry: FilePondFileEntry) {
                const { actionTransform, shouldTransform } = props;

                // exit if shouldTransform not defined
                if (!shouldTransform) {
                    return;
                }

                // if we have stored an input file we shouldn't transform again
                const { input } = getEntryExtensionState(entry);
                if (input) {
                    return;
                }

                // file did change, determine if we _should_ activate transform
                const transform = await shouldTransform(entry);

                // trigger transform
                updateEntry(entry, {
                    state: {
                        [actionTransform]: transform,
                    },
                });
            }

            /** This runs when the file has changed or when we've not tested yet */
            async function taskCanTransform(entry: FilePondEntry) {
                const { actionTransform, filterEntry } = props;

                // determine if we _can_ activate the transform logic
                let canTransform = await canTransformEntry(entry);

                // allow customization per
                if (canTransform) {
                    canTransform = await filterEntry(entry);
                }

                // udpate activation status
                setEntryExtensionState(entry, {
                    canTransform,
                    actions: canTransform ? [actionTransform] : [],
                    status: {
                        type: Status.System,
                        code: 'TRANSFORM_IDLE',
                    },
                });
            }

            /** Used to trigger load of a FilePond entry that is stored remotely */
            async function taskLoadEntry(entry: FilePondEntry) {
                const { actionLoad } = props;

                // this will trigger a load of the file source (extension that can do that should be loaded)
                updateEntry(entry, {
                    state: {
                        [actionLoad]: true,
                    },
                });
            }

            async function handleUpdateEntryData(entry: FilePondFileEntry) {
                const { actionTransform, shouldTransform } = props;

                // get quick refs to relevant props
                const { file } = entry;

                // no file no data
                if (!isFile(file)) {
                    return;
                }

                // transform action
                const transform = isNullOrUndefined(entry.state[actionTransform])
                    ? null
                    : entry.state[actionTransform];

                // use canTransform to determine if we're currently awaiting activation testing of this file
                const { canTransform, input } = getEntryExtensionState(entry);

                // we're already awaiting test
                if (canTransform === null) {
                    return;
                }

                // - input exists so we have previously transformed a file
                // - if current file.lastModified is later than input last modified, we need to ignore
                if (input && file.lastModified >= input.lastModified) {
                    return;
                }

                // abort any running tests just to be sure
                abortTask(entry.id, taskCanTransform);

                // this will trigger a new test
                updateEntry(entry, {
                    state: {
                        // when `shouldTransform` is set we don't accept `false` for transform action
                        [actionTransform]:
                            shouldTransform && transform === false ? null : transform,
                    },
                    extension: {
                        [extensionName]: {
                            // the action string that triggers this transform extension
                            actions: canTransform ? [actionTransform] : [],

                            // null means undetermined if we can activate
                            canTransform: null,

                            // reset last transform date
                            input: null,

                            // now idle
                            status: {
                                type: Status.System,
                                code: 'TRANSFORM_LIMBO',
                            },
                        },
                    },
                });
            }

            async function handleUpdateEntry(entry: FilePondFileEntry) {
                const { actionTransform, actionLoad, parallel, shouldTransform } = props;

                // get props to help determine what next step to take
                const { canTransform = null, input } = getEntryExtensionState(entry);
                const transform = entry.state[actionTransform];
                const load = entry.state[actionLoad];
                const doTransform = !isNullOrUndefined(transform) && transform !== false;

                // just idle for now:
                // - we're already running tasks
                // - we've determined we can't transform
                if (canTransform === false) {
                    return;
                }

                // wants to transform
                if (doTransform && load === null && !isFile(entry.file)) {
                    pushTask(entry.id, taskLoadEntry);
                    return;
                }

                // even if activate is true, we don't know if _can_ activate, need to test first
                if (canTransform === null) {
                    pushTask(entry.id, taskCanTransform);
                    return;
                }

                // transform is null
                // - we use shouldTransformEntry (if supplied) to determine if we should run transform operations
                if (transform === null && shouldTransform) {
                    pushTask(entry.id, taskShouldTransform);
                    return;
                }

                // reset entry, only possible if shouldTransform is not used
                const didTransform = !!input;
                if (transform === false && didTransform && !shouldTransform) {
                    pushTask(entry.id, taskResetTransform, { parallel });
                    return;
                }

                // transform is `true`
                // - could be set manually or set by `shouldTransform`
                // - runs transform operation
                if (doTransform && canTransform) {
                    pushTask(entry.id, taskTransform, { parallel });
                    return;
                }
            }

            const unsubUpdateEntryData = on('updateEntryData', handleUpdateEntryData);
            const unsubUpdateEntry = on('updateEntry', handleUpdateEntry);

            return {
                destroy() {
                    unsubUpdateEntry();
                    unsubUpdateEntryData();
                },
            };
        }
    );
}
