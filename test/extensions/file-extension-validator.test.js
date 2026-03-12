import { it, describe, expect } from 'vitest';
import { FileExtensionValidator } from '../../src/extensions/file-extension-validator.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('FileExtensionValidator', () => {
    let entryTree;
    let extensionManager;

    it('should reject files with incorrect extension', () =>
        new Promise((done) => {
            entryTree = createDefaultEntryTree();
            extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    FileExtensionValidator,
                    {
                        accept: ['.jpg', '.png'],
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FileExtensionValidator: { status },
                } = entry.extension;

                if (status?.type !== 'error') return;

                unsub();
                expect(status.code).toEqual('VALIDATION_INVALID');
                done();
            });

            entryTree.entries = [{ src: new File([''], 'foo.txt', { type: 'text/plain' }) }];
        }));
});
