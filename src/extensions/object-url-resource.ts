import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import { isFile, isFileEntry } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';

export const ObjectURLResource = createExtension({
    name: 'ObjectURLResource',
    type: 'resource',
    props: {},
    factory: (_, { on, getEntryExtensionState, setEntryExtensionState }) => {
        function handleUpdateEntryData(entry: FilePondEntry) {
            // no can do
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return;
            }

            // If we already have an ObjectURL we need to revoke it
            const { value } = getEntryExtensionState(entry);
            if (value) {
                URL.revokeObjectURL(value);
            }

            // Update the ObjectURL
            setEntryExtensionState(entry, {
                value: URL.createObjectURL(entry.file),
            });
        }

        function handleRemoveEntry(detail: { entry: FilePondEntry; index: number[] }) {
            const { entry } = detail;

            // no can do
            if (!isFileEntry(entry) || !isFile(entry.file)) {
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
