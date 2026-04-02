import type { FilePondEntry } from '../types/index.js';

import { noop } from '../utils/placeholder.js';
import { isFile, isFileEntry } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';
import { arrayItemsEqual, arrayRemoveFalsy } from '../utils/array.js';
import { Status } from '../common/status.js';
import { debounce } from '../utils/debounce.js';

export interface ValueCallbackStoreOptions {
    /** If the value is required or not. Defaults to `false` */
    required: boolean;

    /** Need to know the value key. Defaults to `'value'` */
    valueKey: string;

    /**
     * Custom function to map an entry object to a value for use in FormData. By default will use `valueKey` to get a storage id from the `entry.state`, else will return `entry.file` if set.
     */
    entryToValue?: (entry: FilePondEntry) => File | string | void;

    /** Called when formdata object changed. Defaults to `undefined` */
    onChange: (currentValues: unknown[]) => void;
}

export const ValueCallbackStore = createExtension(
    'ValueCallbackStore',
    {
        // if the value is required or not
        required: false,

        // need to know the value key
        valueKey: 'value',

        // custom function to convert entry to value for formdata
        entryToValue: undefined,

        // called when formdata object changed
        onChange: noop,
    } as ValueCallbackStoreOptions,
    ({ props, didSetProps }, { on, getEntries, setExtensionStatus }) => {
        // holds last values so we can determine if values changed
        let previousValues: any[] = [];

        // when props updated we need to re-evaluate
        didSetProps(() => {
            // update props, let's re-evaluate state
            validateEntries(getEntries());
        });

        /** Default function used to convert entry to value */
        function defaultEntryToValue(entry: FilePondEntry): File | string | void {
            const { valueKey } = props;

            // use value key
            if (Object.hasOwn(entry.state, valueKey)) {
                return entry.state[valueKey];
            }

            // by default we only deal with files
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // we have a file
            return entry.file;
        }

        function validateEntries(entries: FilePondEntry[]) {
            const { required, onChange, entryToValue = defaultEntryToValue } = props;

            // if no `valueKey` we just get files
            const currentValues = arrayRemoveFalsy(entries.map(entryToValue));

            // if same items, exit
            if (previousValues.length && arrayItemsEqual(previousValues, currentValues)) {
                return;
            }

            // remember for next run
            previousValues = currentValues;

            // we have a value
            if (required && !currentValues.length) {
                setExtensionStatus({
                    type: Status.Error,
                    code: 'VALIDATION_INVALID_EMPTY',
                    meta: { flag: 'valueMissing' },
                });
            } else {
                setExtensionStatus({
                    type: Status.System,
                    code: 'VALIDATION_COMPLETE',
                });
            }

            // form data updated (only call if changed?)
            onChange(currentValues);
        }

        const unsubUpdateEntry = on('updateEntries', debounce(validateEntries));

        return {
            destroy: () => {
                previousValues.length = 0;
                unsubUpdateEntry();
            },
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        ValueCallbackStore: ValueCallbackStoreOptions;
    }
    interface defineFilePondOptions {
        ValueCallbackStore: ValueCallbackStoreOptions;
    }
}
