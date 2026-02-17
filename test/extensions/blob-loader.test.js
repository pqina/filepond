import { it, describe, expect, beforeEach } from 'vitest';
import { BlobLoader } from '../../src/extensions/blob-loader.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { isFile } from '../../src/utils/test.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('BlobLoader', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [BlobLoader];
    });

    it('should not handle File objects', () => {
        const entry = { src: new File([], 'file.txt', { type: 'text/plain' }) };
        entryTree.entries = [entry];
        expect(isFile(entryTree.entries[0].file)).to.equal(true);
    });

    it('should turn a Blob into a File', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.BlobLoader || {};

                if (status?.code !== 'LOAD_COMPLETE') {
                    return;
                }

                unsub();
                expect(isFile(entry.file)).to.equal(true);
                done();
            });

            entryTree.entries = [{ src: new Blob(['a'], { type: 'text/plain' }) }];
        }));
});
