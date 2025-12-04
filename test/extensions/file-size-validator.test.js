import { FileSizeValidator } from '../../src/extensions/file-size-validator.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('FileSizeValidator', () => {
    let entryTree;
    let extensionManager;

    beforeEach(function () {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [
            [
                FileSizeValidator,
                {
                    minSize: '1KB',
                    maxSize: '4KB',
                },
            ],
        ];
    });

    it('should reject files that are too small', (done) => {
        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileSizeValidator: { status },
            } = entry.extension;

            if (status?.type !== 'error') return;

            unsub();
            expect(status.code).to.equal('VALIDATION_INVALID');
            done();
        });

        entryTree.entries = [
            { src: new File(['#'.repeat(100)], 'foo.txt', { type: 'text/plain' }) },
        ];
    });

    it('should reject files that are too big', (done) => {
        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileSizeValidator: { status },
            } = entry.extension;

            if (status?.type !== 'error') return;

            unsub();
            expect(status.code).to.equal('VALIDATION_INVALID');
            done();
        });

        entryTree.entries = [
            { src: new File(['#'.repeat(5000)], 'bar.txt', { type: 'text/plain' }) },
        ];
    });

    it('should accept files that are just the right size', (done) => {
        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileSizeValidator: { status },
            } = entry.extension;

            if (status?.code !== 'VALIDATION_COMPLETE') return;

            unsub();
            done();
        });

        entryTree.entries = [
            { src: new File(['#'.repeat(3000)], 'baz.txt', { type: 'text/plain' }) },
        ];
    });

    it('should continue processing valid files', (done) => {
        const unsub = entryTree.on('updateEntries', (entries) => {
            // if has validated one, test if other is valid
            const [invalid, valid] = entries;

            const invalidStatus = invalid.extension?.FileSizeValidator?.status;
            const validStatus = valid.extension?.FileSizeValidator?.status;

            if (!validStatus || validStatus.code !== 'VALIDATION_COMPLETE') return;

            unsub();
            expect(validStatus.code).to.equal('VALIDATION_COMPLETE');
            expect(invalidStatus.code).to.equal('VALIDATION_INVALID');
            done();
        });

        entryTree.entries = [
            { src: new File(['#'.repeat(7000)], 'foo.txt', { type: 'text/plain' }) },
            { src: new File(['#'.repeat(2000)], 'bar.txt', { type: 'text/plain' }) },
        ];
    });

    it('should throw when incorrect natural file size supplied', () => {
        let error = null;
        try {
            extensionManager.extensions = [
                [
                    FileSizeValidator,
                    {
                        minSize: 'FOO',
                    },
                ],
            ];
        } catch (err) {
            error = err;
        }
        expect(error).to.be.an('error');
        expect(error.message).to.equal('naturalFileSizeToBytes: Invalid natural file size FOO');
    });
});
