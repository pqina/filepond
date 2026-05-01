import type { FilePondFileEntry } from '../types/index.js';
import { isFile } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';

export const ObjectURLResource = createExtension({
    name: 'ObjectURLResource',
    type: 'resource',
    props: {},
    factory: (state, { on, getEntryExtensionState, setEntryExtensionState }) => {
        function handleUpdateEntryData(entry: FilePondFileEntry) {
            const { file } = entry;

            // We wait for a file
            if (!isFile(file)) {
                return;
            }

            // If we already have an ObjectURL we need to revoke it
            const { value } = getEntryExtensionState(entry);
            if (value) {
                URL.revokeObjectURL(value);
            }

            // Update the ObjectURL
            setEntryExtensionState(entry, {
                value: URL.createObjectURL(file),
            });
        }

        function handleRemoveEntry(detail: { entry: FilePondFileEntry; index: number }) {
            const { entry } = detail;
            const { file } = entry;

            // Need a file
            if (!isFile(file)) {
                return;
            }

            // If we've set an ObjectURL we need to revoke it
            const { value } = getEntryExtensionState(entry);
            if (value) {
                URL.revokeObjectURL(value);
            }
        }

        const unsubUpdateEntryData = on('updateEntryData', handleUpdateEntryData);
        const unsubRemove = on('removeEntry', handleRemoveEntry);

        return {
            destroy: () => {
                unsubUpdateEntryData();
                unsubRemove();
            },
        };
    },
});
