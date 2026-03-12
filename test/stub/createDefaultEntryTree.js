import { createEntryTree } from '../../src/core/entryTree.js';
import { isFile } from '../../src/utils/test.js';

export function createDefaultEntryTree() {
    return createEntryTree({
        beforeOnboardEntry: (entry) => {
            if (isFile(entry.src)) {
                entry.file = entry.src;
            }

            if (!entry.state) {
                entry.state = {};
            }

            return entry;
        },
    });
}
