import type { FilePondEntry } from '../types/index.js';
import { createExtension } from './common/createExtension.js';
import {
    bytesToNaturalFileSize,
    getFormatFromFileSize,
    naturalFileSizeToBytes,
} from '../utils/file.js';
import { flattenTree } from '../utils/tree.js';
import { Status } from '../common/status.js';
import { isBlobOrFile } from '../utils/test.js';

export interface ListSizeValidatorOptions {
    /** Min total file size in bytes or in natural file size. Defaults to `0` */
    minListSize?: number | string;

    /** Max total file size in bytes or in natural file size. Defaults to `Infinity` */
    maxListSize?: number | string;

    /** The natural file size format to use, defaults to `'mega'` if no natural file size supplied for `minSize` or `maxSize` */
    byteUnits?: 'mega' | 'mebi';
}

export const ListSizeValidator = createExtension({
    name: 'ListSizeValidator',
    type: 'validator',
    props: {
        minListSize: 0,
        maxListSize: Infinity,
        byteUnits: undefined,
    } as ListSizeValidatorOptions,
    factory: ({ didSetProps }, { on, setExtensionStatus, getEntries }) => {
        // default byte range
        const range = {
            min: 0,
            max: Infinity,
        };

        /** Derived Range for labels */
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

        // state of range
        let hasLimitedRange = false;

        didSetProps(({ minListSize, maxListSize, byteUnits }: ListSizeValidatorOptions) => {
            byteUnits =
                byteUnits ||
                getFormatFromFileSize(maxListSize) ||
                getFormatFromFileSize(minListSize) ||
                'mega';

            // update byte ranges
            range.min = naturalFileSizeToBytes(minListSize || 0);
            range.max = naturalFileSizeToBytes(maxListSize || Infinity);

            // update natural sizes
            const [min, minUnit] = bytesToNaturalFileSize(range.min, { byteUnits }).split(' ');
            const [max, maxUnit] = bytesToNaturalFileSize(range.max, { byteUnits }).split(' ');

            rangeNatural.min = min;
            rangeNatural.minUnit = minUnit;
            rangeNatural.max = max;
            rangeNatural.maxUnit = maxUnit;

            // update range state
            hasLimitedRange = range.min !== 0 || range.max !== Infinity;

            // run a new test
            testEntries(getEntries());
        });

        function testEntries(entries: FilePondEntry[]) {
            // no need to validate
            if (!hasLimitedRange) {
                return;
            }

            // get total size
            const totalSize = flattenTree(entries).reduce(
                // @ts-ignore
                (total, entry) => total + (isBlobOrFile(entry.file) ? entry.size : 0),
                0
            );

            // validate
            if (totalSize < range.min) {
                return setExtensionStatus({
                    type: Status.Error,
                    code: 'VALIDATION_INVALID',
                    subcode: 'VALIDATION_LIST_SIZE_UNDERFLOW',
                    values: {
                        minSize: rangeNatural.min,
                        minSizeUnit: `unit${rangeNatural.minUnit}`,
                    },
                });
            }

            if (totalSize > range.max) {
                return setExtensionStatus({
                    type: Status.Error,
                    code: 'VALIDATION_INVALID',
                    subcode: 'VALIDATION_LIST_SIZE_OVERFLOW',
                    values: {
                        maxSize: rangeNatural.max,
                        maxSizeUnit: `unit${rangeNatural.maxUnit}`,
                    },
                });
            }

            // all good!
            setExtensionStatus({
                type: Status.System,
                code: 'VALIDATION_COMPLETE',
            });
        }

        const unsubUpdateEntry = on('updateEntries', testEntries);

        return {
            destroy: () => {
                unsubUpdateEntry();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ListSizeValidator: ListSizeValidatorOptions;
    }
    interface DefineFilePondOptions {
        ListSizeValidator?: ListSizeValidatorOptions;
    }
}
