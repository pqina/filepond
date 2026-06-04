import { createStoreExtension } from './common/createStoreExtension.js';
import { isFile, isFileEntry, isNumber, isString } from '../utils/test.js';
import { didAbort } from '../utils/abort.js';
import { naturalFileSizeToBytes } from '../utils/file.js';
import { noop, passthrough } from '../utils/placeholder.js';
import { sleep } from '../utils/sleep.js';
import { xhr, createProgressEvent, getResponseHeaders, type XHRResponse } from '../utils/xhr.js';
import { warn } from '../common/console.js';
import type {
    StoreExtensionOptions,
    StoreExtensionReleaseFunction,
    StoreExtensionStoreFunction,
} from './common/createStoreExtension.js';
import type { FilePondEntry } from '../types/index.js';
import type { RequestResolverContext, ResolvedRequest } from './common/requestResolver.js';

export interface UploadChunk {
    index: number;
    offset: number;
    size: number;
    data: Blob;
}

export interface UploadedChunk {
    index: number;
    offset: number;
    size: number;
    id?: string;
}

export interface UploadStatus {
    id?: string;
    offset?: number;
    chunks?: UploadedChunk[];
}

export type ChunkedUploadStoreResponseValue = string | UploadStatus | UploadedChunk;

export interface ChunkedUploadStoreRequestResolverContext
    extends RequestResolverContext<FilePondEntry> {
    id?: string;
    chunk?: UploadChunk;
    chunks?: UploadedChunk[];
}

export interface ChunkedUploadStoreResponseResolverContext<
    Value extends ChunkedUploadStoreResponseValue = ChunkedUploadStoreResponseValue,
> {
    value: Value;
    request: ResolvedRequest;
    response: XHRResponse;
    entry: FilePondEntry;
    id?: string;
    chunk?: UploadChunk;
    chunks?: UploadedChunk[];
}

export type ChunkedUploadStoreRequestResolver = (
    request: ChunkedUploadStoreRequestResolverContext
) => ResolvedRequest | Promise<ResolvedRequest>;

export type ChunkedUploadStoreResponseResolver<Value extends ChunkedUploadStoreResponseValue> = (
    response: ChunkedUploadStoreResponseResolverContext<Value>
) => Value;

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
    resolveRequest?: {
        create?: ChunkedUploadStoreRequestResolver;
        status?: ChunkedUploadStoreRequestResolver;
        chunk?: ChunkedUploadStoreRequestResolver;
        complete?: ChunkedUploadStoreRequestResolver;
        release?: ChunkedUploadStoreRequestResolver;
    };

    /** Resolve the value created from the `XMLHttpRequest` response */
    resolveResponse?: {
        create?: ChunkedUploadStoreResponseResolver<string>;
        status?: ChunkedUploadStoreResponseResolver<UploadStatus>;
        chunk?: ChunkedUploadStoreResponseResolver<UploadedChunk>;
        complete?: ChunkedUploadStoreResponseResolver<string>;
    };
}

export const ChunkedUploadStore = createStoreExtension({
    name: 'ChunkedUploadStore',
    props: {
        url: '',
        chunkSize: Infinity,
        retryDelays: [500, 1000, 3000],
        parallelChunks: 2,
        resume: false,
        resolveRequest: {},
        resolveResponse: {},
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
        function storeServerId(entry: FilePondEntry, serverId: string): void {
            const { valueKey } = props;
            updateEntry(entry, {
                state: {
                    [valueKey]: serverId,
                },
            });
        }

        function getChunksForFile(file: File): UploadChunk[] {
            const chunks: UploadChunk[] = [];
            const lastChunkIndex = Math.floor(file.size / computedChunkSize);
            for (let i = 0; i <= lastChunkIndex; i++) {
                const offset = i * computedChunkSize || 0;
                const data = file.slice(
                    offset,
                    Math.min(offset + computedChunkSize, file.size),
                    'application/offset+octet-stream'
                );
                chunks.push({
                    index: i,
                    offset,
                    size: data.size,
                    data,
                });
            }
            return chunks;
        }

        async function requestFileTransferId(
            file: File,
            options: { signal?: AbortSignal },
            entry: FilePondEntry
        ): Promise<string> {
            const {
                url,
                resolveRequest: { create: resolveCreateRequest = passthrough },
                resolveResponse: { create: resolveCreateResponse = ({ value }) => value },
            } = props;
            const { signal } = options ?? {};

            const resolvedRequest = await resolveCreateRequest({
                url,
                options: {
                    method: 'POST',
                    headers: {
                        uploadLength: file.size,
                    },
                },
                entry,
            });
            const request = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
            });

            const serverId = resolveCreateResponse({
                request: resolvedRequest,
                response: request,
                value: request.response as string,
                entry,
            });

            if (!isString(serverId) || !serverId.length) {
                throw new Error('No server id returned');
            }

            return serverId;
        }

        async function requestFileUploadStatus(
            serverId: string,
            options: { signal?: AbortSignal },
            entry: FilePondEntry
        ): Promise<UploadStatus> {
            const {
                url,
                resolveRequest: { status: resolveStatusRequest = passthrough },
                resolveResponse: { status: resolveStatusResponse = ({ value }) => value },
            } = props;
            const { signal } = options ?? {};

            const resolvedRequest = await resolveStatusRequest({
                url,
                options: {
                    method: 'HEAD',
                    queryString: {
                        id: serverId,
                    },
                },
                entry,
            });
            const request = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
            });

            // get the upload offset
            const { uploadOffset } = getResponseHeaders(request);
            const status = resolveStatusResponse({
                request: resolvedRequest,
                response: request,
                value: {
                    id: serverId,
                    offset:
                        isString(uploadOffset) && uploadOffset.length
                            ? parseInt(uploadOffset, 10)
                            : Number.NaN,
                },
                entry,
            });
            const hasOffset = isNumber(status.offset) && !Number.isNaN(status.offset);
            const hasChunks = Array.isArray(status.chunks);

            if (!hasOffset && !hasChunks) {
                throw new Error('No upload status returned');
            }

            return status;
        }

        /** Uploads a chunk of data to the server */
        async function uploadChunk(
            chunk: UploadChunk,
            serverId: string,
            { uploadName, uploadLength }: { uploadName: string; uploadLength: string },
            options: { onprogress?: (e: ProgressEvent) => void; signal?: AbortSignal },
            entry: FilePondEntry
        ): Promise<UploadedChunk> {
            const {
                url,
                retryDelays,
                resolveRequest: { chunk: resolveChunkRequest = passthrough },
                resolveResponse: { chunk: resolveChunkResponse = ({ value }) => value },
            } = props;
            const { onprogress, signal } = options ?? {};
            for (const delay of [...retryDelays, undefined]) {
                try {
                    // upload chunk patch
                    const resolvedRequest = await resolveChunkRequest({
                        url,
                        options: {
                            method: 'PATCH',
                            headers: {
                                uploadOffset: chunk.offset,
                                uploadName,
                                uploadLength,
                            },
                            data: chunk.data,
                            queryString: {
                                contentType: 'application/offset+octet-stream',
                                id: serverId,
                            },
                        },
                        entry,
                        chunk,
                    });
                    const requestResponse = await xhr(resolvedRequest.url, {
                        ...resolvedRequest.options,
                        onprogress,
                        signal,
                    });

                    return resolveChunkResponse({
                        request: resolvedRequest,
                        response: requestResponse,
                        value: {
                            index: chunk.index,
                            offset: chunk.offset,
                            size: chunk.size,
                        },
                        entry,
                        id: serverId,
                        chunk,
                    });
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

            throw new Error('Chunk upload failed');
        }

        /** Uploads chunks in parallel with progress tracking */
        async function uploadChunks(
            chunks: UploadChunk[],
            serverId: string,
            { uploadName, uploadLength }: { uploadName: string; uploadLength: string },
            options: {
                onprogress?: (e: ProgressEvent) => void;
                signal?: AbortSignal;
            },
            entry: FilePondEntry
        ): Promise<UploadedChunk[]> {
            const { parallelChunks } = props;
            const { onprogress = noop, signal } = options ?? {};
            const uploadedChunks: UploadedChunk[] = [];
            const totalBytes = parseInt(uploadLength, 10);
            const remainingBytes = chunks.reduce((total, chunk) => total + chunk.size, 0);
            let completedBytes = Math.max(0, totalBytes - remainingBytes);
            const activeChunkProgress = new Map<number, number>();

            const reportUploadProgress = () => {
                const activeBytes = Array.from(activeChunkProgress.values()).reduce(
                    (total, value) => total + value,
                    0
                );
                const loaded = Math.min(completedBytes + activeBytes, totalBytes);
                onprogress(createProgressEvent(true, loaded, totalBytes));
            };

            const updateChunkProgress = (chunk: UploadChunk, e: ProgressEvent) => {
                if (!e.lengthComputable) {
                    return;
                }

                activeChunkProgress.set(chunk.index, Math.min(e.loaded, chunk.size));
                reportUploadProgress();
            };

            if (signal?.aborted) {
                throw signal.reason;
            }

            // currently active uploads
            let activeUploads: Promise<void>[] = [];

            const queueChunkUpload = (chunk: UploadChunk, upload: Promise<UploadedChunk>) => {
                const activeUpload = upload
                    .then((uploadedChunk) => {
                        activeChunkProgress.delete(chunk.index);
                        completedBytes += chunk.size;
                        uploadedChunks.push(uploadedChunk);
                        reportUploadProgress();
                    })
                    .finally(() => {
                        activeUploads = activeUploads.filter((upload) => upload !== activeUpload);
                    });

                activeUploads.push(activeUpload);
            };

            reportUploadProgress();

            // start uploading
            for (const chunk of chunks) {
                // don't process next chunk when aborted
                if (signal?.aborted) {
                    throw signal.reason;
                }

                // errors handled by parent
                const chunkUploadPromise = uploadChunk(
                    chunk,
                    serverId,
                    {
                        uploadName,
                        uploadLength,
                    },
                    {
                        onprogress: (e) => updateChunkProgress(chunk, e),
                        signal,
                    },
                    entry
                );

                queueChunkUpload(chunk, chunkUploadPromise);

                // still room for more chunks to upload in parallel
                if (activeUploads.length < parallelChunks) {
                    continue;
                }

                // we've reached the maximum chunks to upload in parallel, wait for one to finish
                await Promise.race(activeUploads);
            }

            // wait for remaining uploads to finish
            await Promise.all(activeUploads);

            return uploadedChunks.sort((a, b) => a.index - b.index);
        }

        async function completeUpload(
            serverId: string,
            chunks: UploadedChunk[],
            options: { signal?: AbortSignal },
            entry: FilePondEntry
        ): Promise<string> {
            const {
                url,
                resolveRequest: { complete: resolveCompleteRequest },
                resolveResponse: { complete: resolveCompleteResponse = ({ value }) => value },
            } = props;
            const { signal } = options ?? {};

            if (!resolveCompleteRequest) {
                return serverId;
            }

            const resolvedRequest = await resolveCompleteRequest({
                url,
                options: {
                    method: 'POST',
                    data: JSON.stringify({ chunks }),
                    queryString: {
                        id: serverId,
                    },
                },
                entry,
                id: serverId,
                chunks,
            });
            const requestResponse = await xhr(resolvedRequest.url, {
                ...resolvedRequest.options,
                signal,
            });

            const value = resolveCompleteResponse({
                request: resolvedRequest,
                response: requestResponse,
                value:
                    isString(requestResponse.response) && requestResponse.response.length
                        ? requestResponse.response
                        : serverId,
                entry,
                id: serverId,
                chunks,
            });

            if (!isString(value) || !value.length) {
                throw new Error('No server id returned');
            }

            return value;
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
            let uploadedChunks: UploadedChunk[] = [];

            // start infinity spinner while we're gathering info from server
            onprogress(createProgressEvent());

            if (!serverId) {
                // get and remember server id for when we want to continue upload, if aborted during this action we revert entire save process
                serverId = await requestFileTransferId(entry.file, { signal }, entry);

                // need to remember this for when we want to continue upload at a later time
                storeServerId(entry, serverId);
            } else {
                // we already have server id, request upload status instead, if aborted during this action we revert entire save process
                try {
                    const uploadStatus = await requestFileUploadStatus(serverId, { signal }, entry);
                    uploadOffset = uploadStatus.offset ?? 0;
                    uploadedChunks = uploadStatus.chunks ?? [];
                } catch (error) {
                    if (didAbort(signal, error)) {
                        storeServerId(entry, serverId);
                    }
                    throw error;
                }
            }

            // start uploading chunks
            try {
                const chunksUploaded = await uploadChunks(
                    // get chunks that still need to be uploaded
                    chunks.filter((chunk) => {
                        const chunkUploaded = uploadedChunks.some(
                            (uploadedChunk) =>
                                uploadedChunk.index === chunk.index ||
                                uploadedChunk.offset === chunk.offset
                        );
                        return !chunkUploaded && chunk.offset >= uploadOffset;
                    }),

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

                uploadedChunks = [...uploadedChunks, ...chunksUploaded];
            } catch (error) {
                if (resume && didAbort(signal, error)) {
                    storeServerId(entry, serverId);
                }
                throw error;
            }

            return completeUpload(serverId, uploadedChunks, { signal }, entry);
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
                id: storageId,
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
            releaseEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ChunkedUploadStore: ChunkedUploadStoreOptions;
    }
    interface DefineFilePondOptions {
        ChunkedUploadStore?: ChunkedUploadStoreOptions;
    }
}
