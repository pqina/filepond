import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import type { TaskFnOptions } from '../core/taskScheduler.ts';
import type { XHRResponse } from '../utils/xhr.js';

import {
    xhr,
    getResponseHeaders,
    getFilenameFromResponseHeaders,
    getResponseHeaderValue,
} from '../utils/xhr.js';
import { urlToFilename } from '../utils/url.js';
import { isString, isBlobOrFile, isDataURL, isNumber, isFileEntry } from '../utils/test.js';
import { blobToFile, getExtensionFromMimeType } from '../utils/file.js';
import { didAbort } from '../utils/abort.js';
import { passthrough } from '../utils/placeholder.js';
import { createExtension } from './common/createExtension.js';
import { Status } from '../common/status.js';
import type { RequestResolverContext, ResolvedRequest } from './common/requestResolver.js';

interface URLLoaderResponseResolverContext<Value> {
    value: Value;
    response: XHRResponse;
    entry: FilePondFileEntry;
}

type URLLoaderRequestResolver = (
    request: RequestResolverContext<FilePondFileEntry>
) => ResolvedRequest | Promise<ResolvedRequest>;

type URLLoaderResponseResolver<Value> = (
    response: URLLoaderResponseResolverContext<Value>
) => Value;

const defaultResolveLoadResponse: URLLoaderResponseResolver<File> = ({ value }) => value;

export interface URLLoaderOptions {
    /** Action to run to trigger the load operation, defaults to `'load'`. */
    actionLoad?: string;

    /** Action to run to abort the load operation, defaults to `'abort'`. */
    actionAbort?: string;

    /** Hook that runs when determining the name for a file. Defaults to `() => 'Untitled'`. */
    getBasename?: (entry: FilePondEntry, blob: Blob) => string;

    /** An object with key value pairs describing mime type relation to extension. */
    mimeTypeMap?: { [key: string]: string };

    /** Fetch remote metadata using HEAD request so file content length and type are updated sooner, defaults to `true`. */
    fetchMetadata?: boolean;

    /** Maximum number of URLs to load in parallel, defaults to `2`. */
    parallel?: number;

    /** Determines if we should use WebWorkers for the `XMLHttpRequest`, defaults to `true`. */
    useWebWorkers?: boolean;

    /** Where the extension can find the WebWorker to use */
    workersURL?: URL;

    /** Resolve the URL and options sent to `XMLHttpRequest`. */
    resolveRequest?: {
        metadata?: URLLoaderRequestResolver;
        load?: URLLoaderRequestResolver;
    };

    /** Resolve the value created from the `XMLHttpRequest` response. */
    resolveResponse?: {
        load?: URLLoaderResponseResolver<File>;
    };
}

export const URLLoader = createExtension({
    name: 'URLLoader',
    type: 'loader',
    props: {
        getBasename: () => 'Untitled',
        mimeTypeMap: undefined,
        parallel: 2,
        fetchMetadata: true,
        useWebWorkers: true,
        workersURL: undefined,
        actionLoad: 'load',
        actionAbort: 'abort',
        resolveRequest: {},
        resolveResponse: {},
    } as URLLoaderOptions,
    factory: ({ extensionName, props }, pond) => {
        const {
            on,
            removeEntries,
            updateEntry,
            pushTask,
            abortTask,
            getEntryExtensionStatus,
            getEntryExtensionState,
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
                const { getBasename, mimeTypeMap } = props;
                return `${getBasename(entry, blob as Blob)}${getExtensionFromMimeType((blob as Blob).type, mimeTypeMap)}`;
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
        async function taskUrlToMetadata(entry: FilePondFileEntry, { signal }: TaskFnOptions) {
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
                const {
                    resolveRequest: { metadata: resolveMetadataRequest = passthrough },
                    useWebWorkers,
                    workersURL,
                } = props;

                // quickly try to get file metadata and update so user knows how much data is loaded
                const resolvedRequest = await resolveMetadataRequest({
                    url: src as string,
                    options: {
                        method: 'HEAD',
                    },
                    entry,
                });
                const headRequest = await xhr(resolvedRequest.url, {
                    ...resolvedRequest.options,
                    signal,
                    useWebWorkers,
                    workersURL,
                });

                // use this to prefill content type and length
                const { contentType, contentLength, lastModified } =
                    getResponseHeaders(headRequest);

                const fileInfo: {
                    name: string;
                    type?: string;
                    size?: number;
                    lastModified?: number;
                } = {
                    name: getFilename(entry, headRequest),
                };

                if (contentType) {
                    fileInfo.type = contentType;
                }

                if (contentLength) {
                    fileInfo.size = parseInt(contentLength, 10);
                }

                if (lastModified) {
                    fileInfo.lastModified = new Date(lastModified).getTime();
                }

                // update entry so we know size, name, and type before the blob is loaded
                updateEntry(entry, {
                    ...fileInfo,
                    extension: {
                        [extensionName]: {
                            fetchedMetadata: true,
                        },
                    },
                });
            } catch (error) {
                if (didAbort(signal, error)) {
                    return;
                }

                handleLoadError(entry, error);
            }
        }

        /** Convert entry to a file object */
        async function taskUrlToFile(entry: FilePondFileEntry, { signal }: TaskFnOptions) {
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
                const {
                    resolveRequest: { load: resolveLoadRequest = passthrough },
                    resolveResponse: { load: resolveLoadResponse = defaultResolveLoadResponse },
                    useWebWorkers,
                    workersURL,
                } = props;

                const resolvedRequest = await resolveLoadRequest({
                    url: src as string,
                    options: {
                        method: 'GET',
                    },
                    entry,
                });
                const dataRequest = await xhr(resolvedRequest.url, {
                    ...resolvedRequest.options,
                    responseType: 'arraybuffer',
                    signal,
                    useWebWorkers,
                    workersURL,
                    onprogress: createProgressHandler(entry),
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
                const file = resolveLoadResponse({
                    response: dataRequest,
                    value: blobToFile(blob, filename),
                    entry,
                });

                // update in one go
                updateEntry(entry, {
                    file,
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
                if (didAbort(signal, error)) {
                    // remove from list, as we can't load it after aborting load
                    removeEntries(entry);
                    return;
                }

                handleLoadError(entry, error);
            }
        }

        function handleUpdateEntry(entry: FilePondEntry) {
            // already is blob or file, no need to load
            if (!isFileEntry(entry) || isBlobOrFile(entry.file)) {
                return;
            }

            // is in error state
            const status = getEntryExtensionStatus(entry);
            if (status?.type === 'error') {
                return;
            }

            // if we can fetch metadata we need to know if we fetched metadata
            const { fetchedMetadata = false } = getEntryExtensionState(entry);

            // get settings
            const { actionLoad, actionAbort, fetchMetadata, parallel } = props;

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

            // start loading file info if not set manually and hasn't fetched yet
            const hasFileInfo = isString(name) && isNumber(size);
            const canFetchMetadata = fetchMetadata && !isDataURL(src);
            if (!fetchedMetadata && !hasFileInfo && canFetchMetadata) {
                pushTask(entry.id, taskUrlToMetadata);
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
    },
});

declare module '../index.js' {
    interface FilePondElement {
        URLLoader: URLLoaderOptions;
    }
    interface DefineFilePondOptions {
        URLLoader?: URLLoaderOptions;
    }
}
