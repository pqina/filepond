import type {
    StoreExtensionOptions,
    StoreExtensionReleaseFunction,
    StoreExtensionRestoreFunction,
    StoreExtensionStoreFunction,
} from './common/createStoreExtension.js';
import type { XHRResponse } from '../utils/xhr.js';
import { createStoreExtension } from './common/createStoreExtension.js';
import { blobToFile } from '../utils/file.js';
import { isFile, isFileEntry } from '../utils/test.js';
import { passthrough } from '../utils/placeholder.js';
import { xhr, getResponseHeaders, getFilenameFromResponseHeaders } from '../utils/xhr.js';
import { getResolvedRequest } from './common/requestResolver.js';

import type { FilePondFileEntry, PublicRequestOptions } from '../types/index.js';
import type { RequestResolver } from './common/requestResolver.js';

export interface FormPostStoreOptions extends StoreExtensionOptions {
    /** Server URL, defaults to empty string */
    url?: string;

    /** The name of the form field being submitted with the form POST, defaults to `'entry'` */
    name?: string;

    /** when restoring a file will first do request head so we have file info, defaults to `true` */
    fetchHead?: boolean;

    /** Resolve the URL and options sent to `XMLHttpRequest` */
    resolveRequest?: RequestResolver<FilePondFileEntry>;
}

export const FormPostStore = createStoreExtension({
    name: 'FormPostStore',
    props: {
        url: '',
        name: 'entry',
        fetchHead: true,
        resolveRequest: passthrough,
    } as FormPostStoreOptions,
    factory: ({ props }, pond) => {
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

        const storeEntry: StoreExtensionStoreFunction = async (
            entry,
            { signal, onprogress, onabort }
        ) => {
            const { url, valueKey, resolveRequest } = props;

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
            const requestOptions: PublicRequestOptions = {
                method: 'POST',
                formData: [[name, entry.file, entry.file.name]],
            };
            const resolvedRequest = await getResolvedRequest(
                resolveRequest,
                url,
                requestOptions,
                entry
            );
            const request = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
                onprogress,
                onabort,
            });

            // return a unique id
            return request.response;
        };

        const restoreEntry: StoreExtensionRestoreFunction = async (
            storageId,
            entry,
            { onprogress, onabort, signal }
        ) => {
            const { url, fetchHead, resolveRequest } = props;

            // Head request to get name and size?
            if (fetchHead) {
                const requestOptions: PublicRequestOptions = {
                    method: 'HEAD',
                    queryString: {
                        id: storageId,
                    },
                };
                const resolvedRequest = await getResolvedRequest(
                    resolveRequest,
                    url,
                    requestOptions,
                    entry
                );
                const headRequest = await xhr(resolvedRequest.url, resolvedRequest.options);

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
            const requestOptions: PublicRequestOptions = {
                method: 'GET',
                queryString: {
                    id: storageId,
                },
            };
            const resolvedRequest = await getResolvedRequest(
                resolveRequest,
                url,
                requestOptions,
                entry
            );
            const request = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                responseType: 'blob',
                signal,
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
        };

        const releaseEntry: StoreExtensionReleaseFunction = async (storageId, entry) => {
            const { url, resolveRequest } = props;

            const requestOptions: PublicRequestOptions = {
                method: 'DELETE',
                queryString: {
                    id: storageId,
                },
            };

            const resolvedRequest = await getResolvedRequest(
                resolveRequest,
                url,
                requestOptions,
                entry
            );

            await xhr(resolvedRequest.url, resolvedRequest.options);

            // TODO: return success / fail state, for now always succeeds
            return true;
        };

        return {
            storeEntry,
            restoreEntry,
            releaseEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        FormPostStore: FormPostStoreOptions;
    }
    interface defineFilePondOptions {
        FormPostStore: FormPostStoreOptions;
    }
}
