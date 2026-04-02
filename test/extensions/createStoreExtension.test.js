import { it, describe, expect, beforeEach } from 'vitest';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createStoreExtension } from '../../src/extensions/common/createStoreExtension.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { isFile } from '../../src/utils/test.js';

// The store extension is for storing and restoring file data in the current session

// To load files uploaded in a previous session we can use the URLLoader extension

describe('createStoreExtension', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        entryTree = createDefaultEntryTree();

        const TestStore = createStoreExtension(
            'TestStore',
            {
                shouldThrow: false,
            },
            ({ props, didSetProps }) => {
                async function storeEntry(entry, { abortController, onprogress, onabort }) {
                    const { shouldThrow } = props;

                    if (shouldThrow) {
                        console.log('in should throw');
                        throw new Error('OH NO');
                    }

                    // returns the storage id
                    return '1234';
                }

                async function releaseEntry(storageId) {
                    // returns true if release was a success
                    return true;
                }

                async function restoreEntry(storageId) {
                    // returns the stored file object
                    return new File(['Hello World'], 'file.txt', { type: 'plain/text' });
                }

                return {
                    storeEntry,
                    releaseEntry,
                    restoreEntry,
                };
            }
        );

        extensionManager = createExtensionManager(entryTree);
        extensionManager.extensions = [TestStore];
    });

    it('should set "canStore" to "true" when "file" property set', () =>
        new Promise((done) => {
            //
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status, canStore },
                } = entry.extension;

                if (status.code !== 'STORE_READY' && canStore) {
                    return;
                }

                expect(entry.src).to.equal(entry.file);
                unsub();
                done();
            });

            entryTree.entries = [
                {
                    src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
                },
            ];
        }));

    it('should store a file when "store" set to "true"', () =>
        new Promise((done) => {
            //
            const statusCodes = new Set();

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status, canStore },
                } = entry.extension;

                // record statuscodes in order
                statusCodes.add(status.code);

                // wait for store id to be set
                if (!entry.state.value) {
                    return;
                }

                unsub();

                try {
                    expect(canStore).to.be.true;
                    expect(entry.state.value).to.equal('1234');
                    expect(Array.from(statusCodes).join(', ')).to.equal(
                        'STORE_LIMBO, STORE_READY, STORE_QUEUED, STORE_BUSY, STORE_COMPLETE'
                    );
                    done();
                } catch (err) {
                    done(err);
                }
            });

            entryTree.entries = [
                {
                    src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
                    state: {
                        store: true,
                    },
                },
            ];
        }));

    it('should store a file when previous store operation failed', () =>
        new Promise((done) => {
            const statusCodes = new Set();

            extensionManager.setExtensionProperties('TestStore', { shouldThrow: true });

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status, canStore },
                } = entry.extension;

                // record statuscodes in order
                statusCodes.add(status.code);

                // wait for store id to be set
                if (status.code !== 'STORE_ERROR') {
                    return;
                }

                unsub();

                extensionManager.setExtensionProperties('TestStore', { shouldThrow: false });

                // listen
                const unsubInner = entryTree.on('updateEntry', (entry) => {
                    const {
                        TestStore: { status, canStore },
                    } = entry.extension;

                    // record statuscodes in order
                    statusCodes.add(status.code);

                    // wait for store id to be set
                    if (!entry.state.value) {
                        return;
                    }

                    unsubInner();

                    try {
                        expect(canStore).to.be.true;
                        expect(entry.state.value).to.equal('1234');
                        expect(Array.from(statusCodes).join(', ')).to.equal(
                            'STORE_LIMBO, STORE_READY, STORE_QUEUED, STORE_BUSY, STORE_ERROR, STORE_BUSY, STORE_COMPLETE'
                        );
                        done();
                    } catch (err) {
                        done(err);
                    }
                });

                // we have to wait for a bit as the current store task has to finish before we can retry
                setTimeout(() => {
                    // now try to store again
                    entryTree.updateEntry(entry.id, {
                        state: {
                            store: true,
                        },
                    });
                }, 16);
            });

            entryTree.entries = [
                {
                    src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
                    state: {
                        store: true,
                    },
                },
            ];
        }));

    it('should store a file when "shouldStore" is set to a function', () =>
        new Promise((done) => {
            let shouldStoreCalled = false;

            const TestStore = createStoreExtension('TestStore', {}, () => {
                async function storeEntry(entry, { abortController, onprogress, onabort }) {
                    // returns the storage id
                    return '1234';
                }

                async function releaseEntry(storageId) {
                    // returns true if release was a success
                    return true;
                }

                async function restoreEntry(storageId) {
                    // returns the stored file object
                    return new File(['Hello World'], 'file.txt', { type: 'plain/text' });
                }

                return {
                    storeEntry,
                    releaseEntry,
                    restoreEntry,
                };
            });

            extensionManager.extensions = [
                [
                    TestStore,
                    {
                        shouldStore: async function () {
                            shouldStoreCalled = true;
                            return true;
                        },
                    },
                ],
            ];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { canStore },
                } = entry.extension;

                // wait for store id to be set
                if (!entry.state.value) {
                    return;
                }

                unsub();
                expect(shouldStoreCalled).to.be.true;
                expect(canStore).to.be.true;
                expect(entry.state.value).to.equal('1234');
                done();
            });

            entryTree.entries = [
                {
                    src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
                },
            ];
        }));

    it('should abort store action when "store" set to "true" and "abort" set to "true"', () =>
        new Promise((done) => {
            const TestStore = createStoreExtension('TestStore', {}, () => {
                function storeEntry(_, { abortController, onabort }) {
                    return new Promise((resolve) => {
                        let timer;

                        abortController.signal.onabort = () => {
                            clearTimeout(timer);

                            // we need to call onabort when aborted
                            onabort();
                        };

                        // we just wait
                        timer = setTimeout(() => {
                            resolve('1234');
                        }, 100000);
                    });
                }

                return {
                    storeEntry,
                };
            });

            extensionManager.extensions = [TestStore];

            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status },
                } = entry.extension;

                if (status.code !== 'STORE_BUSY') {
                    return;
                }

                unsub();

                setTimeout(() => {
                    // abort the store action
                    entryTree.updateEntry(entry, {
                        state: {
                            abort: true,
                        },
                    });
                }, 0);

                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const {
                            TestStore: { status },
                        } = entry.extension;

                        if (status.code !== 'STORE_ABORT') {
                            return;
                        }

                        unsub();
                        expect(entry.state.abort).to.be.false;
                        expect(entry.state.store).to.be.null;
                        done();
                    });
                }
            });

            entryTree.entries = [
                {
                    src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
                    state: {
                        store: true,
                    },
                },
            ];
        }));

    it(`should set "canStore" to "false" if not storable`, () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status, canStore } = entry?.extension?.TestStore || {};

                if (status?.code !== 'STORE_IDLE') {
                    return;
                }

                unsub();
                expect(canStore).to.be.false;
                done();
            });

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: 100,
                },
            ];
        }));

    it(`shouldn't "store" an object when no value set`, () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status, canStore } = entry?.extension?.TestStore || {};

                if (status?.code !== 'STORE_IDLE') {
                    return;
                }

                unsub();
                expect(canStore).to.be.false;
                done();
            });

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: 100,
                    state: {
                        store: true,
                    },
                },
            ];
        }));

    it(`should mark an object as stored if "value" is set`, () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status, canStore } = entry?.extension?.TestStore || {};

                if (status?.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();
                expect(canStore).to.be.false;
                done();
            });

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: 100,
                    state: {
                        value: '1234',
                    },
                },
            ];
        }));

    it(`should mark a file as stored if "value" is set`, () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status, canStore },
                } = entry.extension;

                if (status.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();
                expect(canStore).to.be.true;
                expect(isFile(entry.file)).to.be.true;
                expect(entry.state.value).to.be.string;
                done();
            });

            entryTree.entries = [
                {
                    file: new File(['foo bar baz'], 'file.txt', {
                        type: 'text/plain',
                    }),
                    state: {
                        value: '1234',
                    },
                },
            ];
        }));

    it(`should mark an object as stored if "value" is set, and retain "store" state`, () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status, canStore } = entry?.extension?.TestStore || {};

                if (status?.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();
                expect(entry.state.store).to.be.true;
                expect(canStore).to.be.false;
                done();
            });

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: 100,
                    state: {
                        store: true,
                        value: '1234',
                    },
                },
            ];
        }));

    it(`should mark a file as stored if "value" is set, and retain "store" state`, () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status, canStore },
                } = entry.extension;

                if (status.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();
                expect(canStore).to.be.true;
                expect(isFile(entry.file)).to.be.true;
                expect(entry.state.value).to.be.string;
                expect(entry.state.store).to.be.true;
                done();
            });

            entryTree.entries = [
                {
                    file: new File(['foo bar baz'], 'file.txt', {
                        type: 'text/plain',
                    }),
                    state: {
                        value: '1234',
                        store: true,
                    },
                },
            ];
        }));

    it('should restore the file object if "value" is set and "load" set to "true"', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status, canStore } = entry?.extension?.TestStore || {};

                if (status?.code !== 'RESTORE_COMPLETE') {
                    return;
                }

                unsub();
                // should've restored the file
                expect(isFile(entry.file)).to.be.true;

                // should still be storable
                expect(canStore).to.be.true;

                // we finished load, so load state should still be true
                expect(entry.state.load).to.be.true;

                done();
            });

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: 100,
                    state: {
                        load: true,
                        value: '1234',
                    },
                },
            ];
        }));

    it('should release the stored file when "store" is set to "false"', () =>
        new Promise((done) => {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    TestStore: { status },
                } = entry.extension;

                if (status.code !== 'RELEASE_COMPLETE') return;

                unsub();
                // we still have a file object locally
                expect(isFile(entry.file)).to.be.true;

                // store state should remain false
                expect(entry.state.store).to.be.false;

                // we released the uploaded file so value is no longer valid
                expect(entry.state.value).to.be.null;
                done();
            });

            entryTree.entries = [
                {
                    src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
                    state: {
                        value: '1234',
                        store: false,
                    },
                },
            ];
        }));

    it('should restore a file object and then release file when "store" set to "false" and currently is not a file', () =>
        new Promise((done) => {
            // we need to trigger restore when `store=false` as when the store action is reverted, if we don't have the file, we can't re-upload again

            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status, canStore } = entry?.extension?.TestStore || {};

                if (status?.code !== 'RELEASE_COMPLETE') {
                    return;
                }

                unsub();
                expect(isFile(entry.file)).to.be.true;
                expect(canStore).to.be.true;
                expect(entry.state.value).to.be.null;
                expect(entry.state.store).to.be.false;
                done();
            });

            entryTree.entries = [
                {
                    name: 'file.txt',
                    type: 'text/plain',
                    size: 100,
                    state: {
                        store: false,
                        value: '1234',
                    },
                },
            ];
        }));

    it('should release a stored file when file data is updated', () =>
        new Promise((done) => {
            let releasedFile = null;

            const CustomStoreExtension = createStoreExtension('TestStore', {}, () => {
                async function storeEntry(entry, { abortController, onprogress, onabort }) {
                    releasedFile = '1234';
                    return '1234';
                }

                async function releaseEntry(storageId) {
                    // so we can remember which file was released
                    releasedFile = storageId;
                    return true;
                }

                async function restoreEntry() {
                    return new File(['restored'], 'foo.jpeg', { type: 'image/jpeg' });
                }

                return {
                    storeEntry,
                    releaseEntry,
                    restoreEntry,
                };
            });

            extensionManager.extensions = [CustomStoreExtension];

            // we first store a new file
            const unsub = entryTree.on('updateEntry', (entry) => {
                // wait for complete before we update the file

                const { status } = entry?.extension?.TestStore || {};

                // wait till stored
                if (status?.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();

                // now we listen for new changes and update the file data
                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const { status } = entry?.extension?.TestStore || {};

                        // not stored yet
                        if (status?.code !== 'RELEASE_COMPLETE') {
                            return;
                        }

                        // test if all went well
                        unsub();
                        expect(entry.file.name).to.equal('updated.txt');
                        expect(releasedFile).to.equal('1234');
                        expect(entry.state.value).to.be.null;
                        done();
                    });

                    // update the file
                    entryTree.updateEntry(entry, {
                        file: new File(['updated file'], 'updated.txt', {
                            type: 'text/plain ',
                        }),
                        state: {
                            // store is still "true", we set it to "null" to prevent auto-storing this new file
                            store: null,
                        },
                    });
                }
            });

            entryTree.entries = [
                {
                    src: new File(['orignal file'], 'original.txt', { type: 'text/plain' }),
                    state: {
                        // instantly store, this also means when file data is updated we release current and store the updated data
                        store: true,
                    },
                },
            ];
        }));

    it('should release file and store new file if "store" is "true" when file data is updated', () =>
        new Promise((done) => {
            // when a file is edited and stored, the file should automatically be uploaded again (and the previous upload should be released)

            // we're basically replacing a file on the server

            let releasedFile = null;

            const CustomStoreExtension = createStoreExtension('TestStore', {}, () => {
                let i = 0;
                async function storeEntry(entry, { abortController, onprogress, onabort }) {
                    i++;

                    // id for first file
                    if (i == 1) {
                        return '1234';
                    }

                    // id for second file
                    return '5678';
                }

                async function releaseEntry(storageId) {
                    // so we can remember which file was released
                    releasedFile = storageId;
                    return true;
                }

                return {
                    storeEntry,
                    releaseEntry,
                };
            });

            extensionManager.extensions = [CustomStoreExtension];

            // we first store a new file
            const unsub = entryTree.on('updateEntry', (entry) => {
                // wait for complete before we update the file
                const {
                    TestStore: { status },
                } = entry.extension;

                // wait till stored
                if (status.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();

                // now we listen for new changes and update the file data
                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const {
                            TestStore: { status },
                        } = entry.extension;

                        // not stored yet
                        if (status.code !== 'STORE_COMPLETE') {
                            return;
                        }

                        // test if all went well
                        unsub();
                        expect(entry.file.name).to.equal('updated.txt');
                        expect(releasedFile).to.equal('1234');
                        expect(entry.state.value).to.equal('5678');
                        done();
                    });

                    // update the file
                    entryTree.updateEntry(entry, {
                        file: new File(['updated file'], 'updated.txt', {
                            type: 'text/plain ',
                        }),
                    });
                }
            });

            entryTree.entries = [
                {
                    src: new File(['orignal file'], 'original.txt', { type: 'text/plain' }),
                    state: {
                        store: true,
                    },
                },
            ];
        }));

    it('should release a stored file when file data is updated on an object', () =>
        new Promise((done) => {
            let releasedFile = null;

            const CustomStoreExtension = createStoreExtension('TestStore', {}, () => {
                async function storeEntry(entry, { abortController, onprogress, onabort }) {
                    releasedFile = '1234';
                    return '1234';
                }

                async function releaseEntry(storageId) {
                    // so we can remember which file was released
                    releasedFile = storageId;
                    return true;
                }

                async function restoreEntry() {
                    return new File(['restored'], 'foo.jpeg', { type: 'image/jpeg' });
                }

                return { restoreEntry, storeEntry, releaseEntry };
            });

            extensionManager.extensions = [CustomStoreExtension];

            // we first store a new file
            const unsub = entryTree.on('updateEntry', (entry) => {
                const { status } = entry?.extension?.TestStore || {};

                // wait till stored
                if (status?.code !== 'STORE_COMPLETE') {
                    return;
                }

                unsub();

                // now we listen for new changes and update the file data
                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const {
                            TestStore: { status },
                        } = entry.extension;

                        // not stored yet
                        if (status.code !== 'RELEASE_COMPLETE') {
                            return;
                        }

                        // test if all went well
                        unsub();
                        expect(entry.file.name).to.equal('updated.txt');
                        expect(releasedFile).to.equal('1234');
                        expect(entry.state.value).to.be.null;
                        done();
                    });

                    // update the file
                    entryTree.updateEntry(entry, {
                        file: new File(['updated file'], 'updated.txt', {
                            type: 'text/plain ',
                        }),
                    });
                }
            });

            entryTree.entries = [
                {
                    name: 'foo.jpeg',
                    size: 1234,
                    state: {
                        value: '1234',
                    },
                },
            ];
        }));
});
