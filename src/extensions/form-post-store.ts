import type {
    StoreExtensionOptions,
    PerceivedPerformanceOptions,
    StoreTaskFnOptions,
} from './common/createStoreExtension.js';

import type { XHRResponse } from '../utils/xhr.js';
import type { Extension } from './common/createExtension.js';
import { createStoreExtension } from './common/createStoreExtension.js';
import { blobToFile } from '../utils/file.js';
import { isFile, isFileEntry } from '../utils/test.js';
import { xhr, getResponseHeaders, getFilenameFromResponseHeaders } from '../utils/xhr.js';

import type { RequestHook, FilePondEntry } from '../types/index.js';

export interface FormPostStoreOptions extends StoreExtensionOptions {
    /** Server URL, defaults to `''` */
    url?: string;

    /** The name of the form field being submitted with the form post, defaults to `'entry'` */
    name?: string;

    /** when restoring a file will first do request head so we have file info, defaults to `true` */
    fetchHead?: boolean;

    /** If an upload is really fast, will show simulated progress to instill confidence in upload */
    perceivedPerformance?: boolean | PerceivedPerformanceOptions;

    /** Intercept options sent to XMLHttpRequest */
    willRequestWithOptions?: RequestHook;
}

export const FormPostStore = createStoreExtension(
    'FormPostStore',
    {
        url: '',
        name: 'entry',
        fetchHead: true,
        willRequestWithOptions: (src, options, entry) => options,
    } as FormPostStoreOptions,
    ({ props }, pond) => {
        const { updateEntry } = pond;

        function getFilename(request: XHRResponse) {
            // Let's figure out an appropriate name
            const headers = getResponseHeaders(request);

            // get from content disposition header
            const contentDispositionFilename = getFilenameFromResponseHeaders(headers);
            if (contentDispositionFilename) {
                return contentDispositionFilename;
            }
        }

        async function storeEntry(
            entry: FilePondEntry,
            { abortController, onprogress, onabort }: StoreTaskFnOptions
        ) {
            const { url, valueKey, willRequestWithOptions } = props;

            // Needs to be of type File
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // Did already storeEntry? This function is called when files are already storeEntry so we can optionally resume uploads in other storage plugins.
            if (isFile(entry.file) && entry.state[valueKey] != null) {
                return entry.state[valueKey];
            }

            // Let's upload the file data
            const { name } = props;
            const requestOptions = {
                method: 'POST',
                formData: [[name, entry.file, entry.file.name]],
            };
            const request = await xhr(url, {
                ...(willRequestWithOptions(url, requestOptions, entry) ?? requestOptions),
                abortController,
                onprogress,
                onabort,
            });

            // return a unique id
            return request.response;
        }

        async function restoreEntry(
            storageId: string,
            entry: FilePondEntry,
            { onprogress, onabort, abortController }: StoreTaskFnOptions
        ) {
            const { url, fetchHead, willRequestWithOptions } = props;

            // Head request to get name and size?
            if (fetchHead) {
                const requestOptions = {
                    method: 'HEAD',
                    queryString: {
                        id: storageId,
                    },
                };
                const headRequest = await xhr(url, {
                    ...(willRequestWithOptions(url, requestOptions, entry) ?? requestOptions),
                });

                // use this to prefill content type and length
                const { contentType, contentLength, lastModified } =
                    getResponseHeaders(headRequest);

                // update entry so we know size, name, and type before the blob is loaded
                updateEntry(entry, {
                    name: getFilename(headRequest),
                    type: contentType,
                    size: parseInt(contentLength, 10),
                    lastModified: new Date(lastModified).getTime(),
                });
            }

            // get file
            const requestOptions = {
                method: 'GET',
                queryString: {
                    id: storageId,
                },
            };
            const request = await xhr(url, {
                ...(willRequestWithOptions(url, requestOptions, entry) ?? requestOptions),
                responseType: 'blob',
                abortController,
                onprogress,
                onabort,
            });

            // get the blob object
            const { response: blob } = request;

            // replace entry with our new shiny file object
            return blobToFile(
                blob as Blob,
                // use entry name if defined
                entry.name ||
                    // else read from response headers
                    getFilenameFromResponseHeaders(getResponseHeaders(request)) ||
                    // else fall back
                    'untitled'
            );
        }

        async function releaseEntry(storageId: string, entry: FilePondEntry) {
            const { url, willRequestWithOptions } = props;

            const requestOptions = {
                method: 'DELETE',
                queryString: {
                    id: storageId,
                },
            };

            await xhr(url, willRequestWithOptions(url, requestOptions, entry) ?? requestOptions);

            // TODO: return success / fail state, for now always succeeds
            return true;
        }

        return {
            storeEntry,
            restoreEntry,
            releaseEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FormPostStore: FormPostStoreOptions;
    }
}
