import type { FilePondEntry } from '../types/index.js';
import type { ExtensionStatus } from './common/createExtension.js';
import {
    createValidatorExtension,
    type ValidationResultInvalid,
} from './common/createValidatorExtension.js';
import { isBlobOrFile, isFile, isFileEntry, isFunction } from '../utils/test.js';
import { getFilenameWithoutExtension } from '../utils/file.js';
import { Status } from '../common/status.js';
import { warn } from '../common/console.js';

export interface FileNameValidatorOptions {
    /** A function that tests if the name is valid */
    test: (name: string) => boolean;
}

export const FileNameValidator = createValidatorExtension(
    'FileNameValidator',
    {} as FileNameValidatorOptions,
    ({ props }) => {
        const { test } = props;
        if (!test) {
            warn(`FileNameValidator: 'test' is a required property`);
        }

        function validateEntry(entry: FilePondEntry): null | ValidationResultInvalid {
            const { test } = props;

            if (!isFileEntry(entry)) {
                return null;
            }

            // get the file name
            const { name } = isFile(entry.file) ? entry.file : entry;

            // file has no name
            if (name === undefined) {
                return {
                    code: 'VALIDATION_FILE_NAME_MISSING',
                };
            }

            // get entry extension
            const nameWithoutExtension = getFilenameWithoutExtension(name);

            // match types
            const didMatch = test(nameWithoutExtension);

            // no issues found
            if (didMatch) {
                return null;
            }

            // error!
            return {
                code: 'VALIDATION_FILE_NAME_MISMATCH',
            };
        }

        function canValidateEntry(entry: FilePondEntry) {
            const { test } = props;

            if (!isFunction(test) || !isFileEntry(entry)) {
                return false;
            }

            return !!(isBlobOrFile(entry.file) && entry.file?.name);
        }

        return {
            validateEntry,
            canValidateEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FileNameValidator: FileNameValidatorOptions;
    }
    interface defineFilePondOptions {
        FileNameValidator: FileNameValidatorOptions;
    }
}
