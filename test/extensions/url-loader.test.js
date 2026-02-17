import { MockXhr } from 'mock-xmlhttprequest';
import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { URLLoader } from '../../src/extensions/url-loader.js';
import { isFile } from '../../src/utils/test.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('URLLoader', function () {
    let mockXhr;
    let entryTree;
    let extensionManager;

    beforeEach(function () {
        mockXhr = MockXhr;
        globalThis.XMLHttpRequest = mockXhr;

        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager(entryTree);

        extensionManager.extensions = [
            [
                URLLoader,
                {
                    useWebWorkers: false,
                },
            ],
        ];
    });

    afterEach(function () {
        delete globalThis.XMLHttpRequest;
        mockXhr.onSend = null;
    });

    it('should turn a URL into a File', () =>
        new Promise((done) => {
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(
                        200,
                        {
                            'Content-Type': 'text/plain',
                        },
                        'hello world'
                    );
                }, 0);
            };

            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.URLLoader || {};

                if (!isFile(entry.file)) {
                    return;
                }

                unsub();
                expect(entry.file.size).to.equal(11);
                expect(status.code).to.equal('LOAD_COMPLETE');
                done();
            });

            entryTree.entries = [
                {
                    src: 'file.txt',
                },
            ];
        }));

    it('should correctly rename File based on server response', () =>
        new Promise((done) => {
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(
                        200,
                        {
                            'Content-Disposition': 'attachment; filename=my-file.txt;',
                            'Content-Type': 'text/plain',
                        },
                        'hello world'
                    );
                }, 0);
            };

            const unsub = entryTree.on('updateEntry', (entry) => {
                if (!isFile(entry.file)) return;

                unsub();
                expect(entry.name).to.equal('my-file.txt');
                done();
            });

            entryTree.entries = [
                {
                    src: 'file.txt',
                },
            ];
        }));

    it('should turn a DataURL into a File', () =>
        new Promise((done) => {
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(
                        200,
                        {
                            'Content-Type': 'text/plain',
                        },
                        'hello world'
                    );
                }, 0);
            };

            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.URLLoader || {};

                if (status?.code !== 'LOAD_COMPLETE') return;

                unsub();
                expect(isFile(entry.file)).to.equal(true);
                done();
            });

            entryTree.entries = [
                {
                    src: 'data:text/plain;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                },
            ];
        }));

    it('should fail on empty URL', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.URLLoader || {};

                if (status?.type !== 'error') return;

                unsub();

                expect(isFile(entry.naive)).to.equal(false);
                expect(status.code).to.equal('LOAD_ERROR');

                done();
            });

            entryTree.entries = [
                {
                    src: '',
                },
            ];
        }));

    it('should fail on invalid URL', () =>
        new Promise((done) => {
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(404);
                }, 0);
            };

            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.URLLoader || {};

                if (status?.type !== 'error') return;

                unsub();

                expect(status.code).to.equal('LOAD_ERROR');
                expect(isFile(entry.file)).to.equal(false);

                done();
            });

            entryTree.entries = [
                {
                    src: 'invalid-url',
                },
            ];
        }));
});
