import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import { arrayRemoveFalsy } from '../utils/array.js';

import { noop } from '../utils/placeholder.js';
import { isFileSystemDirectoryEntry, isFileSystemFileEntry, isFunction } from '../utils/test.js';
import { eachTree, mapTreeAsync } from '../utils/tree.js';
import { idleCallbackPromise } from '../utils/window.js';

/** Returns the root entry */
export function getDataTransferRoot(dataTransfer: DataTransfer): void | null | FileSystemEntry {
    // test if has items
    const { items } = dataTransfer ?? {};
    if (!items) {
        return;
    }

    return dataTransferItemsToEntries(items)[0];
}

/** Reads a DataTransfer item and returns a tree of entries */
export async function readEntriesFromDataTransfer(
    dataTransfer: DataTransfer,
    options: {
        onprogress: (progress: { loaded: number; total: number }) => void;
        signal?: AbortSignal;
    }
): Promise<any> {
    const { onprogress = noop, signal } = options ?? {};

    // test if has items
    const { items } = dataTransfer ?? {};
    if (!items) {
        return [];
    }

    // state
    let totalFileEntries = 0;
    let processedFileEntries = 0;

    // convert to entries
    const entries = dataTransferItemsToEntries(items);
    const entriesArray = await entriesToArray(entries, options);

    // aborted
    if (signal?.aborted) {
        throw signal.reason;
    }

    // count total files
    eachTree(entriesArray, (entry) => {
        if (!isFunction(entry)) {
            return;
        }

        totalFileEntries++;
    });

    // before start
    onprogress({ loaded: processedFileEntries, total: totalFileEntries });

    // reads all the files
    return await mapTreeAsync(
        entriesArray,
        async (entry) => {
            if (isFunction(entry)) {
                // aborted
                if (signal?.aborted) {
                    throw signal.reason;
                }

                // turn into file
                const res = await entry();

                // total processed entries
                processedFileEntries++;
                onprogress({ loaded: processedFileEntries, total: totalFileEntries });
                return res;
            }
            return entry;
        },
        'entries'
    );
}

async function entriesToArray(
    entries: (FileSystemEntry | null)[],
    options: {
        entryToFile?: (entry: FilePondFileEntry) => any;
        onprocessentry?: (entry: FileSystemEntry) => void;
        signal?: AbortSignal;
    }
): Promise<((() => Promise<File & { path?: string }>) | FilePondEntry)[]> {
    const { signal } = options ?? {};

    let entriesArray: ((() => Promise<File & { path?: string }>) | FilePondEntry)[] = [];

    for (const entry of entries) {
        // skip invalid entries
        if (!entry) {
            continue;
        }

        // aborted
        if (signal?.aborted) {
            throw signal.reason;
        }

        let item;
        if (isFileSystemDirectoryEntry(entry)) {
            item = {
                name: entry.name,
                path: entry.fullPath,
                entries: await entriesToArray(await readDirectory(entry), options),
            };
        } else if (isFileSystemFileEntry(entry)) {
            item = async () => {
                const file = await readFile(entry);
                file.path = entry.fullPath;
                return file;
            };
        } else {
            continue;
        }

        // @ts-ignore yay
        entriesArray.push(item);
    }

    return entriesArray;
}

/** Converts DataTransferEntries to FileSystemEntries */
export function dataTransferItemsToEntries(
    items: DataTransferItemList
): (FileSystemEntry | null)[] {
    return Array.from(items).map(getAsEntry);
}

/** Converts DataTransferEntries to File[] */
export function dataTransferItemsToFiles(items: DataTransferItemList): (File | null)[] {
    return Array.from(items).map(getAsFile);
}

/** Abstract away _webkit_ from main code */
export function getAsEntry(item: DataTransferItem): FileSystemEntry | null {
    return item.webkitGetAsEntry();
}

export function getAsFile(item: DataTransferItem): File | null {
    return item.getAsFile();
}

export async function readDirectory(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    const dirReader = entry.createReader();
    const entries = [];

    while (true) {
        const results = await new Promise((resolve: FileSystemEntriesCallback, reject) => {
            dirReader.readEntries(resolve, reject);
        });

        if (!results.length) {
            break;
        }

        for (const entry of results) {
            entries.push(entry);
        }
    }

    return entries;
}
async function readFile(entry: FileSystemFileEntry): Promise<File & { path?: string }> {
    // so UI stays responsive
    await idleCallbackPromise();

    // to file object
    return getFileFromEntry(entry);
}

async function getFileFromEntry(entry: FileSystemFileEntry): Promise<File & { path?: string }> {
    return new Promise((resolve) => entry.file(resolve));
}

export function shouldLoadWithIdleCallback(dataTransfer: DataTransfer) {
    // we need to know how many entries are in the DataTransfer, if it's just a couple files we don't show the loading indicator
    const entries = dataTransferItemsToEntries(dataTransfer.items);

    // need to show entry loader when includes directories or more than 10 items
    return entries.some(isFileSystemDirectoryEntry) || entries.length > 10;
}

export async function dataTransferToFiles(dataTransfer: DataTransfer): Promise<(File | null)[]> {
    // we need to know how many entries are in the DataTransfer, if it's just a couple files we don't show the loading indicator
    let entries = dataTransferItemsToEntries(dataTransfer.items);

    // no entries received, let's check files
    if (arrayRemoveFalsy(entries).length === 0) {
        return dataTransferItemsToFiles(dataTransfer.items);
    }

    const res = [];
    const promises = [];
    for (const entry of entries) {
        if (isFileSystemFileEntry(entry)) {
            promises.push(getFileFromEntry(entry));
        }
    }
    res.push(...(await Promise.all(promises)));

    return res;
}
