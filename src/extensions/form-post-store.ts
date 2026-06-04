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

import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import type { RequestResolverContext, ResolvedRequest } from './common/requestResolver.js';

export type { ResolvedRequest, RequestResolverContext };

export interface FormPostStoreMetadata {
    name?: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

export type ResolvedResponseValue = string | File | FormPostStoreMetadata;

export interface ResponseResolverContext<
    Resolved extends ResolvedResponseValue = ResolvedResponseValue,
> {
    value: Resolved;
    request: ResolvedRequest;
    response: XHRResponse;
    entry: FilePondEntry;
}

export type ResponseResolver<Resolved extends ResolvedResponseValue> = (
    response: ResponseResolverContext<Resolved>
) => Resolved;

export type RequestResolver = (
    request: RequestResolverContext<FilePondEntry>
) => ResolvedRequest | Promise<ResolvedRequest>;

export interface FormPostStoreOptions extends StoreExtensionOptions {
    /** Server URL, defaults to empty string */
    url?: string;

    /** The name of the form field being submitted with the form POST, defaults to `'entry'` */
    name?: string;

    /** When restoring a file, first fetch metadata so file details are updated sooner, defaults to `true`. */
    fetchMetadata?: boolean;

    /** Hook that runs when determining the name for a file. Defaults to `() => 'Untitled'`. */
    getBasename?: (entry: FilePondFileEntry, blob: Blob) => string;

    /** Resolve the URL and options sent to `XMLHttpRequest` */
    resolveRequest?: {
        metadata?: RequestResolver;
        store?: RequestResolver;
        restore?: RequestResolver;
        release?: RequestResolver;
    };

    /** Resolve the requested value from the response, when storing a file this is the server entry id, when restoring a file this is a File object */
    resolveResponse?: {
        metadata?: ResponseResolver<FormPostStoreMetadata>;
        store?: ResponseResolver<string>;
        restore?: ResponseResolver<File>;
    };
}

export const FormPostStore = createStoreExtension({
    name: 'FormPostStore',
    props: {
        url: '',
        name: 'entry',
        fetchMetadata: true,
        resolveRequest: {},
        resolveResponse: {},
        getBasename: () => 'Untitled',
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

        const storeEntry: StoreExtensionStoreFunction = async (entry, { onprogress, signal }) => {
            const {
                name,
                url,
                valueKey,
                resolveRequest: { store: resolveStoreRequest = passthrough },
                resolveResponse: { store: resolveStoreResponse = ({ value }) => value },
            } = props;

            // Needs to be of type File
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // Did already storeEntry? This function is called when files are already storeEntry so we can optionally resume uploads in other storage plugins.
            if (isFile(entry.file) && entry.state[valueKey] != null) {
                return entry.state[valueKey];
            }

            // Let's upload the file data
            const resolvedRequest = await resolveStoreRequest({
                url,
                options: {
                    method: 'POST',
                    formData: [[name, entry.file, entry.file.name]],
                },
                entry,
            });
            const requestResponse = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
                onprogress,
            });

            // return a unique id
            return resolveStoreResponse({
                request: resolvedRequest,
                response: requestResponse,
                value: requestResponse.response as string,
                entry,
            });
        };

        const restoreEntry: StoreExtensionRestoreFunction = async (
            storageId,
            entry,
            { onprogress, signal }
        ) => {
            const {
                url,
                fetchMetadata,
                getBasename,
                resolveRequest: {
                    metadata: resolveMetadataRequest = passthrough,
                    restore: resolveRestoreRequest = passthrough,
                },
                resolveResponse: {
                    metadata: resolveMetadataResponse = ({ value }) => value,
                    restore: resolveRestoreResponse = ({ value }) => value,
                },
            } = props;

            // Metadata request to get name and size?
            if (fetchMetadata) {
                const resolvedRequest = await resolveMetadataRequest({
                    url,
                    options: {
                        method: 'HEAD',
                        queryString: {
                            id: storageId,
                        },
                    },
                    entry,
                });
                const metadataRequest = await xhr(resolvedRequest.url, {
                    ...resolvedRequest.options,
                    signal,
                });

                // use this to prefill content type and length
                const { contentType, contentLength, lastModified } =
                    getResponseHeaders(metadataRequest);

                const metadata = resolveMetadataResponse({
                    request: resolvedRequest,
                    response: metadataRequest,
                    value: {
                        name: getFilename(metadataRequest),
                        type: contentType,
                        size: parseInt(contentLength, 10),
                        lastModified: new Date(lastModified).getTime(),
                    },
                    entry,
                });

                // update entry so we know size, name, and type before the blob is loaded
                updateEntry(entry, metadata);
            }

            const resolvedRequest = await resolveRestoreRequest({
                url,
                options: {
                    method: 'GET',
                    queryString: {
                        id: storageId,
                    },
                },
                entry,
            });
            const requestResponse = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                responseType: 'blob',
                signal,
                onprogress,
            });

            // get the blob object
            const { response: blob } = requestResponse;

            // replace entry with our new shiny file object
            const file = blobToFile(
                blob as Blob,
                // use entry name if defined
                entry.name ||
                    // else read from response headers
                    getFilenameFromResponseHeaders(getResponseHeaders(requestResponse)) ||
                    // else fall back
                    getBasename(entry as FilePondFileEntry, blob as Blob)
            );

            // return a file object
            return resolveRestoreResponse({
                request: resolvedRequest,
                response: requestResponse,
                value: file,
                entry,
            });
        };

        const releaseEntry: StoreExtensionReleaseFunction = async (storageId, entry, options) => {
            const {
                url,
                resolveRequest: { release: resolveReleaseRequest = passthrough },
            } = props;
            const { signal } = options ?? {};

            const resolvedRequest = await resolveReleaseRequest({
                url,
                options: {
                    method: 'DELETE',
                    queryString: {
                        id: storageId,
                    },
                },
                entry,
            });

            await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
            });

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
    interface DefineFilePondOptions {
        FormPostStore?: FormPostStoreOptions;
    }
}
