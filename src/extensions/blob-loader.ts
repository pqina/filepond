import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import { createExtension } from './common/createExtension.js';
import { isBlob, isFile, isFileEntry } from '../utils/test.js';
import { blobToFile } from '../utils/file.js';
import { Status } from '../common/status.js';
import { getBasename, getExtension, getFilename } from '../common/entry.js';

export interface BlobLoaderOptions {
    /** Hook that runs when determining the basename for a file. Defaults to `() => 'Untitled'` */
    getBasename?: (entry: FilePondEntry, blob: Blob) => string;

    /** Hook that runs when determining the extension of a file. The default behavior derives the extension from the file mime type. Override this function or use `mimeTypeMap` if an extension isn't computed correctly. */
    getExtension?: (entry: FilePondEntry, blob: Blob) => string;

    /** Hook that runs when determining the name of a file. By default combines the result of `getBasename()` and `getExtension()` */
    getFilename?: (entry: FilePondEntry, blob: Blob) => string;

    /**
     * An object with key value pairs describing mime type relation to extension. Defaults to
     * `undefined`, example `{ 'application/ld+json': 'jsonld' }`
     */
    mimeTypeMap?: { [key: string]: string };
}

export const BlobLoader = createExtension({
    name: 'BlobLoader',
    type: 'loader',
    props: {
        mimeTypeMap: undefined,
        getBasename,
        getExtension,
        getFilename,
    } as BlobLoaderOptions,
    factory: (
        { props },
        { on, updateEntry, pushTask, setEntryExtensionStatus, getEntryExtensionStatus }
    ) => {
        /** Converts item to Blob */
        function taskConvertBlobToFile(entry: FilePondFileEntry) {
            // let's start
            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            const blob = entry.src as Blob;
            try {
                // get function
                const { getFilename } = props;

                // turn into file object
                const file = blobToFile(blob, getFilename(entry, blob, props));

                // need to update item itself with new object
                updateEntry(entry, { file });
            } catch (error) {
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
        }

        /** Determines if we should convert blob to file */
        function handleUpdateEntry(entry: FilePondEntry) {
            // get extension entry props to help determine what next step to take
            const status = getEntryExtensionStatus(entry);

            // is in error state
            const hasFailed = status?.type === 'error';

            // already running tasks or can't convert to file
            if (hasFailed || !isFileEntry(entry) || !isBlob(entry.src) || isFile(entry.file)) {
                return;
            }

            // is a Blob convert to File
            pushTask(entry.id, taskConvertBlobToFile);
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
        BlobLoader: BlobLoaderOptions;
    }
    interface DefineFilePondOptions {
        BlobLoader?: BlobLoaderOptions;
    }
}
