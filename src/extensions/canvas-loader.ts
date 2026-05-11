import { createExtension } from './common/createExtension.js';
import { isCanvas, isFile } from '../utils/test.js';
import { canvasToBlob } from '../utils/canvasToBlob.js';
import { Status } from '../common/status.js';
import { blobToFile } from '../utils/file.js';
import { getBasename, getExtension, getFilename } from '../common/entry.js';
import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';

export interface CanvasLoaderOptions {
    /** The file mime type. Defaults to `'image/png'` */
    type?: string;

    /**
     * The compression quality when turning the canvas into a file. A value between `0` and `1`, where `1`
     * means maximum quality, but also yields very big files. Not applicable for PNGs. Defaults to
     * `undefined` at which point the default browser value is used.
     */
    quality?: number;

    /** How many of these operations can run in parallel. */
    parallel?: 1;

    /** Hook that runs when determining the basename for a file. Defaults to `() => 'Untitled'` */
    getBasename?: (entry: FilePondEntry, blob: Blob) => string;

    /** Hook that runs when determining the extension of a file. The default behavior derives the extension from the file mime type. Override this function or use `mimeTypeMap` if an extension isn't computed correctly. */
    getExtension?: (entry: FilePondEntry, blob: Blob) => string;

    /** Hook that runs when determining the name of a file. By default combines the result of `getBasename()` and `getExtension()` */
    getFilename?: (entry: FilePondEntry, blob: Blob) => string;

    /**
     * An object with key value pairs describing mime type relation to extension. Defaults to
     * `undefined`, example `{ 'image/vnd.microsoft.icon': 'ico' }`
     */
    mimeTypeMap?: { [key: string]: string };
}

export const CanvasLoader = createExtension({
    name: 'CanvasLoader',
    type: 'loader',
    props: {
        parallel: 1,
        type: undefined,
        quality: undefined,
        mimeTypeMap: undefined,
        getBasename,
        getExtension,
        getFilename,
    } as CanvasLoaderOptions,
    factory: ({ props }, pond) => {
        // shortcuts to filepond internal methods
        const { on, updateEntry, pushTask, setEntryExtensionStatus, getEntryExtensionStatus } =
            pond;

        /** Converts HTMLCanvasElement to Blob */
        async function taskConvertCanvasToBlob(entry: FilePondFileEntry) {
            // let's start
            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            try {
                const { type, quality, getFilename } = props;

                const blob = await canvasToBlob(entry.src as HTMLCanvasElement, {
                    type,
                    quality,
                });

                // turn into file object
                const file = blobToFile(blob, getFilename(entry, blob, props));

                // update file prop
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

        function handleUpdateEntry(entry: FilePondFileEntry) {
            const { parallel } = props;

            // get extension entry props to help determine what next step to take
            const status = getEntryExtensionStatus(entry);

            // is in error state
            const hasFailed = status?.type === 'error';

            // is already a blob or is not a canvas source
            if (hasFailed || isFile(entry.file) || !isCanvas(entry.src)) {
                return;
            }

            // turn canvas into blob
            pushTask(entry.id, taskConvertCanvasToBlob, { parallel });
        }

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
        CanvasLoader: CanvasLoaderOptions;
    }
    interface defineFilePondOptions {
        CanvasLoader?: CanvasLoaderOptions;
    }
}
