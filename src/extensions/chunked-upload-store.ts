import { createStoreExtension } from './common/createStoreExtension.js';
import { isFile, isFileEntry, isNumber, isString } from '../utils/test.js';
import { toURL } from '../utils/url.js';
import { naturalFileSizeToBytes } from '../utils/file.js';
import { noop } from '../utils/placeholder.js';
import { sleep } from '../utils/sleep.js';
import { xhr, createProgressEvent, getResponseHeaders } from '../utils/xhr.js';
import { warn } from '../common/console.js';
import type {
    StoreTaskFnOptions,
    StoreExtensionOptions,
    PerceivedPerformanceOptions,
} from './common/createStoreExtension.js';
import type { RequestHook, FilePondEntry, FilePondFileEntry } from '../types/index.js';

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

    /** If an upload is really fast, will show simulated progress to instill confidence in upload */
    perceivedPerformance?: boolean | PerceivedPerformanceOptions;

    /** Intercept options sent to XMLHttpRequest */
    willRequestWithOptions?: RequestHook;
}

export const ChunkedUploadStore = createStoreExtension(
    'ChunkedUploadStore',
    {
        url: '',
        chunkSize: Infinity,
        retryDelays: [500, 1000, 3000],
        resume: false,
        parallelChunks: 2,
        willRequestWithOptions: (src, options, entry) => options,
    } as ChunkedUploadStoreOptions,
    ({ props, didSetProps }, { updateEntry }) => {
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
            options: { abortController?: AbortController; onabort: () => void },
            entry: FilePondEntry
        ): Promise<string> {
            const { url, willRequestWithOptions } = props;
            const { abortController, onabort } = options ?? {};

            const requestOptions = {
                method: 'POST',
                headers: {
                    uploadLength: file.size,
                },
            };

            const request = await xhr(url, {
                ...(willRequestWithOptions(url, requestOptions, entry) ?? requestOptions),
                abortController,
                onabort,
            });

            if (!isString(request.response) || !request.response.length) {
                throw new Error('No server id returned');
            }

            return request.response;
        }

        async function requestFileChunkOffset(
            serverId: string,
            options: { abortController?: AbortController; onabort: () => void },
            entry: FilePondEntry
        ): Promise<number> {
            const { url, willRequestWithOptions } = props;
            const { abortController, onabort } = options ?? {};

            const requestOptions = {
                method: 'HEAD',
                queryString: {
                    id: serverId,
                },
            };

            const request = await xhr(url, {
                ...(willRequestWithOptions(url, requestOptions, entry) ?? requestOptions),
                abortController,
                onabort,
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
            options: { abortController?: AbortController; onabort: () => void },
            entry: FilePondEntry
        ): Promise<boolean | void> {
            const { url, retryDelays, willRequestWithOptions } = props;
            const { abortController, onabort } = options ?? {};
            for (const delay of [...retryDelays, undefined]) {
                try {
                    // upload chunk patch
                    const requestOptions = {
                        method: 'PATCH',
                        headers,
                        data,
                        queryString: {
                            contentType: 'application/offset+octet-stream',
                            id: serverId,
                        },
                    };

                    await xhr(url, {
                        ...(willRequestWithOptions(url, requestOptions, entry) ?? requestOptions),
                        onabort,
                        abortController,
                    });

                    // success
                    return true;
                } catch (error) {
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
                abortController?: AbortController;
                onabort?: () => void;
            },
            entry: FilePondEntry
        ): Promise<void> {
            const { parallelChunks } = props;
            const { onprogress = noop, onabort = noop, abortController } = options ?? {};

            // prevents handling next chunk when abort is called
            let didAbort = false;

            // observe progress
            const unobserveUploadProgress = observeUploadProgress(
                serverId,
                parseInt(uploadLength, 10),
                onprogress
            );

            // currently active uploads
            let activeUploads: Promise<boolean | void>[] = [];

            // start uploading
            for (const [chunkOffset, chunkData] of chunks) {
                // don't process next chunk when aborted
                if (didAbort) {
                    return;
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
                        abortController,
                        onabort: () => {
                            didAbort = true;
                            unobserveUploadProgress();
                            onabort();
                        },
                    },
                    entry
                );

                // we remember this upload
                activeUploads.push(chunkUploadPromise);

                // still room for more chunks to upload in parallel
                if (activeUploads.length < parallelChunks) continue;

                // we've reached the maximum chunks we can upload in parallel we have to wait for one of the chunks to finish uploading
                await Promise.race(activeUploads);

                // filter out resolved promises
                const remainingUploads: Promise<boolean | void>[] = [];
                for (const upload of activeUploads) {
                    const res = await upload;
                    if (res === true) continue;
                    activeUploads.push(upload);
                }
                activeUploads = [...remainingUploads];
            }

            // done uploading, let's stop progress observer
            unobserveUploadProgress();
        }

        async function storeEntry(
            entry: FilePondFileEntry,
            { abortController, onprogress, onabort }: StoreTaskFnOptions
        ) {
            // Needs to be of type File
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // create file chunks
            const chunks = getChunksForFile(entry.file);

            // get server id
            const { valueKey } = props;
            let serverId = entry.state[valueKey];
            let uploadOffset = 0;

            // start inifinity spinner while where gathering info from server
            onprogress(createProgressEvent());

            if (!serverId) {
                // get and remember server id for when we want to resume, if aborted during this action we revert entire save process
                serverId = await requestFileTransferId(
                    entry.file,
                    { abortController, onabort },
                    entry
                );

                // need to remember this for when we want to resume
                storeServerId(entry, serverId);
            } else {
                // we already have server id, request upload offset of next chunk instead, if aborted during this action we revert entire save process
                uploadOffset = await requestFileChunkOffset(
                    serverId,
                    {
                        abortController,
                        onabort: () => {
                            // this call will reset state and remove server id
                            onabort();

                            // now restore server id
                            storeServerId(entry, serverId);
                        },
                    },
                    entry
                );
            }

            // start uploading chunks
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
                    abortController,
                    onabort: () => {
                        // this will reset the save state to false
                        onabort();

                        // if is soft abort we store the sid so we can resume later on
                        const { resume } = props;
                        if (resume) storeServerId(entry, serverId);
                    },
                },

                // entry reference
                entry
            );

            return serverId;
        }

        async function releaseEntry(storageId: string, entry: FilePondFileEntry) {
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
            releaseEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        ChunkedUploadStore: ChunkedUploadStoreOptions;
    }
    interface defineFilePondOptions {
        ChunkedUploadStore: ChunkedUploadStoreOptions;
    }
}
