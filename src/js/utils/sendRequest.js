import { isInt } from './isInt';

const isGet = method => /GET|HEAD/.test(method);

export const sendRequest = (data, url, options) => {
    const api = {
        onheaders: () => {},
        onprogress: () => {},
        onload: () => {},
        ontimeout: () => {},
        onerror: () => {},
        onabort: () => {},
        abort: () => {
            aborted = true;
            xhr.abort();
        }
    };

    // timeout identifier, only used when timeout is defined
    let aborted = false;
    let headersReceived = false;

    // set default options
    options = {
        method: 'POST',
        headers: {},
        withCredentials: false,
        ...options
    };

    // encode url
    url = encodeURI(url);

    // if method is GET, add any received data to url
    
    if (isGet(options.method) && data) {
        url = `${url}${encodeURIComponent(
            typeof data === 'string' ? data : JSON.stringify(data)
        )}`;
    }

    // create request
    const xhr = new XMLHttpRequest();

    // progress of load
    const process = isGet(options.method) ? xhr : xhr.upload;
    process.onprogress = e => {
        
        // no progress event when aborted ( onprogress is called once after abort() )
        if (aborted) {
            return;
        }

        api.onprogress(e.lengthComputable, e.loaded, e.total);
    };

    // tries to get header info to the app as fast as possible
    xhr.onreadystatechange = () => {
        // not interesting in these states ('unsent' and 'openend' as they don't give us any additional info)
        if (xhr.readyState < 2) {
            return;
        }

        // no server response
        if (xhr.readyState === 4 && xhr.status === 0) {
            return;
        }

        if (headersReceived) {
            return;
        }

        headersReceived = true;

        // we've probably received some useful data in response headers
        api.onheaders(xhr);
    };

    // load successful
    xhr.onload = () => {
        
        // is classified as valid response
        if (xhr.status >= 200 && xhr.status < 300) {
            api.onload(xhr);
        } else {
            api.onerror(xhr);
        }
    };

    // error during load
    xhr.onerror = () => api.onerror(xhr);

    // request aborted
    xhr.onabort = () => {
        aborted = true;
        api.onabort();
    };

    // request timeout
    xhr.ontimeout = () => api.ontimeout(xhr);

    // open up open up!
    xhr.open(options.method, url, true);

    // set timeout if defined (do it after open so IE11 plays ball)
    if (isInt(options.timeout)) {
        xhr.timeout = options.timeout;
    }

    // add headers
    Object.keys(options.headers).forEach(key => {
        const value = unescape(encodeURIComponent(options.headers[key]));
        xhr.setRequestHeader(key, value);
    });

    // set type of response
    if (options.responseType) {
        xhr.responseType = options.responseType;
    }

    // set credentials
    if (options.withCredentials) {
        xhr.withCredentials = true;
    }

    // let's send our data
    xhr.send(data);

    return api;
};