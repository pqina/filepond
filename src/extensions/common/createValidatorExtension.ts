import { createExtension } from './createExtension.js';
import { isBlobOrFile, isFile, isFileEntry } from '../../utils/test.js';
import { Status } from '../../common/status.js';
import { debounce } from '../../utils/debounce.js';
import { upperCaseFirstLetter } from '../../utils/string.js';

import type { Extension, ExtensionAPI, ExtensionOptions } from './createExtension.js';
import type { FilePondEntry } from '../../types/index.js';

export type ValidatorFactory = (
    instance: ExtensionOptions,
    api: ExtensionAPI
) => ValidatorExtensionFunctions;

export interface ValidationResultInvalid {
    code: string;
    values?: { [key: string]: any } | null;
}

export interface ValidatorExtensionOptions {
    /**
     * Determines if we should validate the entry, if returns `false`, the entry is skipped
     */
    shouldValidate?: (entry: FilePondEntry) => Promise<boolean>;
}

export interface ValidatorExtensionFunctions {
    /** Returns `true` when can run validation logic on this entry */
    canValidateEntry?: (entry: FilePondEntry) => Promise<boolean> | boolean;

    /** Returns `string` when error state, returns `null` when all is fine */
    validateEntry: (
        entry: FilePondEntry
    ) => Promise<null | ValidationResultInvalid> | (null | ValidationResultInvalid);
}

export interface CreateValidatorExtensionOptions {
    name: string;
    props: ValidatorExtensionOptions;
    factory: ValidatorFactory;
}

export function createValidatorExtension(options: CreateValidatorExtensionOptions): Extension {
    const { name: extensionName, props: validatorProps, factory: validatorFactory } = options;

    return createExtension({
        name: extensionName,
        type: 'validator',
        props: validatorProps,
        factory: (state, pond) => {
            const { didSetProps, props } = state;

            const {
                setExtensionStatus,
                getEntries,
                on,
                pushTask,
                abortTask,
                setEntryExtensionStatus,
                getEntryExtensionStatus,
                setEntryExtensionState,
                getEntryExtensionState,
            } = pond;

            const {
                // by default can only validate a blob/file
                canValidateEntry = (entry) => isFileEntry(entry) && isBlobOrFile(entry.file),

                // by default all validate entry returns "all is well" state
                validateEntry = () => null,
            } = validatorFactory(state, pond);

            // should reset validation state when props are updated
            didSetProps(() => {
                resetValidation();
            });

            /** Reset all validation entry states */
            function resetValidation() {
                for (const entry of getEntries()) {
                    resetEntryValidationState(entry);
                }
            }

            function resetEntryValidationState(entry: FilePondEntry) {
                const { canValidate } = getEntryExtensionState(entry);

                // we're already awaiting a test, no need to reset
                if (canValidate === null) {
                    return;
                }

                // reset
                setEntryExtensionState(entry, {
                    // null means it's undetermined if we can validate, need to retest
                    canValidate: null,

                    // null means it's undetermined if we should validate, need to retest
                    shouldValidate: null,

                    // reset status
                    status: {
                        type: Status.System,
                        code: 'VALIDATION_LIMBO',
                        values: null,
                        meta: null,
                    },
                });
            }

            /** Validates the passed entry */
            async function taskValidate(entry: FilePondEntry): Promise<false | void> {
                setEntryExtensionStatus(entry, {
                    type: Status.System,
                    code: 'VALIDATION_BUSY',
                    progress: Infinity,
                });

                // get test result
                let validationResults;
                try {
                    validationResults = await validateEntry(entry);
                } catch (error) {
                    // failed to validate file
                    setEntryExtensionStatus(entry, {
                        type: Status.Error,
                        code: 'VALIDATION_ERROR',
                        values: { error },
                    });

                    // let scheduler know so we don't continue with next tasks
                    throw error;
                }

                // we add the file type so we can use it in our labels (for example "Image width is invalid" instead of "File width is invalid")
                let fileMainType = 'unknown';
                if (isFileEntry(entry) && isFile(entry.file)) {
                    fileMainType = `fileMainType${upperCaseFirstLetter(entry.file.type.split('/').shift() ?? '')}`;
                }

                // validation can only show one status but still receives an array
                setEntryExtensionStatus(
                    entry,
                    validationResults
                        ? {
                              type: Status.Error,
                              code: 'VALIDATION_INVALID',
                              subcode: validationResults.code,
                              values: {
                                  ...validationResults.values,
                                  fileMainType,
                              },
                          }
                        : {
                              type: Status.System,
                              code: 'VALIDATION_COMPLETE',
                          }
                );

                // return false so scheduler cancels next tasks
                if (validationResults) {
                    return false;
                }
            }

            async function taskShouldValidate(entry: FilePondEntry) {
                const { shouldValidate } = props;

                // exit if shouldValidate not defined
                if (!shouldValidate) {
                    return;
                }

                //determine if we _should_ activate validation
                const result = await shouldValidate(entry);

                // udpate activation status
                setEntryExtensionState(entry, {
                    shouldValidate: result,

                    // have determined if we should validate, switch to idle
                    status: {
                        type: Status.System,
                        code: 'VALIDATION_IDLE',
                    },
                });
            }

            async function taskCanValidate(entry: FilePondEntry) {
                // determine if we can activate the validation logic
                let canValidate;
                try {
                    canValidate = await canValidateEntry(entry);
                } catch (error) {
                    // failed to test if we can validate file
                    setEntryExtensionStatus(entry, {
                        type: Status.Error,
                        code: 'VALIDATION_ERROR',
                        values: { error },
                    });

                    // let scheduler know so we don't continue with next tasks
                    throw error;
                }

                // udpate activation status
                setEntryExtensionState(entry, {
                    canValidate,

                    // have determined if we can validate, switch to idle
                    status: {
                        type: Status.System,
                        code: 'VALIDATION_IDLE',
                    },
                });
            }

            function handleUpdateEntryData(entry: FilePondEntry) {
                // use canActivate to determine if we're currently awaiting activation testing of this file
                const { canValidate } = getEntryExtensionState(entry);

                // we're already awaiting test
                if (canValidate === null) {
                    return;
                }

                // abort any running tests
                abortTask(entry.id, taskCanValidate);

                // this will trigger a new test
                resetEntryValidationState(entry);
            }

            function handleUpdateEntry(entry: FilePondEntry) {
                // get props to help determine what next step to take
                const { canValidate, shouldValidate, status } = getEntryExtensionState(entry);

                // completed validation
                const didValidate = status?.code === 'VALIDATION_COMPLETE';

                // is in error state
                const hasFailed = status?.type === 'error';

                // just idle for now:
                // - something failed
                // - we already didValidate once (in which case we wait for a data change)
                // - we've determined we can't run validate task
                // - we've determined we shouldn't run validate task
                if (hasFailed || didValidate || canValidate === false || shouldValidate === false) {
                    return;
                }

                // we don't know if can activate, need to test
                if (canValidate === null) {
                    pushTask(entry.id, taskCanValidate);
                    return;
                }

                // we don't know if should activate, need to test
                if (props.shouldValidate && shouldValidate === null) {
                    pushTask(entry.id, taskShouldValidate);
                    return;
                }

                // let's validate as canValidate === true
                if (canValidate === true) {
                    pushTask(entry.id, taskValidate);
                }
            }

            const unsubUpdateEntryData = on('updateEntryData', handleUpdateEntryData);
            const unsubUpdateEntry = on('updateEntry', handleUpdateEntry);

            return {
                destroy() {
                    // unsubUpdate();
                    unsubUpdateEntry();
                    unsubUpdateEntryData();
                },
            };
        },
    });
}
