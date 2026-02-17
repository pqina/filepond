import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { ChunkedUploadStore } from '../../src/extensions/chunked-upload-store.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { MockXhr } from 'mock-xmlhttprequest';

describe('ChunkedUploadStore', function () {
    let eventSourceBackup;

    let mockXhr;

    beforeEach(function () {
        mockXhr = MockXhr;
        globalThis.XMLHttpRequest = mockXhr;

        eventSourceBackup = EventSource;

        EventSource = class EventSource {
            constructor(url) {}
            addEventListener() {}
            get readyState() {
                return eventSourceBackup.OPEN;
            }
        };
    });

    afterEach(function () {
        delete globalThis.XMLHttpRequest;
        mockXhr.onSend = null;
        mockXhr.onCreate = null;
        EventSource = eventSourceBackup;
    });

    it('should fail on invalid URL', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    ChunkedUploadStore,
                    {
                        url: 'invalid-url',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    ChunkedUploadStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (status.type !== 'error') return;

                unsub();
                expect(status.code).to.equal('STORE_ERROR');
                done();
            });

            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(404);
                }, 0);
            };

            const entry = {
                src: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                state: {
                    store: true,
                },
            };
            entryTree.entries = [entry];
        }));

    it('should store a File and save server id', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    ChunkedUploadStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    ChunkedUploadStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();
                expect(status.code).to.equal('STORE_COMPLETE');
                expect(value).to.equal('1234');
                done();
            });

            mockXhr.onSend = (xhr) => {
                // request transfer id is POST

                setTimeout(() => {
                    if (xhr.method === 'POST') {
                        xhr.respond(201, { contentType: 'text/plain' }, '1234');
                    } else if (xhr.method === 'PATCH') {
                        xhr.respond(204, { contentType: 'text/plain' }, '');
                    }
                }, 0);
            };

            const entry = {
                src: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                state: {
                    store: true,
                },
            };
            entryTree.entries = [entry];
        }));

    it('should resume storage of a File', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    ChunkedUploadStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    ChunkedUploadStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();
                expect(value).to.equal('1234');
                done();
            });

            mockXhr.onCreate = (xhr) => {
                // request transfer id is POST
                setTimeout(() => {
                    if (xhr.method === 'HEAD') {
                        xhr.respond(
                            204,
                            {
                                'Access-Control-Expose-Headers': 'Upload-Offset',
                                'Upload-Offset': '0',
                            },
                            ''
                        );
                    } else if (xhr.method === 'PATCH') {
                        xhr.respond(204, { contentType: 'text/plain' }, '');
                    }
                }, 0);
            };

            const entry = {
                src: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                state: {
                    store: true,
                    value: '1234',
                },
            };

            entryTree.entries = [entry];
        }));

    it('should handle abort during transfer id request', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    ChunkedUploadStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    ChunkedUploadStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (!status.code.endsWith('ABORT')) return;

                unsub();
                expect(value).to.be.null;
                done();
            });

            mockXhr.onCreate = (xhr) => {
                setTimeout(() => {
                    xhr.abort();
                }, 0);
            };

            const entry = {
                src: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                state: {
                    store: true,
                },
            };
            entryTree.entries = [entry];
        }));
});
