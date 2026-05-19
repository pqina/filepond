import { it, describe, expect, beforeEach } from 'vitest';
import { DataURLStore } from '../../src/extensions/data-url-store.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('DataURLStore', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager({ entryTree });
        extensionManager.extensions = [DataURLStore];
    });

    it('should add DataURLStore to entry', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    DataURLStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                // not done yet
                if (status.code !== 'STORE_COMPLETE') return;

                unsub();
                expect(value).to.have.string('data');
                done();
            });

            const file = {
                src: new File(['hello world'], 'my-file.txt', { type: 'text/plain ' }),
                state: {
                    store: true,
                },
            };

            entryTree.entries = [file];
        }));

    it('should update DataURL when file is edited', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    DataURLStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                // not done yet
                if (status.code !== 'STORE_COMPLETE') return;

                // call no more
                unsub();

                // stored dataURL for initial entry
                const dataBefore = value;

                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const {
                            DataURLStore: { status },
                        } = entry.extension;

                        const { value } = entry.state;

                        // not done yet
                        if (status.code !== 'STORE_COMPLETE') return;

                        unsub();
                        expect(value).to.not.equal(dataBefore);
                        done();
                    });

                    // simulate data update
                    setTimeout(() => {
                        entryTree.updateEntry(entryTree.entries[0], {
                            file: new File(['hello world updated'], 'my-file-2.txt', {
                                type: 'text/plain ',
                            }),
                            state: {
                                store: true,
                            },
                        });
                    }, 0);
                }
            });

            const file = {
                src: new File(['hello world'], 'my-file-1.txt', { type: 'text/plain ' }),
                state: {
                    store: true,
                },
            };

            entryTree.entries = [file];
        }));
});
