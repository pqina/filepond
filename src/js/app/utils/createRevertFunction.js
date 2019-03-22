import { sendRequest } from '../../utils/sendRequest';
import { createResponse } from '../../utils/createResponse';
import { createTimeoutResponse } from '../../utils/createDefaultResponse';
import { isString } from '../../utils/isString';

/*
 function signature:
 (uniqueFileId, load, error) => { }
 */
export const createRevertFunction = (apiUrl = '', action) => {
    // is custom implementation
    if (typeof action === 'function') {
        return action;
    }

    // no action supplied, return stub function, interface will work, but file won't be removed
    if (!action || !isString(action.url)) {
        return (uniqueFileId, load) => load();
    }

    // set onload hanlder
    const onload = action.onload || (res => res);
    const onerror = action.onerror || (res => null);

    // internal implementation
    return (uniqueFileId, load, error) => {
        const request = sendRequest(
            uniqueFileId,
            apiUrl + action.url,
            action // contains method, headers and withCredentials properties
        );
        request.onload = (xhr) => {
            load(
                createResponse(
                    'load',
                    xhr.status,
                    onload(xhr.response),
                    xhr.getAllResponseHeaders()
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

        request.ontimeout = createTimeoutResponse(error);

        return request;
    };
};
