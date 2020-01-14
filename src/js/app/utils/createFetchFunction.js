import { sendRequest } from '../../utils/sendRequest';
import { createResponse } from '../../utils/createResponse';
import { createTimeoutResponse } from '../../utils/createDefaultResponse';
import { getFileInfoFromHeaders } from '../../utils/getFileInfoFromHeaders';
import { getFilenameFromURL } from '../../utils/getFilenameFromURL';
import { getFileFromBlob } from '../../utils/getFileFromBlob';
import { isString } from '../../utils/isString';
import { buildURL } from './buildURL';

export const createFetchFunction = (apiUrl = '', action) => {
    // custom handler (should also handle file, load, error, progress and abort)
    if (typeof action === 'function') {
        return action;
    }

    // no action supplied
    if (!action || !isString(action.url)) {
        return null;
    }

    // set onload hanlder
    const onload = action.onload || (res => res);
    const onerror = action.onerror || (res => null);

    // internal handler
    return (url, load, error, progress, abort, headers) => {
        
        // do local or remote request based on if the url is external
        const request = sendRequest(url, buildURL(apiUrl, action.url), {
            ...action,
            responseType: 'blob'
        });

        request.onload = (xhr) => {
            
            // get headers
            const headers = xhr.getAllResponseHeaders();
            
            // get filename
            const filename = getFileInfoFromHeaders(headers).name || getFilenameFromURL(url);

            // create response
            load(
                createResponse(
                    'load',
                    xhr.status,
                    getFileFromBlob(onload(xhr.response), filename),
                    headers
                )
            )
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

        request.onheaders = (xhr) => {
            headers(
                createResponse(
                    'headers',
                    xhr.status,
                    null,
                    xhr.getAllResponseHeaders()
                )
            )
        }

        request.ontimeout = createTimeoutResponse(error);
        request.onprogress = progress;
        request.onabort = abort;

        // should return request
        return request;
    };
};
