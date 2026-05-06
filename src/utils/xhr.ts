import { toCamelCase, toKebabCase } from './string.js';
import { toURL } from './url.js';
import { noop } from './placeholder.js';
import { createThreadWorker, thread } from './thread.js';
import { arrayRemoveFalsy } from './array.js';
import { httpRequest, type RequestResponse } from '../workers/httpRequest.js';

interface XHROptions {
    signal?: AbortSignal;
    data?: any;
    formData?: ([string, string] | [string, File] | [string, File, string])[];
    queryString?: { [key: string]: string | number };
    headers?: { [key: string]: string | number };
    method?: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'DELETE' | 'PATCH';
    responseType?: XMLHttpRequestResponseType;
    onprogress?: (e: ProgressEvent) => void;
    onabort?: () => void;
    withCredentials?: boolean;
    timeout?: number;
    useWebWorkers?: boolean;
    workersURL?: URL;
}

export interface XHRResponse {
    response: string | Blob;
    getAllResponseHeaders: () => string;
}

export function xhr(url: string, options?: XHROptions): Promise<XHRResponse> {
    const {
        method,
        queryString,
        headers,
        data,
        formData,
        responseType,
        withCredentials,
        timeout,
        useWebWorkers = false,
        workersURL,
        signal,
        onprogress = noop,
        onabort = noop,
    } = options ?? {};

    const requestParameters = {
        url: toRequestURL(url, queryString),
        responseType,
        method,
        headers: Object.entries(headers ?? {}).map(([name, value]) => [
            toKebabCase(name),
            `${value}`,
        ]),
        data,
        formData,
        timeout,
        withCredentials,
    };

    const requestOptions = { signal, onprogress, onabort };

    function xhrResponse(request: Promise<RequestResponse>): Promise<XHRResponse> {
        return new Promise((resolve, reject) => {
            request
                .then((res: RequestResponse) => {
                    resolve({
                        getAllResponseHeaders: () => {
                            return res.responseHeaders;
                        },
                        response: res.response,
                    });
                })
                .catch(reject);
        });
    }

    if (useWebWorkers) {
        // @ts-ignore fix types
        return xhrResponse(
            // @ts-ignore fix types
            thread(createThreadWorker(workersURL, httpRequest), [requestParameters], requestOptions)
        );
    }

    return xhrResponse(
        new Promise((resolve, reject) =>
            // httpRequest()
            httpRequest(
                requestParameters,
                (err, response) => {
                    if (err) {
                        reject(new Error(err));
                        return;
                    }
                    resolve(response as RequestResponse);
                },
                requestOptions
            )
        )
    );
}

/** Creates serializable request URL */
function toRequestURL(url: string, queryString: { [key: string]: string | number } = {}) {
    const requestURL = toURL(url);
    Object.entries(queryString).forEach(([name, value]) =>
        requestURL.searchParams.append(name, `${value}`)
    );
    return `${requestURL}`;
}

/** Creates a ProgressEvent */
export function createProgressEvent(
    lengthComputable?: boolean | undefined,
    loaded?: number | undefined,
    total?: number | undefined
) {
    return new ProgressEvent('progress', {
        lengthComputable: lengthComputable || false,
        loaded: lengthComputable ? (loaded && total === 1 ? loaded * 100 : loaded) : 0,
        total: lengthComputable ? (total === 1 ? 100 : total) : 0,
    });
}

export function getResponseHeaders(xhr: XHRResponse): { [key: string]: string } {
    if (!xhr) {
        return {};
    }

    const headers = arrayRemoveFalsy(
        xhr
            .getAllResponseHeaders()
            .split('\n')
            .map((header) => {
                const res = header.match(/(^.*?):/) || [];
                const [str, name] = res;
                if (!str) {
                    return;
                }
                const value = header.replace(str, '').trim();
                return [name, value];
            })
    ).reduce(
        (obj, header) => {
            const [name, value] = header as string[];
            obj[toCamelCase(name)] = value;
            return obj;
        },
        {} as { [key: string]: string }
    );
    return headers;
}

/** Finds ContentDisposition header and extracts filename */
export function getFilenameFromResponseHeaders(headers: { [key: string]: string }): string | null {
    const { contentDisposition } = headers;

    // empty or missing header
    if (!contentDisposition || !contentDisposition.length) {
        return null;
    }

    // content disposition header found, let's try to get filename from it
    return getFilenameFromContentDispositionHeader(contentDisposition);
}

export function getFilenameFromContentDispositionHeader(header: string): string | null {
    if (!header.toLowerCase().startsWith('attachment')) {
        return null;
    }

    const matches = header
        .split(/filename=|filename\*=.+''/i)
        .splice(1)
        .map((name) => name.trim().replace(/^["']|[;"']{0,2}$/g, ''))
        .filter((name) => name.length);

    return matches.length ? decodeURI(matches[matches.length - 1]) : null;
}

export function getResponseHeaderValue(name: string, headers: string): undefined | string {
    const header = headers
        .toLowerCase()
        .split('\n')
        .find((header) => {
            return header.includes(name);
        });
    return header ? header.split(':')[1].trim() : undefined;
}
