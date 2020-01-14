import { sendRequest } from '../../utils/sendRequest';
import { createResponse } from '../../utils/createResponse';
import { createTimeoutResponse } from '../../utils/createDefaultResponse';
import { isObject } from '../../utils/isObject';
import { buildURL } from './buildURL';

import { processFileChunked } from './processFileChunked';

/*
function signature:
  (file, metadata, load, error, progress, abort) => {
    return {
    abort:() => {}
  }
}
*/
export const createFileProcessorFunction = (apiUrl, action, name, options) => (file, metadata, load, error, progress, abort, transfer) => {

    // no file received
    if (!file) return;

    // if was passed a file, and we can chunk it, exit here
    const canChunkUpload = options.chunkUploads;
    const shouldChunkUpload = canChunkUpload && file.size > options.chunkSize;
    const willChunkUpload = canChunkUpload && (shouldChunkUpload || options.chunkForce);
    if (file instanceof Blob && willChunkUpload) return processFileChunked(apiUrl, action, name, file, metadata, load, error, progress, abort, transfer, options);
    
    // set handlers
    const ondata = action.ondata || (fd => fd);
    const onload = action.onload || (res => res);
    const onerror = action.onerror || (res => null);

    // create formdata object
    var formData = new FormData();

    // add metadata under same name
    if (isObject(metadata)) { formData.append(name, JSON.stringify(metadata)); }

    // Turn into an array of objects so no matter what the input, we can handle it the same way
    (file instanceof Blob ? [{ name: null, file }] : file).forEach(item => {
        formData.append(name, item.file, item.name === null ? item.file.name : `${item.name}${item.file.name}`);
    });

    // send request object
    const request = sendRequest(ondata(formData), buildURL(apiUrl, action.url), action);
    request.onload = (xhr) => {
        load(
            createResponse(
                'load',
                xhr.status,
                onload(xhr.response),
                xhr.getAllResponseHeaders()
            )
        );
    };

    request.onerror = (xhr) => {
        error(
            createResponse(
                'error',
                xhr.status,
                onerror(xhr.response) || xhr.statusText,
                xhr.getAllResponseHeaders()
            )
        );
    };

    request.ontimeout = createTimeoutResponse(error);
    request.onprogress = progress;
    request.onabort = abort;

    // should return request
    return request;
};