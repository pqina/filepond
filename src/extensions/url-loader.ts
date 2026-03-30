import type { RequestHook, FilePondEntry, FilePondFileEntry } from '../types/index.js';
import type { TaskFnOptions } from '../core/taskScheduler.ts';
import type { XHRResponse } from '../utils/xhr.js';

import {
    xhr,
    getResponseHeaders,
    getFilenameFromResponseHeaders,
    getResponseHeaderValue,
} from '../utils/xhr.js';
import { urlToFilename } from '../utils/url.js';
import { isString, isBlobOrFile, isDataURL, isNumber } from '../utils/test.js';
import { blobToFile, getExtensionFromMimeType } from '../utils/file.js';
import { createExtension } from './common/createExtension.js';
import { Status } from '../common/status.js';

export interface URLLoaderOptions {
    /** Action to run to trigger the load operation, defaults to `'load'`. */
    actionLoad?: string;

    /** Action to run to abort the load operation, defaults to `'abort'`. */
    actionAbort?: string;

    /** Hook that runs when determining the name for a file. Defaults to `() => 'Untitled'`. */
    getBaseName?: (entry: FilePondEntry, blob: Blob) => string;

    /** An object with key value pairs describing mime type relation to extension. */
    mimeTypeMap?: { [key: string]: string };

    /** Fetch remote HEAD to get file content length and type so meta data is updated sooner, defaults to `true`. */
    fetchHead?: boolean;

    /** Maximum number of URLs to load in parallel, defaults to `2`. */
    parallel?: number;

    /** Determines if we should use WebWorkers for the `XMLHttpRequest`, defaults to `true`. */
    useWebWorkers?: boolean;

    /** Where the extension can find the WebWorker to use */
    workersURL?: URL;

    /** Intercept options sent to XMLHttpRequest with `RequestHook`. */
    willRequestWithOptions?: RequestHook;
}

function willRequestWithOptions(src: string, options: any, entry: FilePondFileEntry) {
    return options;
}

export const URLLoader = createExtension(
    'URLLoader',
    {
        getBaseName: () => 'Untitled',
        mimeTypeMap: undefined,
        parallel: 2,
        fetchHead: true,
        useWebWorkers: true,
        workersURL: undefined,
        actionLoad: 'load',
        actionAbort: 'abort',
        willRequestWithOptions,
    } as URLLoaderOptions,
    ({ extensionName, props }, pond) => {
        const {
            on,
            removeEntries,
            updateEntry,
            pushTask,
            abortTask,
            getEntryExtensionStatus,
            setEntryExtensionStatus,
            createProgressHandler,
        } = pond;

        function getFilename(entry: FilePondFileEntry, request: XHRResponse): string {
            // Let's figure out an appropriate name
            const { src } = entry;
            const { response: blob } = request;
            const headers = getResponseHeaders(request);

            // at this point is always a url
            const url = src as string;

            // get from content disposition header
            const contentDispositionFilename = getFilenameFromResponseHeaders(headers);
            if (contentDispositionFilename) {
                return contentDispositionFilename;
            }

            // get from data url / blob
            if (isDataURL(url)) {
                const { getBaseName, mimeTypeMap } = props;
                return `${getBaseName(entry, blob as Blob)}${getExtensionFromMimeType((blob as Blob).type, mimeTypeMap)}`;
            }

            return urlToFilename(url);
        }

        function handleLoadError(entry: FilePondEntry, error: unknown) {
            setEntryExtensionStatus(entry, {
                type: Status.Error,
                code: 'LOAD_ERROR',
                values: { error },
            });

            // pass error to task scheduler so other tasks are cancelled
            throw error;
        }

        function isValidSource(src: string): boolean {
            if (isString(src) && src.length) {
                return true;
            }
            throw 'FilePondEntry has invalid src property';
        }

        /** Set queued state */
        async function taskQueueLoadFile(entry: FilePondEntry) {
            setEntryExtensionStatus(entry, {
                code: 'LOAD_QUEUED',
                type: Status.System,
                progress: Infinity,
            });
        }

        /** Get remote file information */
        async function taskUrlToInfo(entry: FilePondFileEntry, { abortController }: TaskFnOptions) {
            const { src } = entry;

            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            try {
                if (!isValidSource(src as string)) {
                    return;
                }

                // get settings
                const { useWebWorkers, workersURL, willRequestWithOptions } = props;

                // quickly try to get file metadata and update so user knows how much data is loaded
                const headRequestOptions = { method: 'HEAD' };
                const headRequest = await xhr(src as string, {
                    ...(willRequestWithOptions(src, headRequestOptions, entry) ||
                        headRequestOptions),
                    abortController,
                    useWebWorkers,
                    workersURL,
                });

                // use this to prefill content type and length
                const { contentType, contentLength, lastModified } =
                    getResponseHeaders(headRequest);

                // update entry so we know size, name, and type before the blob is loaded
                updateEntry(entry, {
                    name: getFilename(entry, headRequest),
                    type: contentType,
                    size: parseInt(contentLength, 10),
                    lastModified: new Date(lastModified).getTime(),
                });
            } catch (error) {
                handleLoadError(entry, error);
            }
        }

        /** Convert entry to a file object */
        async function taskUrlToFile(entry: FilePondFileEntry, { abortController }: TaskFnOptions) {
            const { src } = entry;

            setEntryExtensionStatus(entry, {
                type: Status.System,
                code: 'LOAD_BUSY',
                progress: Infinity,
            });

            try {
                if (!isValidSource(src as string)) {
                    return;
                }

                // get settings
                const { useWebWorkers, workersURL, willRequestWithOptions } = props;

                const dataRequestOptions = { method: 'GET' };
                const dataRequest = await xhr(src as string, {
                    ...(willRequestWithOptions(src, dataRequestOptions, entry) ||
                        dataRequestOptions),
                    responseType: 'arraybuffer',
                    abortController,
                    useWebWorkers,
                    workersURL,
                    onprogress: createProgressHandler(entry),
                    onabort: () => {
                        // remove from list, as we can't load it after aborting load
                        removeEntries(entry);
                    },
                });

                // get the blob object
                const { response: arrayBuffer } = dataRequest;

                const blobType = getResponseHeaderValue(
                    'content-type',
                    dataRequest.getAllResponseHeaders()
                );

                const blob = new Blob([arrayBuffer], { type: blobType });

                // turn into file object
                const filename = getFilename(entry, dataRequest);

                // update in one go
                updateEntry(entry, {
                    file: blobToFile(blob, filename),
                    extension: {
                        [extensionName]: {
                            status: {
                                type: Status.Success,
                                code: 'LOAD_COMPLETE',
                            },
                        },
                    },
                });
            } catch (error) {
                handleLoadError(entry, error);
            }
        }

        function handleUpdateEntry(entry: FilePondFileEntry) {
            // already is blob or file, no need to load
            if (isBlobOrFile(entry.file)) {
                return;
            }

            // is in erro state
            const status = getEntryExtensionStatus(entry);
            if (status?.type === 'error') {
                return;
            }

            // get settings
            const { actionLoad, actionAbort, fetchHead, parallel } = props;

            // get refs to source
            const { src, name, size } = entry;

            // get refs to current state
            const load = entry.state[actionLoad];
            const abort = entry.state[actionAbort];

            // tests if has source, otherwise, no use for URL loader
            const hasSource = isString(src);

            // no source, let's exit
            if (!hasSource) {
                return;
            }

            // abort loading this item
            if (abort) {
                return abortTask(entry.id, taskUrlToFile);
            }

            // load not requested
            if (load === false) {
                return;
            }

            // start loading file info
            const hasFileInfo = isString(name) && isNumber(size);
            const canFetchHead = fetchHead && !isDataURL(src);
            if (!hasFileInfo && canFetchHead) {
                pushTask(entry.id, taskUrlToInfo);
                return;
            }

            // queue load
            const isLoading = status?.code === 'LOAD_BUSY';
            const hasQueued = status?.code === 'LOAD_QUEUED';
            if (!hasQueued && !isLoading) {
                pushTask(entry.id, taskQueueLoadFile);
                return;
            }

            // let's convert to a File
            pushTask(entry.id, taskUrlToFile, { parallel });
        }

        // listen for entry updates
        const unsubUpdateEntry = on('updateEntry', handleUpdateEntry);

        return {
            destroy: () => {
                unsubUpdateEntry();
            },
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        URLLoader: URLLoaderOptions;
    }
    interface defineFilePondOptions {
        URLLoader: URLLoaderOptions;
    }
}
