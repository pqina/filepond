import type { FilePondFileEntry } from '../types/index.js';
import {
    createValidatorExtension,
    type ValidatorExtensionCanValidateFunction,
    type ValidatorExtensionOptions,
    type ValidatorExtensionValidateFunction,
} from './common/createValidatorExtension.js';
import { isBlobOrFile, isFileEntry, isString } from '../utils/test.js';
import { upperCaseFirstLetter } from '../utils/string.js';

export interface FileMimeTypeValidatorOptions extends ValidatorExtensionOptions {
    /** An array of accepted file mime types, also accepts the wildcard character for example `['image/*']` */
    accept?: string | (string | RegExp)[];

    /** Formats the mime types for presentation in a validation message. By default will use the uppercased last part of the mime types joined with ',' */
    format?: (mimeTypes: string[]) => string;
}

export const FileMimeTypeValidator = createValidatorExtension({
    name: 'FileMimeTypeValidator',
    props: {
        accept: [],
        format: (mimeTypes: string[]) =>
            mimeTypes
                .map((mimeType) => {
                    const [group, type] = mimeType.split('/');
                    return type === '*'
                        ? `fileMainType${upperCaseFirstLetter(group)}`
                        : type.toUpperCase();
                })
                .join(', '),
    } as FileMimeTypeValidatorOptions,
    factory: ({ props, didSetProps }) => {
        /** Filter out non mimetype values */
        let filteredMimeTypes: (string | RegExp)[] = [];

        /** Mime types we can display in validation labels */
        let filteredMimeTypeLabels: string[] = [];

        /** Parses mimetypes and replaces wildcard mimetypes with regular expresssions */
        let computedMimeTypes: RegExp[] = [];

        didSetProps(({ accept }) => {
            // sanitize input
            filteredMimeTypes = (isString(accept) ? accept.split(',') : accept)
                .map((mimeType: string | RegExp) =>
                    isString(mimeType) ? mimeType.trim() : mimeType
                )
                .filter((mimeType: string | RegExp) => {
                    // test if this mimetype is an extension, else remove it
                    if (isString(mimeType)) {
                        if (mimeType.length === 0) {
                            return false;
                        }
                        return !mimeType.startsWith('.');
                    }
                    return true;
                });
            filteredMimeTypeLabels = filteredMimeTypes.filter(isString);

            // create regex to test with
            computedMimeTypes = filteredMimeTypes.map((mimeType) => {
                if (isString(mimeType)) {
                    return mimeType.includes('*')
                        ? new RegExp('^' + mimeType.split('*')[0], 'i')
                        : new RegExp('^' + mimeType + '$', 'i');
                }
                return mimeType;
            });
        });

        const validateEntry: ValidatorExtensionValidateFunction = (entry) => {
            const { format } = props;

            // at this point we know we geta filepondentry with a file
            const { type } = (entry as FilePondFileEntry & { file: File }).file;

            // match types
            const didMatchSome = computedMimeTypes.some((mimeType) => mimeType.test(type));

            // returns error key so can be used with locale
            return didMatchSome
                ? null
                : {
                      code: 'VALIDATION_FILE_MIME_TYPE_MISMATCH',
                      values: {
                          accept: format(filteredMimeTypeLabels),
                          count: filteredMimeTypes.length,
                      },
                  };
        };

        const canValidateEntry: ValidatorExtensionCanValidateFunction = (entry) => {
            if (!isFileEntry(entry)) {
                return false;
            }

            if (!isBlobOrFile(entry.file)) {
                return false;
            }

            if (computedMimeTypes.length === 0) {
                return false;
            }

            // has a type and it's not empty
            return !!entry.file.type;
        };

        return {
            validateEntry,
            canValidateEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        FileMimeTypeValidator: FileMimeTypeValidatorOptions;
    }
    interface defineFilePondOptions {
        FileMimeTypeValidator: FileMimeTypeValidatorOptions;
    }
}
