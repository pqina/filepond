import { createStoreExtension } from './common/createStoreExtension.js';
import { isFile, isFileEntry, isNumber, isString } from '../utils/test.js';
import { didAbort } from '../utils/abort.js';
import { toURL } from '../utils/url.js';
import { naturalFileSizeToBytes } from '../utils/file.js';
import { noop, passthrough } from '../utils/placeholder.js';
import { sleep } from '../utils/sleep.js';
import { xhr, createProgressEvent, getResponseHeaders } from '../utils/xhr.js';
import { warn } from '../common/console.js';
import { getResolvedRequest } from './common/requestResolver.js';
import type {
    StoreExtensionOptions,
    StoreExtensionReleaseFunction,
    StoreExtensionStoreFunction,
} from './common/createStoreExtension.js';
import type { PublicRequestOptions, FilePondFileEntry } from '../types/index.js';
import type { RequestResolver } from './common/requestResolver.js';

export interface ChunkedUploadStoreOptions extends StoreExtensionOptions {
    /** Server URL */
    url?: string;

    /** Chunk size in bytes */
    chunkSize?: number | string;

    /** Chunks to upload in parallel */
    parallelChunks?: number;

    /** How many milliseconds between retries */
    retryDelays?: number[];

    /** Allow pause/resume */
    resume?: boolean;

    /** Resolve the URL and options sent to `XMLHttpRequest` */
    resolveRequest?: RequestResolver<FilePondFileEntry>;
}

export const ChunkedUploadStore = createStoreExtension({
    name: 'ChunkedUploadStore',
    props: {
        url: '',
        chunkSize: Infinity,
        retryDelays: [500, 1000, 3000],
        resume: false,
        parallelChunks: 2,
        resolveRequest: passthrough,
    } as ChunkedUploadStoreOptions,
    factory: ({ props, didSetProps }, { updateEntry }) => {
        let computedChunkSize: number = Infinity;

        didSetProps(({ chunkSize }: ChunkedUploadStoreOptions) => {
            // calculate computed chunk size
            computedChunkSize = isString(chunkSize)
                ? naturalFileSizeToBytes(chunkSize as string)
                : chunkSize || Infinity;

            // Chunks have to be bigger than a kilobyte
            if (computedChunkSize <= 1024) {
                warn('Chunk size has to be more than 1 kilobyte');
                return;
            }
        });

        /** Helper function to make it easier to update the server id */
        function storeServerId(entry: FilePondFileEntry, serverId: string): void {
            const { valueKey } = props;
            updateEntry(entry, {
                state: {
                    [valueKey]: serverId,
                },
            });
        }

        /** Observes upload progress for a given server ID */
        function observeUploadProgress(
            serverId: string,
            total: number,
            onprogress: (e: ProgressEvent) => void
        ): () => void {
            const { url } = props;
            const requestURL = toURL(url);
            requestURL.searchParams.append('id', serverId);

            const progressSource = new EventSource(requestURL);
            progressSource.addEventListener('progress', ({ data: loaded }) => {
                onprogress(createProgressEvent(true, parseInt(loaded, 10), total));
            });

            return () => {
                progressSource.readyState === EventSource.OPEN && progressSource.close();
            };
        }

        function getChunksForFile(file: File): [number, Blob][] {
            const chunks: [number, Blob][] = [];
            const lastChunkIndex = Math.floor(file.size / computedChunkSize);
            for (let i = 0; i <= lastChunkIndex; i++) {
                const offset = i * computedChunkSize || 0;
                const data = file.slice(
                    offset,
                    Math.min(offset + computedChunkSize, file.size),
                    'application/offset+octet-stream'
                );
                chunks.push([offset, data]);
            }
            return chunks;
        }

        async function requestFileTransferId(
            file: File,
            options: { signal?: AbortSignal },
            entry: FilePondFileEntry
        ): Promise<string> {
            const { url, resolveRequest } = props;
            const { signal } = options ?? {};

            const requestOptions: PublicRequestOptions = {
                method: 'POST',
                headers: {
                    uploadLength: file.size,
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
                signal,
            });

            if (!isString(request.response) || !request.response.length) {
                throw new Error('No server id returned');
            }

            return request.response;
        }

        async function requestFileChunkOffset(
            serverId: string,
            options: { signal?: AbortSignal },
            entry: FilePondFileEntry
        ): Promise<number> {
            const { url, resolveRequest } = props;
            const { signal } = options ?? {};

            const requestOptions: PublicRequestOptions = {
                method: 'HEAD',
                queryString: {
                    id: serverId,
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
                signal,
            });

            // get the upload offset
            const { uploadOffset } = getResponseHeaders(request);

            if (!isString(uploadOffset) || !uploadOffset.length) {
                throw new Error('No upload offset returned');
            }

            return parseInt(uploadOffset, 10);
        }

        /** Uploads a chunk of data to the server */
        async function uploadChunk(
            data: Blob,
            serverId: string,
            headers: { [key: string]: string | number },
            options: { signal?: AbortSignal },
            entry: FilePondFileEntry
        ): Promise<boolean | void> {
            const { url, retryDelays, resolveRequest } = props;
            const { signal } = options ?? {};
            for (const delay of [...retryDelays, undefined]) {
                try {
                    // upload chunk patch
                    const requestOptions: PublicRequestOptions = {
                        method: 'PATCH',
                        headers,
                        data,
                        queryString: {
                            contentType: 'application/offset+octet-stream',
                            id: serverId,
                        },
                    };

                    const resolvedRequest = await getResolvedRequest(
                        resolveRequest,
                        url,
                        requestOptions,
                        entry
                    );
                    await xhr(resolvedRequest.url, {
                        ...resolvedRequest.options,
                        signal,
                    });

                    // success
                    return true;
                } catch (error) {
                    if (didAbort(signal, error)) {
                        throw error;
                    }

                    // try again after retry delay if is bigger than 0
                    if (isNumber(delay)) {
                        await sleep(delay);
                    }
                    // no more retries, throw error
                    else {
                        throw error;
                    }
                }
            }

            return false;
        }

        /** Uploads chunks in parallel with progress tracking */
        async function uploadChunks(
            chunks: [number, Blob][],
            serverId: string,
            { uploadName, uploadLength }: { uploadName: string; uploadLength: string },
            options: {
                onprogress?: (e: ProgressEvent) => void;
                signal?: AbortSignal;
            },
            entry: FilePondFileEntry
        ): Promise<void> {
            const { parallelChunks } = props;
            const { onprogress = noop, signal } = options ?? {};

            // observe progress
            const unobserveUploadProgress = observeUploadProgress(
                serverId,
                parseInt(uploadLength, 10),
                onprogress
            );

            const abortUploadProgress = () => {
                unobserveUploadProgress();
            };

            if (signal?.aborted) {
                abortUploadProgress();
                throw signal.reason;
            }

            signal?.addEventListener('abort', abortUploadProgress, { once: true });

            // currently active uploads
            let activeUploads: Promise<boolean | void>[] = [];

            try {
                // start uploading
                for (const [chunkOffset, chunkData] of chunks) {
                    // don't process next chunk when aborted
                    if (signal?.aborted) {
                        throw signal.reason;
                    }

                    // errors handled by parent
                    const chunkUploadPromise = uploadChunk(
                        chunkData,
                        serverId,
                        {
                            uploadOffset: chunkOffset,
                            uploadName,
                            uploadLength,
                        },
                        {
                            signal,
                        },
                        entry
                    );

                    // we remember this upload
                    activeUploads.push(chunkUploadPromise);

                    // still room for more chunks to upload in parallel
                    if (activeUploads.length < parallelChunks) continue;

                    // we've reached the maximum chunks to upload in parallel, wait for one to finish
                    await Promise.race(activeUploads);

                    // filter out resolved promises
                    const remainingUploads: Promise<boolean | void>[] = [];
                    for (const upload of activeUploads) {
                        const res = await upload;
                        if (res === true) {
                            continue;
                        }
                        remainingUploads.push(upload);
                    }
                    activeUploads = [...remainingUploads];
                }
            } finally {
                // done uploading, let's stop progress observer
                signal?.removeEventListener('abort', abortUploadProgress);
                unobserveUploadProgress();
            }
        }

        const storeEntry: StoreExtensionStoreFunction = async (entry, { onprogress, signal }) => {
            // Needs to be of type File
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // create file chunks
            const chunks = getChunksForFile(entry.file);

            // get server id
            const { resume, valueKey } = props;
            let serverId = entry.state[valueKey];
            let uploadOffset = 0;

            // start inifinity spinner while where gathering info from server
            onprogress(createProgressEvent());

            if (!serverId) {
                // get and remember server id for when we want to continue upload, if aborted during this action we revert entire save process
                serverId = await requestFileTransferId(entry.file, { signal }, entry);

                // need to remember this for when we want to continue upload at a later time
                storeServerId(entry, serverId);
            } else {
                // we already have server id, request upload offset of next chunk instead, if aborted during this action we revert entire save process
                try {
                    uploadOffset = await requestFileChunkOffset(serverId, { signal }, entry);
                } catch (error) {
                    if (didAbort(signal, error)) {
                        storeServerId(entry, serverId);
                    }
                    throw error;
                }
            }

            // start uploading chunks
            try {
                await uploadChunks(
                    // get chunks that still need to be uploaded
                    chunks.filter(([chunkOffset]) => chunkOffset >= uploadOffset),

                    // need to add them to this transfer
                    serverId,

                    // file headers
                    {
                        uploadName: `${entry.file.name}`,
                        uploadLength: `${entry.file.size}`,
                    },

                    // upload progress
                    {
                        onprogress,
                        signal,
                    },

                    // entry reference
                    entry
                );
            } catch (error) {
                if (resume && didAbort(signal, error)) {
                    storeServerId(entry, serverId);
                }
                throw error;
            }

            return serverId;
        };

        const releaseEntry: StoreExtensionReleaseFunction = async (storageId, entry, options) => {
            const { url, resolveRequest } = props;
            const { signal } = options ?? {};

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

            await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
            });

            // TODO: return success / fail state, for now always succeeds
            return true;
        };

        return {
            storeEntry,
            releaseEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ChunkedUploadStore: ChunkedUploadStoreOptions;
    }
    interface defineFilePondOptions {
        ChunkedUploadStore: ChunkedUploadStoreOptions;
    }
}
