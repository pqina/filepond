import { FormPostStore } from '../../src/extensions/form-post-store.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { isFile } from '../../src/utils/test.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';

describe('FormPostStore', function () {
    beforeEach(function () {
        this.xhr = sinon.useFakeXMLHttpRequest();
    });

    afterEach(function () {
        this.xhr.restore();
    });

    it('should fail on invalid URL', function (done) {
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

        this.xhr.onCreate = (xhr) => {
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
    });

    it('should store a file and save server id', function (done) {
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

        this.xhr.onCreate = (xhr) => {
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
    });

    it('should store a file and metadata', function (done) {
        const entryTree = createDefaultEntryTree();
        const extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [
            [
                FormPostStore,
                {
                    url: 'store',
                    willRequestWithOptions: (src, requestOptions, entry) => {
                        requestOptions.formData.push(['entry', 'Hello World']);
                        return requestOptions;
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
        this.xhr.onCreate = (xhr) => {
            setTimeout(() => {
                requestBody = Array.from(xhr.requestBody.entries());

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
    });

    it('should attempt to store a file and abort', function (done) {
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

        this.xhr.onCreate = (xhr) => {
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
    });

    it('should correctly show state of already stored file', function (done) {
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
    });

    it('should revert store of a stored file', function (done) {
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
        this.xhr.onCreate = (xhr) => {
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
    });

    it('should restore a stored file when load set to true', function (done) {
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
        this.xhr.onCreate = (xhr) => {
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
    });
});
