import type { FilePondFileEntry, FilePondDirectoryEntry, DynamicLocale } from '../types/index.js';
import { hasOwnProp } from './object.js';

/** Stores test results locally */
export function createTest(test: () => boolean, requireBrowser = true) {
    let result: null | boolean = null;
    return () => {
        if (requireBrowser && !isBrowser()) {
            return false;
        }
        if (result === null) result = test();
        return result;
    };
}

/** Tests if value is null */
export function isNull(value: unknown): value is null {
    return value === null;
}

/** Tests if value is undefined */
export function isUndefined(value: unknown): value is undefined {
    return value === undefined;
}

/** Tests if value is null or undefined */
export function isNullOrUndefined(value: unknown): value is null | undefined {
    return value == null;
}

/** Tests if value is a string */
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/** Tests if value is a number */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

/** Tests if value is boolean */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/** Tests if value is function */
export function isFunction(value: unknown): value is Function {
    return typeof value === 'function';
}

/** Tests if value is HTML element */
export function isElement(value: unknown): value is HTMLElement {
    return value instanceof HTMLElement;
}

export function isURL(value: string | URL): value is URL {
    let url;
    try {
        url = new URL(value);
    } catch (_) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}

export function isRegExp(value: unknown): value is RegExp {
    return value instanceof RegExp;
}

export function isPromise(value: unknown): value is Promise<unknown> {
    // @ts-ignore
    return isObject(value) && isFunction(value.then);
}

export function isObjectLiteral(value: unknown): value is { [key: string]: any } {
    return Object.getPrototypeOf(value) === Object.prototype;
}

/** Tests if value an object and not an array, string, or number */
export function isObject(value: unknown): value is object {
    return (value && typeof value === 'object' && !Array.isArray(value)) as boolean;
}

/** Tests if value is an object or an array */
export function isObjectOrArray(value: unknown): value is object {
    return (value && typeof value === 'object') as boolean;
}

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

export function isDataURL(value: unknown): value is string {
    return isString(value) && /data:/.test(value);
}

export function isCanvas(value: unknown): value is HTMLCanvasElement {
    return value instanceof HTMLCanvasElement;
}

export function isBlobOrFile(value: unknown): value is Blob {
    return value instanceof Blob;
}

export function isBlob(value: unknown): value is Blob {
    return value instanceof Blob && !isFile(value);
}

export function isFile(value: unknown): value is File {
    return value instanceof File;
}

export function isDataTransfer(value: unknown): value is DataTransfer {
    return value instanceof DataTransfer;
}

/** Tests if mimetype includes /video/ */
export function isVideoFile(value: unknown): value is File {
    return !!(isBlobOrFile(value) && /video/i.test(value.type));
}

/** Tests if mimetype includes /image/ */
export function isImageFile(value: unknown): value is File {
    return !!(isBlobOrFile(value) && /image/i.test(value.type));
}

/** Tests if mimetype includes /audio/ */
export function isAudioFile(value: unknown): value is File {
    return !!(isBlobOrFile(value) && /audio/i.test(value.type));
}

export function isDataTransferEntry(value: any): value is FilePondFileEntry {
    return isDataTransfer(value.src);
}

export function isLocaleUnitKey(value: any): value is string {
    return isString(value) && value.startsWith('unit');
}

export function isLocaleTemplate(value: any): value is DynamicLocale {
    return hasOwnProp(value, 'template');
}

export function isFileEntry(value: unknown): value is FilePondFileEntry {
    return !!(value && isObjectLiteral(value) && !isArray(value.entries));
}

export function isDirectoryEntry(value: unknown): value is FilePondDirectoryEntry {
    return !!(value && isObjectLiteral(value) && isArray(value.entries));
}

export function isFileSystemDirectoryEntry(value: any): value is FileSystemDirectoryEntry {
    return value?.isDirectory;
}

export function isFileSystemFileEntry(value: any): value is FileSystemFileEntry {
    return value?.isFile;
}

export function isGroupEntry(value: any): value is FilePondDirectoryEntry {
    return value && isArray(value.entries);
}

/** Tests if current environment is a browser */
export function isBrowser() {
    if (isBrowserResult === null) {
        isBrowserResult = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    }
    return isBrowserResult;
}

let isBrowserResult: boolean | null = null;

/** Tests if current environment is Safari browser */
export const isSafari = createTest(() => {
    return /^((?!chrome|android).)*(safari|iphone|ipad)/i.test(navigator.userAgent); // added |iphone|ipad as safari is not present in WebView on React Native
});

/** Tests if current environment is Firefox browser */
export const isFirefox = createTest(() => {
    return /Firefox/.test(navigator.userAgent);
});

/** Tests if current environment is iOS */
export const isIOS = createTest(() => {
    return (
        /iPhone|iPad|iPod/.test(navigator.userAgent) || (isMac() && navigator.maxTouchPoints >= 1)
    );
});

/** Tests if current environment is Mac */
export const isMac = createTest(() => {
    // @ts-ignore
    const { platform } = 'userAgentData' in navigator ? navigator.userAgentData : navigator;
    return /^mac/i.test(platform);
});
