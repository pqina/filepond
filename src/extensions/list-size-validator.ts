import type { FilePondEntry } from '../types/index.js';
import { createExtension } from './common/createExtension.js';
import { bytesToNaturalFileSize, naturalFileSizeToBytes } from '../utils/file.js';
import { flattenTree } from '../utils/tree.js';
import { Status } from '../common/status.js';
import { isBlobOrFile } from '../utils/test.js';

export interface ListSizeValidatorOptions {
    /** Min total file size in bytes or in natural file size. Defaults to `0` */
    minListSize?: number | string;

    /** Max total file size in bytes or in natural file size. Defaults to `Infinity` */
    maxListSize?: number | string;
}

export const ListSizeValidator = createExtension(
    'ListSizeValidator',
    {
        minListSize: 0,
        maxListSize: Infinity,
    } as ListSizeValidatorOptions,
    ({ didSetProps }, { on, setExtensionStatus, getEntries }) => {
        // default byte range
        const range = {
            min: 0,
            max: Infinity,
        };

        /** Derived Range for labels */
        const rangeNatural: { min: null | string; max: null | string } = {
            min: null,
            max: null,
        };

        // state of range
        let hasLimitedRange = false;

        didSetProps(({ minListSize, maxListSize }: ListSizeValidatorOptions) => {
            // update byte ranges
            range.min = naturalFileSizeToBytes(minListSize || 0);
            range.max = naturalFileSizeToBytes(maxListSize || Infinity);

            // update natural sizes
            rangeNatural.min = bytesToNaturalFileSize(range.min);
            rangeNatural.max = bytesToNaturalFileSize(range.max);

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
                    values: { minListSize: rangeNatural.min },
                });
            }

            if (totalSize > range.max) {
                return setExtensionStatus({
                    type: Status.Error,
                    code: 'VALIDATION_INVALID',
                    subcode: 'VALIDATION_LIST_SIZE_OVERFLOW',
                    values: { maxListSize: rangeNatural.max },
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
    }
);

declare module '../index.js' {
    interface FilePondElement {
        ListSizeValidator: ListSizeValidatorOptions;
    }
    interface defineFilePondOptions {
        ListSizeValidator: ListSizeValidatorOptions;
    }
}
