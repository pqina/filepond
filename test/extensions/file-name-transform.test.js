import { it, describe, expect, beforeEach } from 'vitest';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { FileNameTransform } from '../../src/extensions/file-name-transform.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { isFile } from '../../src/utils/test.js';

describe('FileNameTransform', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager({ entryTree });
        extensionManager.extensions = [
            [
                FileNameTransform,
                {
                    renameEntry: (entry, state) => {
                        return 'renamed.txt';
                    },
                },
            ],
        ];
    });

    it('should rename file objects when rename action set to true', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FileNameTransform: { status, history },
                } = entry.extension;

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();

                expect(isFile(entry.file)).to.equal(true);
                expect(history[0]).to.equal('original.txt');
                expect(entry.file.name).to.equal('renamed.txt');

                done();
            });

            const entry = {
                src: new File(['foo bar baz'], 'original.txt', { type: 'text/plain' }),
                state: {
                    renameFile: true,
                },
            };

            entryTree.entries = [entry];
        }));

    it('should revert file object name to original when rename action set to false', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FileNameTransform: { status },
                } = entry.extension;

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();

                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const {
                            FileNameTransform: { status, history },
                        } = entry.extension;

                        if (!status.code.endsWith('IDLE')) return;

                        unsub();
                        expect(isFile(entry.file)).to.equal(true);
                        expect(entry.file.name).to.equal('original.txt');
                        expect(history.length).to.equal(0);
                        done();
                    });

                    // revert
                    entryTree.updateEntry(entry, {
                        state: {
                            renameFile: false,
                        },
                    });
                }
            });

            const entry = {
                src: new File(['foo bar baz'], 'original.txt', { type: 'text/plain' }),
                state: {
                    renameFile: true,
                },
            };

            entryTree.entries = [entry];
        }));
});
