/* so we can search for console. to find stray logging */

export function warn(...args: any) {
    console['warn'](...args);
}

export function log(...args: any) {
    console['log'](...args);
}

export function clear() {
    console['clear']();
}
