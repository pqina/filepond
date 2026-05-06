export interface RequestParams {
    url: string;
    method: string | undefined;
    responseType: XMLHttpRequestResponseType | undefined;
    formData?: any;
    data?: any;
    headers: string[][];
    timeout?: number;
    withCredentials: boolean | undefined;
}

export interface RequestResponse {
    response: string;
    responseHeaders: string;
}

export interface RequestOptions {
    signal?: AbortSignal;
    onprogress: (e: ProgressEvent) => void;
    onabort: () => void;
}

export function httpRequest(
    {
        url,
        method = 'GET',
        formData,
        data,
        headers = [],
        timeout = 0,
        withCredentials = false,
        responseType = 'text',
    }: RequestParams,
    cb: (error: string | null, response?: RequestResponse, transferList?: Transferable[]) => void,
    { signal, onprogress, onabort }: RequestOptions
) {
    // handling abort
    if (signal?.aborted) {
        onabort();
        return;
    }

    function didAbort() {
        request.abort();
    }

    signal?.addEventListener('abort', didAbort, { once: true });

    function release() {
        signal?.removeEventListener('abort', didAbort);
    }

    /** Default error response */
    function respondWithError() {
        cb(request.status + ' (' + request.statusText + ')');
    }

    /** Default data response */
    function respondWithData() {
        const data = {
            response: request.response,
            responseHeaders: request.getAllResponseHeaders(),
        };
        cb(null, data, typeof data.response !== 'string' ? [data.response] : undefined);
    }

    function toFormData(rows: ([string, string] | [string, Blob, string])[]) {
        const fd = new FormData();
        rows.filter(Boolean).forEach((row) => {
            // @ts-ignore
            fd.append(...row);
        });
        return fd;
    }

    // build request
    const request = new XMLHttpRequest();
    request.responseType = responseType;

    const dataToSend = data ? data : formData ? toFormData(formData) : null;

    // if we're uploading data, then
    (dataToSend ? request.upload : request).onprogress = onprogress;

    request.onload = () => {
        release();
        request.status >= 200 && request.status < 300 ? respondWithData() : respondWithError();
    };

    request.onerror = () => {
        release();
        respondWithError();
    };
    request.ontimeout = () => {
        release();
        respondWithError();
    };
    request.onabort = () => {
        release();
        onabort();
    };

    request.open(dataToSend && (method === 'GET' || method === 'HEAD') ? 'POST' : method, url);

    request.withCredentials = withCredentials;
    request.timeout = timeout;

    headers.forEach(([name, value]) => request.setRequestHeader(name, value));

    request.send(dataToSend);
}

httpRequest.fileName = 'httpRequest';
