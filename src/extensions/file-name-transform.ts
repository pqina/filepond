import type { FilePondFileEntry } from '../types/index.js';
import type { Extension } from './common/createExtension.js';
import {
    createTransformExtension,
    type TransformExtensionOptions,
} from './common/createTransformExtension.js';

import { isString } from '../utils/test.js';

import {
    sanitizeFilename,
    getExtensionFromFilename,
    getFilenameWithoutExtension,
    updateFilename,
} from '../utils/file.js';

export interface FileNameTransformOptions extends TransformExtensionOptions {
    /** Action name to use for rename. Defaults to `'renameFile'` */
    actionTransform?: string;

    /** Function to use for sanitizing the user input. */
    sanitizeName?: (fileName: string) => string;

    /** Allows requesting a new filename. */
    renameEntry?: (
        entry: FilePondFileEntry,
        options: { basename: string; extentsion: string; history: string[] }
    ) => Promise<string>;
}

export const FileNameTransform = createTransformExtension(
    'FileNameTransform',
    {
        actionTransform: 'renameFile',
        sanitizeName: sanitizeFilename,
        renameEntry: (entry, options) => {},
    } as FileNameTransformOptions,
    ({ props, extensionName }) => {
        async function transformEntry(entry: FilePondFileEntry & { file: File }) {
            const { renameEntry, sanitizeName, actionTransform } = props;

            const { name = '' } = entry;

            const basename = getFilenameWithoutExtension(name);
            const fileExtension = getExtensionFromFilename(name);
            const entryExtension = entry.extension[extensionName];

            // @ts-ignore
            const currentHistory = [...(entryExtension.history ?? [])];

            // new name was passed to `state.renameFile`
            const actionNewName = isString(entry.state[actionTransform])
                ? entry.state[actionTransform]
                : null;

            // pass name and extension to rename function so it's easier to make changes
            const entryNameNew =
                actionNewName ||
                (await renameEntry(entry, {
                    basename,
                    extension: fileExtension,
                    history: [...currentHistory],
                }));

            // don't adjust entry
            if (!isString(entryNameNew)) {
                return;
            }

            // make sure is valid filename
            const sanitizedEntryNameNew = sanitizeName(entryNameNew);

            // invalid characters used or name is same
            if (!sanitizedEntryNameNew.length || sanitizedEntryNameNew === entry.file.name) {
                return;
            }

            // track name edit history
            const history = [...currentHistory, entry.file.name];
            const file = updateFilename(entry.file, sanitizedEntryNameNew);

            // return new name
            return {
                file,
                history,
            };
        }

        return {
            transformEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FileNameTransform: FileNameTransformOptions;
    }
    interface defineFilePondOptions {
        FileNameTransform: FileNameTransformOptions;
    }
}
