import type { FilePondFileEntry } from '../types/index.js';
import { isFile } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';

export const ObjectURLView = createExtension(
    'ObjectURLView',
    {},
    (state, { on, getEntryExtensionState, setEntryExtensionState }) => {
        function handleUpdateEntryData(entry: FilePondFileEntry) {
            const { file } = entry;

            // We wait for a file
            if (!isFile(file)) {
                return;
            }

            // If we already have an ObjectURL we need to revoke it
            const { url } = getEntryExtensionState(entry);
            if (url) {
                URL.revokeObjectURL(url);
            }

            // Update the ObjectURL
            setEntryExtensionState(entry, {
                url: URL.createObjectURL(file),
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
            const { url } = getEntryExtensionState(entry);
            if (url) {
                URL.revokeObjectURL(url);
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
    }
);
