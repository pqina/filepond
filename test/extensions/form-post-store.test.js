import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { FormPostStore } from '../../src/extensions/form-post-store.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { isFile } from '../../src/utils/test.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { MockXhr } from 'mock-xmlhttprequest';

describe('FormPostStore', function () {
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
                    FormPostStore,
                    {
                        url: 'invalid-url',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FormPostStore: { status },
                } = entry.extension;

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

    it('should store a file and save server id', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    FormPostStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FormPostStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (!status.code.endsWith('COMPLETE')) return;

                unsub();
                expect(status.code).to.equal('STORE_COMPLETE');
                expect(value).to.equal('1234');
                done();
            });

            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(200, { contentType: 'text/plain' }, '1234');
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

    it('should store a file and metadata', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);

            extensionManager.extensions = [
                [
                    FormPostStore,
                    {
                        url: 'store',
                        resolveRequest: ({ url, options, entry }) => {
                            expect(options.method).to.equal('POST');
                            expect(url).to.equal('store');
                            expect(entry.file.name).to.equal('file.txt');

                            options.formData.push(['entry', 'Hello World']);

                            return {
                                url: 'signed-store',
                                options,
                            };
                        },
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FormPostStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (!status.code.endsWith('COMPLETE')) {
                    return;
                }

                unsub();
                expect(requestBody[0][1] instanceof File).to.be.true;
                expect(requestBody[1][1]).to.equal('Hello World');
                expect(status.code).to.equal('STORE_COMPLETE');
                expect(value).to.equal('1234');
                done();
            });

            let requestBody;
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    expect(new URL(xhr.requestData.url).pathname).to.equal('/signed-store');
                    requestBody = Array.from(xhr.requestData.body.entries());
                    xhr.respond(200, { contentType: 'text/plain' }, '1234');
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

    it('should attempt to store a file and abort', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    FormPostStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FormPostStore: { status },
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

    it('should correctly show state of already stored file', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    FormPostStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FormPostStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (status.type !== 'success') return;

                unsub();
                expect(status.code).to.equal('STORE_COMPLETE');
                expect(value).to.equal('1234');
                done();
            });

            const entry = {
                file: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                state: {
                    value: '1234',
                    store: true,
                },
            };

            entryTree.entries = [entry];
        }));

    it('should revert store of a stored file', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    FormPostStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                if (!entry.extension.FormPostStore) {
                    return;
                }

                const {
                    FormPostStore: { status },
                } = entry.extension;

                const { value } = entry.state;

                if (!status.code.endsWith('RELEASE_COMPLETE')) {
                    return;
                }

                unsub();
                expect(value).to.equal(null);
                done();
            });

            // reverted
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(200);
                }, 0);
            };

            const entry = {
                file: new File(['hello world'], 'file.txt', { type: 'text/plain' }),
                state: {
                    store: false,
                    value: '1234',
                },
            };

            entryTree.entries = [entry];
        }));

    it('should restore a stored file when load set to true', () =>
        new Promise((done) => {
            const entryTree = createDefaultEntryTree();
            const extensionManager = createExtensionManager(entryTree);
            extensionManager.extensions = [
                [
                    FormPostStore,
                    {
                        url: 'store',
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.FormPostStore || {};

                const { value } = entry.state;

                if (!isFile(entry.file)) {
                    return;
                }

                unsub();
                expect(status.code).to.equal('RESTORE_COMPLETE');
                expect(value).to.equal('1234');
                expect();

                done();
            });

            // reverted
            mockXhr.onSend = (xhr) => {
                setTimeout(() => {
                    xhr.respond(
                        200,
                        {
                            'Content-Type': 'text/plain',
                            'Content-Disposition': 'attachment; filename=file.txt',
                        },
                        'dummy-text'
                    );
                }, 0);
            };

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: '10',
                    state: {
                        load: true,
                        value: '1234',
                    },
                },
            ];
        }));
});
