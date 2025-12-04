import type { FilePondEntry } from '../types/index.js';
import {
    type ValidationResultInvalid,
    createValidatorExtension,
} from './common/createValidatorExtension.js';
import { isBlobOrFile, isFile, isFileEntry, isString } from '../utils/test.js';
import { getExtensionFromFilename } from '../utils/file.js';

export interface FileExtensionValidatorOptions {
    /** An array of case-insensitive filename extensions, starting with a period (".") character */
    accept?: string | string[];

    /** Formats the extensions for presentation in a validation message */
    format?: (mimeTypes: string[]) => string;
}

export const FileExtensionValidator = createValidatorExtension(
    'FileExtensionValidator',
    {
        accept: [],
        format: (extensions: string[]) =>
            extensions
                .map((extension) => extension.substring(1))
                .join(', ')
                .toUpperCase(),
    } as FileExtensionValidatorOptions,
    ({ props, didSetProps }) => {
        let computedExtensions: string[] = [];

        didSetProps(({ accept }) => {
            computedExtensions = isString(accept)
                ? accept
                      .split(',')
                      .map((str) => str.trim())
                      .filter((extension) => extension.startsWith('.'))
                : accept;
        });

        function validateEntry(entry: FilePondEntry): null | ValidationResultInvalid {
            const { format } = props;
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return null;
            }

            // get the file name
            const { name } = entry.file;

            // file has no name
            if (name === undefined) {
                return {
                    code: 'VALIDATION_FILE_NAME_MISSING',
                };
            }

            // get entry extension
            const extension = getExtensionFromFilename(name);

            // match types
            const didMatchSome = computedExtensions.some((ext) => ext === extension);

            // returns error key so can be used with locale
            if (didMatchSome) {
                return null;
            }

            // error!
            return {
                code: 'VALIDATION_FILE_EXTENSION_MISMATCH',
                values: { accept: format(computedExtensions), count: computedExtensions.length },
            };
        }

        function canValidateEntry(entry: FilePondEntry) {
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return false;
            }

            return (
                !!(isBlobOrFile(entry.file) && entry.file?.name) && computedExtensions.length > 0
            );
        }

        return {
            validateEntry,
            canValidateEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FileExtensionValidator: FileExtensionValidatorOptions;
    }
}
