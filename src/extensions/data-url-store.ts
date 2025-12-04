import type { StoreExtensionOptions, StoreTaskFnOptions } from './common/createStoreExtension.js';
import type { FilePondEntry } from '../types/index.js';
import { createStoreExtension } from './common/createStoreExtension.js';
import { thread } from '../utils/thread.js';
import { isFileEntry } from '../utils/test.js';

export interface DataURLStoreOptions extends StoreExtensionOptions {
    /* no props for now */
}

/** File encoding function that can run in a separate thread */
const encodeFile = (
    file: File,
    cb: (error: ProgressEvent | null, res?: { dataURL: string }) => void,
    { onprogress }: { onprogress: (e: ProgressEvent) => void }
) => {
    const reader = new FileReader();
    reader.onprogress = onprogress;
    reader.onloadend = () => cb(null, { dataURL: reader.result as string });
    reader.onerror = (error) => cb(error);
    reader.readAsDataURL(file);
};

export const DataURLStore = createStoreExtension('DataURLStore', {} as DataURLStoreOptions, () => {
    async function storeEntry(
        entry: FilePondEntry,
        { abortController, onprogress, onabort }: StoreTaskFnOptions
    ) {
        // skip non files
        if (!isFileEntry(entry)) {
            return;
        }

        // encode in separate thread so doesn't block UI animations
        const res = (await thread(encodeFile, [entry.file], {
            abortController,
            onprogress,
            onabort,
        })) as { dataURL: string };

        // return as value
        return res.dataURL;
    }

    return {
        storeEntry,
    };
});

declare module '../index.js' {
    interface FilePondElement {
        DataURLStore: DataURLStoreOptions;
    }
}
