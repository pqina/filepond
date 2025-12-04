import { FileMimeTypeValidator } from '../../src/extensions/file-mime-type-validator.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('FileMimeTypeValidator', () => {
    let entryTree;
    let extensionManager;

    it('should reject files with incorrect mime type', (done) => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [
            [
                FileMimeTypeValidator,
                {
                    accept: ['image/jpeg', 'image/png'],
                },
            ],
        ];

        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileMimeTypeValidator: { status },
            } = entry.extension;

            if (status?.type !== 'error') return;

            unsub();
            expect(status.code).to.equal('VALIDATION_INVALID');
            done();
        });

        entryTree.entries = [{ src: new File([''], 'foo.txt', { type: 'text/plain' }) }];
    });

    it('should reject files with incorrect mime type by wildcard', (done) => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [
            [
                FileMimeTypeValidator,
                {
                    accept: ['image/*'],
                },
            ],
        ];

        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileMimeTypeValidator: { status },
            } = entry.extension;

            if (status?.type !== 'error') return;

            unsub();
            expect(status.code).to.equal('VALIDATION_INVALID');
            done();
        });

        entryTree.entries = [{ src: new File([''], 'foo.txt', { type: 'text/plain' }) }];
    });

    it('should accept files by mime type wildcard', (done) => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [
            [
                FileMimeTypeValidator,
                {
                    accept: ['image/*'],
                },
            ],
        ];

        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileMimeTypeValidator: { status },
            } = entry.extension;

            if (status?.code !== 'VALIDATION_COMPLETE') return;

            unsub();
            done();
        });

        entryTree.entries = [{ src: new File(['a'], 'foo.jpeg', { type: 'image/jpeg' }) }];
    });
});
