import { it, describe, expect, beforeEach } from 'vitest';
import { CanvasLoader } from '../../src/extensions/canvas-loader.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { isFile } from '../../src/utils/test.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('CanvasLoader', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [CanvasLoader];
    });

    it('should turn a Canvas into a Blob', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.CanvasLoader || {};

                if (status?.code !== 'LOAD_COMPLETE') {
                    return;
                }

                expect(isFile(entry.file)).to.equal(true);

                unsub();
                done();
            });

            entryTree.entries = [
                {
                    src: (() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 64;
                        canvas.height = 64;
                        return canvas;
                    })(),
                },
            ];
        }));
});
