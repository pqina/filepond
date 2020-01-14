import { sendRequest } from '../../utils/sendRequest';
import { createResponse } from '../../utils/createResponse';
import { createTimeoutResponse } from '../../utils/createDefaultResponse';
import { isObject } from '../../utils/isObject';
import { buildURL } from './buildURL';
import { ChunkStatus } from '../enum/ChunkStatus';

/*
function signature:
  (file, metadata, load, error, progress, abort, transfer, options) => {
    return {
    abort:() => {}
  }
}
*/

// apiUrl, action, name, file, metadata, load, error, progress, abort, transfer, options
export const processFileChunked = (apiUrl, action, name, file, metadata, load, error, progress, abort, transfer, options) => {

    // all chunks
    const chunks = [];
    const { chunkTransferId, chunkServer, chunkSize, chunkRetryDelays } = options;
    
    // default state
    const state = {
        serverId: chunkTransferId,
        aborted: false
    };

    // set onload handlers
    const ondata = action.ondata || (fd => fd);
    const onload = action.onload || ((xhr, method) => method === 'HEAD' ? xhr.getResponseHeader('Upload-Offset') : xhr.response);
    const onerror = action.onerror || (res => null);

    // create server hook
    const requestTransferId = cb => {

        const formData = new FormData();
        
        // add metadata under same name
        if (isObject(metadata)) formData.append(name, JSON.stringify(metadata));
        
        const headers = typeof action.headers === 'function' ? action.headers(file, metadata) : {
            ...action.headers,
            'Upload-Length': file.size
        };

        const requestParams = {
            ...action,
            headers
        };

        // send request object
        const request = sendRequest(ondata(formData), buildURL(apiUrl, action.url), requestParams);

        request.onload = (xhr) => cb(onload(xhr, requestParams.method));

        request.onerror = (xhr) => error(
            createResponse(
                'error',
                xhr.status,
                onerror(xhr.response) || xhr.statusText,
                xhr.getAllResponseHeaders()
            )
        );

        request.ontimeout = createTimeoutResponse(error);
    }

    const requestTransferOffset = cb => {

        const requestUrl = buildURL(apiUrl, chunkServer.url, state.serverId);
        
        const headers = typeof action.headers === 'function' ? action.headers(state.serverId) : {
            ...action.headers
        };
        
        const requestParams = {
            headers,
            method: 'HEAD'
        };

        const request = sendRequest(null, requestUrl, requestParams);

        request.onload = (xhr) => cb(onload(xhr, requestParams.method));

        request.onerror = (xhr) => error(
            createResponse(
                'error',
                xhr.status,
                onerror(xhr.response) || xhr.statusText,
                xhr.getAllResponseHeaders()
            )
        );

        request.ontimeout = createTimeoutResponse(error);
    }

	// create chunks
    const lastChunkIndex = Math.floor(file.size / chunkSize);
	for (let i = 0; i <= lastChunkIndex; i++) {
        const offset = i * chunkSize;
        const data = file.slice(offset, offset + chunkSize, 'application/offset+octet-stream');
        chunks[i] = {
            index: i,
            size: data.size,
            offset,
            data,
            file,
            progress: 0,
            retries: [...chunkRetryDelays],
            status: ChunkStatus.QUEUED,
            error: null,
            request: null,
            timeout: null
        }
    }

    const completeProcessingChunks = () => load(state.serverId);

    const canProcessChunk = chunk => chunk.status === ChunkStatus.QUEUED || chunk.status === ChunkStatus.ERROR;

    const processChunk = (chunk) => {

        // processing is paused, wait here
        if (state.aborted) return;
        
        // get next chunk to process
        chunk = chunk || chunks.find(canProcessChunk);

        // no more chunks to process
        if (!chunk) {

            // all done?
            if (chunks.every(chunk => chunk.status === ChunkStatus.COMPLETE)) {
                completeProcessingChunks();
            }

            // no chunk to handle
            return;
        };

        // now processing this chunk
        chunk.status = ChunkStatus.PROCESSING;
        chunk.progress = null;

        // allow parsing of formdata
        const ondata = chunkServer.ondata || (fd => fd);
        const onerror = chunkServer.onerror || (res => null);

        // send request object
        const requestUrl = buildURL(apiUrl, chunkServer.url, state.serverId);

        const headers = typeof chunkServer.headers === 'function' ? chunkServer.headers(chunk) : {
            ...chunkServer.headers,
            'Content-Type': 'application/offset+octet-stream',
            'Upload-Offset': chunk.offset,
            'Upload-Length': file.size,
            'Upload-Name': file.name
        };

        const request = chunk.request = sendRequest(ondata(chunk.data), requestUrl, {
            ...chunkServer,
            headers
        });

        request.onload = () => {
            
            // done!
            chunk.status = ChunkStatus.COMPLETE;

            // remove request reference
            chunk.request = null;

            // start processing more chunks
            processChunks();
        };

        request.onprogress = (lengthComputable, loaded, total) => {
            chunk.progress = lengthComputable ? loaded : null;
            updateTotalProgress();
        };

        request.onerror = (xhr) => {
            chunk.status = ChunkStatus.ERROR;
            chunk.request = null;
            chunk.error = onerror(xhr.response) || xhr.statusText;
            if (!retryProcessChunk(chunk)) {
                error(
                    createResponse(
                        'error',
                        xhr.status,
                        onerror(xhr.response) || xhr.statusText,
                        xhr.getAllResponseHeaders()
                    )
                );
            }
        };

        request.ontimeout = (xhr) => {
            chunk.status = ChunkStatus.ERROR;
            chunk.request = null;
            if (!retryProcessChunk(chunk)) {
                createTimeoutResponse(error)(xhr);
            }
        };

        request.onabort = () => {
            chunk.status = ChunkStatus.QUEUED;
            chunk.request = null;
            abort();
        };

    }

    const retryProcessChunk = (chunk) => {

        // no more retries left
        if (chunk.retries.length === 0) return false;

        // new retry
        chunk.status = ChunkStatus.WAITING;
        clearTimeout(chunk.timeout);
        chunk.timeout = setTimeout(() => {
            processChunk(chunk);
        }, chunk.retries.shift());
        
        // we're going to retry
        return true;
    }

    const updateTotalProgress = () => {

        // calculate total progress fraction
        const totalBytesTransfered = chunks.reduce((p, chunk) => {
            if (p === null || chunk.progress === null) return null;
            return p + chunk.progress;
        }, 0);

        // can't compute progress
        if (totalBytesTransfered === null) return progress(false, 0, 0);

        // calculate progress values
        const totalSize = chunks.reduce((total, chunk) => total + chunk.size, 0);

        // can update progress indicator
        progress(true, totalBytesTransfered, totalSize)
    }

    // process new chunks
    const processChunks = () => {
        const totalProcessing = chunks.filter(chunk => chunk.status === ChunkStatus.PROCESSING).length;
        if (totalProcessing >= 1) return;
        processChunk();
    };
    
    const abortChunks = () => {
        chunks.forEach(chunk => {
            clearTimeout(chunk.timeout);
            if (chunk.request) {
                chunk.request.abort()
            }
        })
    };

    // let's go!
    if (!state.serverId) {
        requestTransferId(serverId => {

            // stop here if aborted, might have happened in between request and callback
            if (state.aborted) return;

            // pass back to item so we can use it if something goes wrong
            transfer(serverId);

            // store internally
            state.serverId = serverId;
            processChunks();
        })
    }
    else {
        requestTransferOffset(offset => {

            // stop here if aborted, might have happened in between request and callback
            if (state.aborted) return;

            // mark chunks with lower offset as complete
            chunks.filter(chunk => chunk.offset < offset)
                .forEach(chunk => {
                    chunk.status = ChunkStatus.COMPLETE;
                    chunk.progress = chunk.size;
                }
            );

            // continue processing
            processChunks();
        })
    }
    
    return {
        abort: () => {
            state.aborted = true;
            abortChunks();
        }
    } 
};
