import type {
    FilePondDataTransferEntry,
    FilePondDirectoryEntry,
    FilePondFileEntry,
} from '../../types/index.js';
import type {
    FilePondEntrySource,
    PartialFilePondEntry,
    FilePondEntry,
} from '../../types/index.js';
import type { ExtensionStatus } from '../../extensions/common/createExtension.js';

// import modules
import { createEntryTree, type EntryTreeOptions } from '../../core/entryTree.js';
import {
    isFile,
    isFileEntry,
    isNumber,
    isObject,
    isString,
    isBlobOrFile,
    isCanvas,
    isDataTransfer,
    isDirectoryEntry,
} from '../../utils/test.js';
import { copyFilePropsToObject } from '../../utils/file.js';
import { getFilenameFromURL } from '../../utils/url.js';

export type createFilePondEntryTreeOptions = Omit<
    EntryTreeOptions,
    'beforeOnboardEntry' | 'beforeUpdateEntryWithProps'
>;

export function createFilePondEntryTree(options?: createFilePondEntryTreeOptions) {
    const { beforeInsertEntries } = options || {};
    return createEntryTree({
        // allows limiting the total entries added
        beforeInsertEntries,

        // formats the entry so all entries in the dataset follow the same data structure
        beforeOnboardEntry(entry) {
            // filter invalid entries
            if (!shouldAddEntry(entry)) {
                return false;
            }

            // sanitize and filter
            return formatEntry(entry);
        },

        // makes modifications to the props the entry is updated with
        beforeUpdateEntryWithProps(entry, props, isUpdatingData) {
            // only handle file entries in this part, if data is being updated we need to update history
            if (isFileEntry(entry) && isUpdatingData) {
                // we update both the source and new entry with the file props
                copyFilePropsToObject(props.file, props);
            }

            // not updating extension, exit
            if (props.extension) {
                // we're updating an extension status, let's remove progress if it's not part of the status update so it doesn't stick around when moving from one status to another
                const extensionUpdates: { status: ExtensionStatus }[] = Object.values(
                    props.extension
                );

                for (const { status } of extensionUpdates) {
                    if (!status) {
                        continue;
                    }

                    // clear value and progress if it's not passed
                    status.values = status.values ?? null;
                    status.progress = isNumber(status.progress) ? status.progress : null;
                }
            }
        },
    });
}

/** Tests if the entry is an entry source */
function isEntrySrc(entry: FilePondEntrySource) {
    return isString(entry) || isBlobOrFile(entry) || isCanvas(entry) || isDataTransfer(entry);
}

/** If no name, that's fine, if does have a file name ignore if is a hidden file */
function shouldAddEntry(entry: FilePondEntrySource) {
    if (isString(entry) || isFileEntry(entry)) {
        const name = isString(entry)
            ? (getFilenameFromURL(entry) ?? '')
            : (entry.name ?? (isFile(entry?.src) ? entry.src.name : ''));

        return ![
            /\.git/,
            /thumbs\.db/,
            /\.DS_Store/,
            /desktop\.ini/,
            /^__MACOSX/,
            /node_modules/,
        ].find((regex) => regex.test(name));
    }

    return true;
}

/** Formats the entry so it conforms to the FilePondEntry type and is ready to be added to the list */
function formatEntry(entry: FilePondEntrySource): FilePondEntry {
    // test if entry is source object if so, we need to set that as the src
    const partialEntry: PartialFilePondEntry = isEntrySrc(entry) ? { src: entry } : { ...entry };

    // format base props
    partialEntry.state = isObject(partialEntry.state) ? partialEntry.state : {};
    partialEntry.extension = isObject(partialEntry.extension) ? partialEntry.extension : {};
    partialEntry.origin = partialEntry.origin ?? 'api';
    partialEntry.containerId = partialEntry.containerId ?? null;

    // if the source is a data transfer there's nothing left to format
    if (isDataTransfer(partialEntry.src)) {
        return partialEntry as FilePondDataTransferEntry;
    }

    // @ts-ignore it's either a directory entry or a file entry
    partialEntry.path = partialEntry.path ?? partialEntry.src?.path ?? null;

    // if not is a file, it's a directory, let's format subentries
    if (isDirectoryEntry(partialEntry)) {
        const { entries } = partialEntry;
        partialEntry.entries = entries.filter(shouldAddEntry).map(formatEntry);
        return partialEntry as FilePondDirectoryEntry;
    }

    // it's a file entry
    const partialFileEntry = partialEntry as FilePondFileEntry;
    partialFileEntry.file = partialFileEntry.file ?? undefined;

    // copy file ref if src is file
    if (isFile(partialFileEntry.src)) {
        partialFileEntry.file = partialFileEntry.src;
    }

    if (isFile(partialFileEntry.file)) {
        copyFilePropsToObject(partialFileEntry.file, partialFileEntry);
    }

    return partialFileEntry as FilePondFileEntry;
}
