import type { FilePondEntry } from '../types/index.js';
import { Status } from '../common/status.js';
import { createExtension } from './common/createExtension.js';

export interface ListCountValidatorOptions {
    /** Min total files. Defaults to `0` */
    minFiles?: number | string;

    /** Max total file. Defaults to `Infinity` */
    maxFiles?: number | string;
}

export const ListCountValidator = createExtension(
    'ListCountValidator',
    {
        minFiles: 0,
        maxFiles: Infinity,
    } as ListCountValidatorOptions,
    ({ props, didSetProps }, { on, setExtensionStatus }) => {
        // so we can more easily determine if range is limited
        let hasLimitedRange = false;

        didSetProps(({ minFiles, maxFiles }: ListCountValidatorOptions) => {
            hasLimitedRange = minFiles !== 0 || maxFiles !== Infinity;
        });

        /** Tests if the total number of entries is between min/max */
        function testEntries(entries: FilePondEntry[]) {
            // no need to validate
            if (!hasLimitedRange) {
                return;
            }

            // get total entries so we can compare against limits
            const totalEntries = entries.length;

            // refs to min/max
            const { minFiles, maxFiles } = props;

            // too few entries
            if (totalEntries < minFiles) {
                return setExtensionStatus({
                    type: Status.Error,
                    code: 'VALIDATION_LIST_ENTRY_COUNT_UNDERFLOW',
                    values: { minFiles },
                });
            }

            // too many entries
            if (totalEntries > maxFiles) {
                return setExtensionStatus({
                    type: Status.Error,
                    code: 'VALIDATION_LIST_ENTRY_COUNT_OVERFLOW',
                    values: { maxFiles },
                });
            }

            // all good!
            setExtensionStatus({
                type: Status.System,
                code: 'VALIDATION_COMPLETE',
            });
        }

        // each time the list is updated we validate it
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
        ListCountValidator: ListCountValidatorOptions;
    }
}
