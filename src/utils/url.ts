import { isBrowser, isURL } from './test.js';

export function getFilenameFromURL(v = '') {
    const url = toURL(v);
    return url.pathname.split('/').pop();
}

export function urlToFilename(url: string) {
    return url
        .split('?')[0]
        .split('/')
        .filter((str) => str.length)
        .slice(-1)[0];
}

/** Converts a string in a URL */
export function toURL(v: string | URL): URL {
    if (isURL(v)) {
        return v instanceof URL ? v : new URL(v);
    }

    return new URL(v, location?.href);
}
