import {
    createValidatorExtension,
    type ValidatorExtensionCanValidateFunction,
    type CreateValidatorExtensionOptions,
    type ValidatorExtensionValidateFunction,
} from './common/createValidatorExtension.js';
import { isBlobOrFile, isFileEntry, isString } from '../utils/test.js';
import {
    bytesToNaturalFileSize,
    getFormatFromFileSize,
    naturalFileSizeToBytes,
} from '../utils/file.js';

export interface FileSizeValidatorOptions extends CreateValidatorExtensionOptions {
    /** Min file size in bytes or a natural file size. Defaults to `0` */
    minSize?: number | string;

    /** Max file size in bytes or a natural file size. Defaults to `Infinity` */
    maxSize?: number | string;

    /** The natural file size format to use, defaults to `'mega'` if no natural file size supplied for `minSize` or `maxSize` */
    byteUnits?: 'mega' | 'mebi';
}

export const FileSizeValidator = createValidatorExtension({
    name: 'FileSizeValidator',
    props: {
        minSize: 0,
        maxSize: Infinity,
        byteUnits: undefined,
    } as FileSizeValidatorOptions,
    factory: ({ didSetProps }) => {
        const range = {
            min: 0,
            max: Infinity,
        };

        const rangeNatural: {
            min: null | string;
            minUnit: null | string;
            max: null | string;
            maxUnit: null | string;
        } = {
            min: null,
            minUnit: null,
            max: null,
            maxUnit: null,
        };

        didSetProps(({ minSize, maxSize, byteUnits }) => {
            byteUnits =
                byteUnits ||
                getFormatFromFileSize(maxSize) ||
                getFormatFromFileSize(minSize) ||
                'mega';

            range.min = naturalFileSizeToBytes(minSize);
            range.max = naturalFileSizeToBytes(maxSize);

            const [min, minUnit] = bytesToNaturalFileSize(range.min, { byteUnits }).split(' ');
            const [max, maxUnit] = bytesToNaturalFileSize(range.max, { byteUnits }).split(' ');

            rangeNatural.min = min;
            rangeNatural.minUnit = minUnit;
            rangeNatural.max = max;
            rangeNatural.maxUnit = maxUnit;
        });

        const validateEntry: ValidatorExtensionValidateFunction = (entry) => {
            // @ts-ignore
            const { size } = entry.file;

            // returns error key so can be used with locale
            if (size < range.min) {
                return {
                    code: 'VALIDATION_FILE_SIZE_UNDERFLOW',
                    values: {
                        minSize: rangeNatural.min,
                        minSizeUnit: `unit${rangeNatural.minUnit}`,
                    },
                };
            }

            if (size > range.max) {
                return {
                    code: 'VALIDATION_FILE_SIZE_OVERFLOW',
                    values: {
                        maxSize: rangeNatural.max,
                        maxSizeUnit: `unit${rangeNatural.maxUnit}`,
                    },
                };
            }

            // all good!
            return null;
        };

        const canValidateEntry: ValidatorExtensionCanValidateFunction = (entry) => {
            return isFileEntry(entry) && isBlobOrFile(entry.file);
        };

        return {
            validateEntry,
            canValidateEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        FileSizeValidator: FileSizeValidatorOptions;
    }
    interface DefineFilePondOptions {
        FileSizeValidator?: FileSizeValidatorOptions;
    }
}
