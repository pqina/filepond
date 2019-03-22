import { sendRequest } from '../../utils/sendRequest';
import { createResponse } from '../../utils/createResponse';
import { createTimeoutResponse } from '../../utils/createDefaultResponse';
import { isString } from '../../utils/isString';
import { isObject } from '../../utils/isObject';

/*
function signature:
  (file, metadata, load, error, progress, abort) => {
    return {
    abort:() => {}
  }
}
*/
export const createProcessorFunction = (apiUrl = '', action, name) => {
    // custom handler (should also handle file, load, error, progress and abort)
    if (typeof action === 'function') {
        return (...params) => action(name, ...params);
    }

    // no action supplied
    if (!action || !isString(action.url)) {
        return null;
    }

    // internal handler
    return (file, metadata, load, error, progress, abort) => {
        
        // set onload hanlder
        const ondata = action.ondata || (fd => fd);
        const onload = action.onload || (res => res);
        const onerror = action.onerror || (res => null);

        // no file received
        if (!file) return;

        // create formdata object
        var formData = new FormData();

        // add metadata under same name  
        if (isObject(metadata)) { formData.append(name, JSON.stringify(metadata)); }

        // Turn into an array of objects so no matter what the input, we can handle it the same way
        (file instanceof Blob ? [{ name:null, file }] : file).forEach(item => {
            formData.append(name, item.file, item.name === null ? item.file.name : `${item.name}${item.file.name}`);
        });

        // send request object
        const request = sendRequest(ondata(formData), apiUrl + action.url, action);
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
};
