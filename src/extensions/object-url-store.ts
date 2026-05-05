import {
    type StoreExtensionOptions,
    type StoreExtensionFunctionOptions,
    createStoreExtension,
} from './common/createStoreExtension.js';
import type { FilePondEntry } from '../types/index.js';
import { createProgressEvent } from '../utils/xhr.js';
import { isFile, isFileEntry } from '../utils/test.js';
import { createObjectURL, revokeObjectURL } from '../utils/objectURL.js';

export interface ObjectURLStoreOptions extends StoreExtensionOptions {}

export const ObjectURLStore = createStoreExtension({
    name: 'ObjectURLStore',
    props: {} as ObjectURLStoreOptions,
    factory: () => {
        async function storeEntry(
            entry: FilePondEntry,
            { onprogress }: StoreExtensionFunctionOptions
        ) {
            // is not a file, exit!
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // no progress updates
            onprogress(createProgressEvent(false));

            // sync operation, returns object url to store extension
            return createObjectURL(entry.file);
        }

        async function releaseEntry(value: string) {
            revokeObjectURL(value);
        }

        return {
            storeEntry,
            releaseEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ObjectURLStore: ObjectURLStoreOptions;
    }
    interface defineFilePondOptions {
        ObjectURLStore: ObjectURLStoreOptions;
    }
}
