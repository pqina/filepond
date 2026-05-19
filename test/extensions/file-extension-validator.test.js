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
            extensionManager = createExtensionManager({ entryTree });
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

                if (status?.type !== 'error') {
                    return;
                }

                unsub();
                expect(status.code).toEqual('VALIDATION_INVALID');
                done();
            });

            entryTree.entries = [{ src: new File([''], 'foo.txt', { type: 'text/plain' }) }];
        }));

    it('should reject files without extension', () =>
        new Promise((done) => {
            entryTree = createDefaultEntryTree();
            extensionManager = createExtensionManager({ entryTree });
            extensionManager.extensions = [
                [
                    FileExtensionValidator,
                    {
                        accept: ['.txt'],
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FileExtensionValidator: { status },
                } = entry.extension;

                if (status?.type !== 'error') {
                    return;
                }

                unsub();
                expect(status.code).toEqual('VALIDATION_INVALID');
                expect(status.subcode).toEqual('VALIDATION_FILE_EXTENSION_MISMATCH');
                done();
            });

            entryTree.entries = [{ src: new File([''], 'foo', { type: 'text/plain' }) }];
        }));

    it('should accept files with uppercase extensions', () =>
        new Promise((done) => {
            entryTree = createDefaultEntryTree();
            extensionManager = createExtensionManager({ entryTree });
            extensionManager.extensions = [
                [
                    FileExtensionValidator,
                    {
                        accept: ['.txt'],
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FileExtensionValidator: { status },
                } = entry.extension;

                if (status?.code !== 'VALIDATION_COMPLETE') {
                    return;
                }

                unsub();
                done();
            });

            entryTree.entries = [{ src: new File([''], 'foo.Txt', { type: 'text/plain' }) }];
        }));
});
