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

    it('should resolve transfer id from response', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    ChunkedUploadStore,
                    {
                        url: 'store',
                        resolveResponse: {
                            create: ({ value, response, entry }) => {
                                expect(value).to.equal('');
                                expect(response.response).to.equal('');
                                expect(entry.file.name).to.equal('file.txt');

                                return entry.meta.transferId;
                            },
                        },
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
                expect(value).to.equal('5678');
                done();
            });

            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    if (xhr.method === 'POST') {
                        xhr.respond(201, { contentType: 'text/plain' }, '');
                    } else if (xhr.method === 'PATCH') {
                        const requestURL = new URL(xhr.requestData.url);
                        expect(requestURL.searchParams.get('id')).to.equal('5678');
                        xhr.respond(204, { contentType: 'text/plain' }, '');
                    }
                }, 0);
            };

            const entry = {
                src: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                meta: {
                    transferId: '5678',
                },
                state: {
                    store: true,
                },
            };
            entryTree.entries = [entry];
        }));

    it('should resolve request URL and options', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    ChunkedUploadStore,
                    {
                        url: 'store',
                        resolveRequest: {
                            create: ({ url, options, entry }) => {
                                expect(url).to.equal('store');
                                expect(options.method).to.equal('POST');
                                expect(entry.file.name).to.equal('file.txt');

                                return {
                                    url: 'signed-create',
                                    options: {
                                        ...options,
                                        queryString: {
                                            token: 'create',
                                        },
                                    },
                                };
                            },
                            chunk: ({ url, options, entry }) => {
                                expect(url).to.equal('store');
                                expect(options.method).to.equal('PATCH');
                                expect(entry.file.name).to.equal('file.txt');

                                return {
                                    url: 'signed-chunk',
                                    options: {
                                        ...options,
                                        queryString: {
                                            ...options.queryString,
                                            token: 'chunk',
                                        },
                                    },
                                };
                            },
                        },
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    ChunkedUploadStore: { status },
                } = entry.extension;

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();
                expect(status.code).to.equal('STORE_COMPLETE');
                done();
            });

            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    const requestURL = new URL(xhr.requestData.url);

                    if (xhr.method === 'POST') {
                        expect(requestURL.pathname).to.equal('/signed-create');
                        expect(requestURL.searchParams.get('token')).to.equal('create');
                        xhr.respond(201, { contentType: 'text/plain' }, '1234');
                    } else if (xhr.method === 'PATCH') {
                        expect(requestURL.pathname).to.equal('/signed-chunk');
                        expect(requestURL.searchParams.get('id')).to.equal('1234');
                        expect(requestURL.searchParams.get('token')).to.equal('chunk');
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

            mockXhr.onCreate = () => {
                setTimeout(() => {
                    entryTree.updateEntry(entryTree.entries[0], {
                        state: {
                            abort: true,
                        },
                    });
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
