import type { FilePondEntry } from '../types/index.js';
import {
    createValidatorExtension,
    type ValidationResultInvalid,
    type ValidatorExtensionOptions,
} from './common/createValidatorExtension.js';
import { isBlobOrFile, isFileEntry } from '../utils/test.js';
import { bytesToNaturalFileSize, naturalFileSizeToBytes } from '../utils/file.js';

export interface FileSizeValidatorOptions extends ValidatorExtensionOptions {
    /** Min file size in bytes or a natural file size. Defaults to `0` */
    minSize?: number | string;

    /** Max file size in bytes or a natural file size. Defaults to `Infinity` */
    maxSize?: number | string;
}

export const FileSizeValidator = createValidatorExtension(
    'FileSizeValidator',
    {
        minSize: 0,
        maxSize: Infinity,
    } as FileSizeValidatorOptions,
    ({ didSetProps }) => {
        const range = {
            min: 0,
            max: Infinity,
        };

        const rangeNatural: { min: null | string; max: null | string } = {
            min: null,
            max: null,
        };

        didSetProps(({ minSize, maxSize }) => {
            range.min = naturalFileSizeToBytes(minSize);
            range.max = naturalFileSizeToBytes(maxSize);

            rangeNatural.min = bytesToNaturalFileSize(range.min);
            rangeNatural.max = bytesToNaturalFileSize(range.max);
        });

        function validateEntry(entry: FilePondEntry): null | ValidationResultInvalid {
            // @ts-ignore
            const { size } = entry.file;

            // returns error key so can be used with locale
            if (size < range.min) {
                return {
                    code: 'VALIDATION_FILE_SIZE_UNDERFLOW',
                    values: { minSize: rangeNatural.min },
                };
            }

            if (size > range.max) {
                return {
                    code: 'VALIDATION_FILE_SIZE_OVERFLOW',
                    values: { maxSize: rangeNatural.max },
                };
            }

            // all good!
            return null;
        }

        function canValidateEntry(entry: FilePondEntry) {
            return isFileEntry(entry) && isBlobOrFile(entry.file);
        }

        return {
            validateEntry,
            canValidateEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FileSizeValidator: FileSizeValidatorOptions;
    }
    interface defineFilePondOptions {
        FileSizeValidator: FileSizeValidatorOptions;
    }
}
