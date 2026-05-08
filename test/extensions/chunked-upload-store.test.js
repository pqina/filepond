import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { ChunkedUploadStore } from '../../src/extensions/chunked-upload-store.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { MockXhr } from 'mock-xmlhttprequest';

describe('ChunkedUploadStore', function () {
    let mockXhr;

    beforeEach(function () {
        mockXhr = MockXhr;
        globalThis.XMLHttpRequest = mockXhr;
    });

    afterEach(function () {
        delete globalThis.XMLHttpRequest;
        mockXhr.onSend = null;
        mockXhr.onCreate = null;
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

    it('should update progress from upload request progress', () =>
        new Promise((done) => {
            const progressValues = [];
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

                if (status.code === 'STORE_BUSY' && Number.isFinite(status.progress)) {
                    progressValues.push(status.progress);
                }

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();
                expect(progressValues.some((value) => value > 0 && value < 1)).to.equal(true);
                done();
            });

            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    if (xhr.method === 'POST') {
                        xhr.respond(201, { contentType: 'text/plain' }, '1234');
                    } else if (xhr.method === 'PATCH') {
                        xhr.uploadProgress(5);
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
            let chunkResponseResolved = false;
            let completeRequestResolved = false;
            let completeResponseResolved = false;
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
                            chunk: ({ url, options, entry, chunk }) => {
                                expect(url).to.equal('store');
                                expect(options.method).to.equal('PATCH');
                                expect(entry.file.name).to.equal('file.txt');
                                expect(options.queryString.id).to.equal('1234');
                                expect(chunk.offset).to.equal(0);

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
                            complete: ({ url, options, entry, id, chunks }) => {
                                expect(url).to.equal('store');
                                expect(options.method).to.equal('POST');
                                expect(entry.file.name).to.equal('file.txt');
                                expect(id).to.equal('1234');
                                expect(chunks[0].id).to.equal('chunk-id');

                                completeRequestResolved = true;

                                return {
                                    url: 'signed-complete',
                                    options: {
                                        ...options,
                                        queryString: {
                                            ...options.queryString,
                                            token: 'complete',
                                        },
                                    },
                                };
                            },
                        },
                        resolveResponse: {
                            chunk: ({ value, response, entry, id, chunk }) => {
                                expect(value.index).to.equal(0);
                                expect(value.offset).to.equal(0);
                                expect(response.response).to.equal('');
                                expect(entry.file.name).to.equal('file.txt');
                                expect(id).to.equal('1234');
                                expect(chunk.offset).to.equal(0);

                                chunkResponseResolved = true;

                                return {
                                    ...value,
                                    id: 'chunk-id',
                                };
                            },
                            complete: ({ value, response, entry, id, chunks }) => {
                                expect(value).to.equal('stored-id');
                                expect(response.response).to.equal('stored-id');
                                expect(entry.file.name).to.equal('file.txt');
                                expect(id).to.equal('1234');
                                expect(chunks[0].id).to.equal('chunk-id');

                                completeResponseResolved = true;

                                return value;
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
                expect(chunkResponseResolved).to.equal(true);
                expect(completeRequestResolved).to.equal(true);
                expect(completeResponseResolved).to.equal(true);
                expect(entry.state.value).to.equal('stored-id');
                done();
            });

            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    const requestURL = new URL(xhr.requestData.url);

                    if (xhr.method === 'POST') {
                        if (requestURL.pathname === '/signed-create') {
                            expect(requestURL.searchParams.get('token')).to.equal('create');
                            xhr.respond(201, { contentType: 'text/plain' }, '1234');
                        } else {
                            expect(requestURL.pathname).to.equal('/signed-complete');
                            expect(requestURL.searchParams.get('id')).to.equal('1234');
                            expect(requestURL.searchParams.get('token')).to.equal('complete');
                            xhr.respond(200, { contentType: 'text/plain' }, 'stored-id');
                        }
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
                        resolveRequest: {
                            status: ({ url, options, entry }) => {
                                expect(url).to.equal('store');
                                expect(options.method).to.equal('HEAD');
                                expect(entry.file.name).to.equal('file.txt');
                                expect(options.queryString.id).to.equal('1234');

                                return { url, options };
                            },
                        },
                        resolveResponse: {
                            status: ({ value, response, entry }) => {
                                expect(value.id).to.equal('1234');
                                expect(value.offset).to.equal(0);
                                expect(response.response).to.equal('');
                                expect(entry.file.name).to.equal('file.txt');

                                return value;
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
