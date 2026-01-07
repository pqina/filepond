import type { FilePondEntry } from '../types/index.js';
import {
    createValidatorExtension,
    type ValidationResultInvalid,
    type ValidatorExtensionOptions,
} from './common/createValidatorExtension.js';
import { isBlobOrFile, isFileEntry, isString } from '../utils/test.js';

export interface FileMimeTypeValidatorOptions extends ValidatorExtensionOptions {
    /** An array of accepted file mime types, also accepts the wildcard character for example `['image/*']` */
    accept?: string | (string | RegExp)[];

    /** Formats the mime types for presentation in a validation message. By default will use the uppercased last part of the mime types joined with ',' */
    format?: (mimeTypes: string[]) => string;
}

export const FileMimeTypeValidator = createValidatorExtension(
    'FileMimeTypeValidator',
    {
        accept: [],
        format: (mimeTypes: string[]) =>
            mimeTypes
                .map((mimeType) => mimeType.split('/')[1])
                .join(', ')
                .toUpperCase(),
    } as FileMimeTypeValidatorOptions,
    ({ props, didSetProps }) => {
        /** Filter out non mimetype values */
        let filteredMimeTypes: string[] = [];

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

        function validateEntry(entry: FilePondEntry): null | ValidationResultInvalid {
            const { format } = props;

            // at this point we know we geta filepondentry with a file
            const { type } = (entry as FilePondEntry & { file: File }).file;

            // match types
            const didMatchSome = computedMimeTypes.some((mimeType) => mimeType.test(type));

            // returns error key so can be used with locale
            return didMatchSome
                ? null
                : {
                      code: 'VALIDATION_FILE_MIME_TYPE_MISMATCH',
                      values: {
                          accept: format(filteredMimeTypes),
                          count: filteredMimeTypes.length,
                      },
                  };
        }

        function canValidateEntry(entry: FilePondEntry) {
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
        }

        return {
            validateEntry,
            canValidateEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FileMimeTypeValidator: FileMimeTypeValidatorOptions;
    }
    interface defineFilePondOptions {
        FileMimeTypeValidator: FileMimeTypeValidatorOptions;
    }
}
