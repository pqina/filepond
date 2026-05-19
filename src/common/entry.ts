import type { FilePondEntry } from '../types/index.js';
import type { ExtensionState } from '../extensions/common/createExtension.js';
import { getExtensionFromMimeType } from '../utils/file.js';
import { Status } from './status.js';

type MimeTypeMap = { [extension: string]: string };

interface GetFilenameOptions {
    getBasename: (entry: FilePondEntry, blob: Blob) => string;
    getExtension: (
        entry: FilePondEntry,
        blob: Blob,
        options: { mimeTypeMap: MimeTypeMap }
    ) => string | undefined;
    mimeTypeMap: MimeTypeMap;
}

export function getBasename(entry: FilePondEntry, blob: Blob) {
    return 'Untitled';
}

export function getExtension(
    entry: FilePondEntry,
    blob: Blob,
    options: { mimeTypeMap: MimeTypeMap }
) {
    return getExtensionFromMimeType(blob.type, options.mimeTypeMap);
}

export function getFilename(entry: FilePondEntry, blob: Blob, options: GetFilenameOptions) {
    const basename = (options.getBasename ?? getBasename)(entry, blob);
    const extension = (options.getExtension ?? getExtension)(entry, blob, {
        mimeTypeMap: options.mimeTypeMap,
    });
    return `${basename}${extension}`;
}

export function getExtensionStatusItems(extensions: ExtensionState[]) {
    return extensions.filter((extension) => extension.status).map((extension) => extension.status);
}

export function getExtensionStateByStatusCode(
    extensions: ExtensionState[],
    codes: (null | string)[]
) {
    const extensionState = extensions
        // ignore extensions without a status
        .filter((extension) => extension.status)
        // check if extension includes one of the status codes
        .find((extension) =>
            codes.includes(
                //@ts-ignore (we only get extensions that have a status)
                extension.status.code
            )
        );

    // found a state!
    if (extensionState) {
        return extensionState.status;
    }

    // we are allowed to return placeholder state
    if (codes.includes(null)) {
        return { progress: null };
    }

    // nothing found
    return null;
}

/** Tests if one of the extensions is in an error state */
export function isEntryInErrorState(entry: FilePondEntry): boolean {
    return Object.values(entry.extension ?? {}).some(({ status }) => {
        return status?.type === Status.Error;
    });
}
