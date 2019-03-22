import { sendRequest } from '../../utils/sendRequest';
import { createResponse } from '../../utils/createResponse';
import { createTimeoutResponse } from '../../utils/createDefaultResponse';
import { getFileFromBlob } from '../../utils/getFileFromBlob';
import { getFileInfoFromHeaders } from '../../utils/getFileInfoFromHeaders';
import { getFilenameFromURL } from '../../utils/getFilenameFromURL';

export const fetchLocal = (url, load, error, progress, abort, headers) => {
    const request = sendRequest(null, url, {
        method: 'GET',
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
                getFileFromBlob(xhr.response, filename),
                headers
            )
        )
    };

    request.onerror = (xhr) => {
        error(
            createResponse(
                'error',
                xhr.status,
                xhr.statusText,
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
    };

    request.ontimeout = createTimeoutResponse(error);
    request.onprogress = progress;
    request.onabort = abort;


    // should return request
    return request;
};
