import { it, describe, expect, beforeEach } from 'vitest';
import { FileInputStore } from '../../src/extensions/file-input-store.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { isFile } from '../../src/utils/test.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('FileInputStore', () => {
    let input;
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        input = document.createElement('input');
        input.setAttribute('type', 'file');

        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager({ entryTree });
        extensionManager.extensions = [
            [
                FileInputStore,
                {
                    element: input,
                },
            ],
        ];
    });

    it('should add file to file input', () =>
        new Promise((done) => {
            input.addEventListener('update', (e) => {
                expect(isFile(input.files[0])).to.be.true;

                done();
            });

            const file = {
                src: new File(['hello world'], 'my-file.txt', { type: 'text/plain ' }),
                state: { store: true },
            };

            entryTree.insertEntries(file);
        }));

    it('should add files to file input', () =>
        new Promise((done) => {
            input.addEventListener('update', () => {
                expect(input.files.length).to.equal(2);
                done();
            });

            const a = {
                src: new File(['hello world'], 'my-file-a.txt', { type: 'text/plain ' }),
                state: {
                    store: true,
                },
            };

            const b = {
                src: new File(['hello world'], 'my-file-b.txt', { type: 'text/plain ' }),
                state: {
                    store: true,
                },
            };

            entryTree.insertEntries([a, b]);
        }));

    it('should not add files in failed state to file input', () =>
        new Promise((done) => {
            input.addEventListener('update', () => {
                expect(entryTree.entries.length).to.equal(2);
                expect(input.files.length).to.equal(1);
                done();
            });

            const a = {
                src: new File(['hello world'], 'my-file-a.txt', { type: 'text/plain ' }),
                state: {
                    store: true,
                },
                extension: {
                    LoremIpsumExtension: {
                        status: {
                            type: 'error',
                            code: 'SOME_ERROR',
                        },
                    },
                },
            };

            const b = {
                src: new File(['hello world'], 'my-file-b.txt', { type: 'text/plain ' }),
                state: {
                    store: true,
                },
            };

            entryTree.insertEntries([a, b]);
        }));

    it('should update file input when file is edited', () =>
        new Promise((done) => {
            const file = {
                src: new File(['hello world'], 'my-file.txt', { type: 'text/plain ' }),
                state: { store: true },
            };

            entryTree.insertEntries(file);

            input.addEventListener('update', () => {
                expect(input.files[0].name).to.equal('my-file-2.txt');

                done();
            });

            entryTree.updateEntry(entryTree.entries[0], {
                file: new File(['hello world updated'], 'my-file-2.txt', { type: 'text/plain ' }),
            });
        }));
});
