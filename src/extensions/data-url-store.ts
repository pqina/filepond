import type {
    CreateStoreExtensionOptions,
    StoreExtensionStoreFunction,
} from './common/createStoreExtension.js';
import { createStoreExtension } from './common/createStoreExtension.js';
import { createThreadWorker, thread } from '../utils/thread.js';
import { isFileEntry } from '../utils/test.js';
import { readFile } from '../workers/readFile.js';

export interface DataURLStoreOptions extends CreateStoreExtensionOptions {
    /** Where the extension can find the WebWorker to use. Optional and usually automatically set by FilePond. */
    workersURL?: URL;
}

export const DataURLStore = createStoreExtension({
    name: 'DataURLStore',
    props: {
        workersURL: undefined,
    } as DataURLStoreOptions,
    factory: ({ props }) => {
        const storeEntry: StoreExtensionStoreFunction = async (entry, { onprogress, signal }) => {
            // should we use a blob worker
            const { workersURL } = props;

            // skip non files
            if (!isFileEntry(entry)) {
                return;
            }

            // encode in separate thread so doesn't block UI animations
            const res = (await thread(createThreadWorker(workersURL, readFile), [entry.file], {
                signal,
                onprogress,
            })) as { dataURL: string };

            // return as value
            return res.dataURL;
        };

        return {
            storeEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        DataURLStore: DataURLStoreOptions;
    }
    interface DefineFilePondOptions {
        DataURLStore?: DataURLStoreOptions;
    }
}
