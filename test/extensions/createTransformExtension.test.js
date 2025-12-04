import { createTransformExtension } from '../../src/extensions/common/createTransformExtension.js';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { isFile } from '../../src/utils/test.js';

describe('createTransformExtension', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        const FileDataTransform = createTransformExtension('FileDataTransform', {}, () => {
            return {
                async transformEntry() {
                    // just returns a new file
                    return {
                        file: new File(['FOO BAR BAZ'], 'file-transformed.txt', {
                            type: 'text/plain',
                        }),
                    };
                },
            };
        });

        entryTree = createDefaultEntryTree();
        (extensionManager = createExtensionManager(entryTree)),
            (extensionManager.extensions = [FileDataTransform]);
    });

    it('should always transform a file object when no canTransformEntry set', (done) => {
        let didCallTransformEntry = false;

        const Foo = createTransformExtension('Foo', {}, function () {
            return {
                async transformEntry(entry) {
                    didCallTransformEntry = true;

                    return new File(['hello world'], 'foo.txt', { type: 'text/plain' });
                },
            };
        });

        extensionManager.extensions = [Foo];

        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                Foo: { status },
            } = entry.extension;

            if (!didCallTransformEntry) return;

            unsub();

            expect(entry.file.name).to.equal('foo.txt');
            expect(status.code).to.equal('TRANSFORM_COMPLETE');

            done();
        });

        const entry = {
            src: new File(['test'], 'file-original.txt', { type: 'text/plain' }),
            state: {
                transform: true,
            },
        };

        entryTree.entries = [entry];
    });

    it('should not transform file object when no file returned', (done) => {
        let didCallTransformEntry = false;

        const Foo = createTransformExtension('Foo', {}, function () {
            return {
                async transformEntry(entry) {
                    didCallTransformEntry = true;

                    // did not return a transformed file
                },
            };
        });

        extensionManager.extensions = [Foo];

        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                Foo: { status },
            } = entry.extension;

            if (!didCallTransformEntry) return;

            unsub();

            expect(status.code).to.equal('TRANSFORM_CANCEL');

            done();
        });

        const entry = {
            src: new File(['test'], 'original.txt', { type: 'text/plain' }),
            state: {
                transform: true,
            },
        };

        entryTree.entries = [entry];
    });

    it('should transform file objects when action set to true', (done) => {
        const unsub = entryTree.on('updateEntry', (entry) => {
            const {
                FileDataTransform: { status, hash },
            } = entry.extension;

            if (!status.code.endsWith('COMPLETE')) return;

            unsub();
            expect(hash).to.equal(entry.fileHash);
            expect(isFile(entry.file)).to.equal(true);
            expect(entry.file.name).to.equal('file-transformed.txt');
            done();
        });

        const entry = {
            src: new File(['foo bar baz'], 'file.txt', { type: 'text/plain' }),
            state: {
                transform: true,
            },
        };

        entryTree.entries = [entry];
    });

    it('should restore file to original when action set to false', (done) => {
        {
            const unsub = entryTree.on('updateEntry', (entry) => {
                const {
                    FileDataTransform: { status },
                } = entry.extension;

                if (!status.code.endsWith('COMPLETE')) return;

                // we just transformed the file, now we revert the transform
                unsub();

                {
                    const unsub = entryTree.on('updateEntry', (entry) => {
                        const {
                            FileDataTransform: { status, hash },
                        } = entry.extension;

                        if (!status.code.endsWith('TRANSFORM_IDLE')) return;

                        unsub();
                        expect(isFile(entry.file)).to.equal(true);
                        expect(entry.file.name).to.equal('file-original.txt');
                        done();
                    });

                    // no
                    entryTree.updateEntry(entry, {
                        state: {
                            transform: false,
                        },
                    });
                }
            });
        }

        //
        const entry = {
            src: new File(['foo bar baz'], 'file-original.txt', { type: 'text/plain' }),
            state: {
                transform: true,
            },
        };

        entryTree.entries = [entry];
    });

    it('should correctly apply two file transforms in extension order', (done) => {
        let transformOrder = [];

        const Foo = createTransformExtension(
            'Foo',
            {
                actionTransform: 'foo',
            },
            function () {
                return {
                    transformEntry(entry) {
                        transformOrder.push('foo');

                        return new File(['f'], 'file-foo.txt', { type: 'text/plain' });
                    },
                };
            }
        );

        const Bar = createTransformExtension(
            'Bar',
            {
                actionTransform: 'bar',
            },
            function () {
                return {
                    transformEntry(entry) {
                        transformOrder.push('bar');

                        return new File(['bar bar bar bar bar bar'], entry.file.name, {
                            type: 'text/plain',
                        });
                    },
                };
            }
        );

        extensionManager.extensions = [Foo, Bar];

        const unsub = entryTree.on('updateEntry', (entry) => {
            if (transformOrder.length < 2) return;

            unsub();
            expect(transformOrder.join('->')).to.equal('foo->bar');
            expect(entry.file.name).to.equal('file-foo.txt');
            expect(entry.file.size).to.equal(23);
            done();
        });

        const entry = {
            src: new File(['test'], 'file-original.txt', { type: 'text/plain' }),
            state: {
                foo: true,
                bar: true,
            },
        };

        entryTree.entries = [entry];
    });

    it('should run auto-transforms in correct order', (done) => {
        let transformState = {
            foo: 0,
            bar: 0,
            baz: 0,
        };

        const FooTransform = createTransformExtension('FooTransform', {}, () => {
            return {
                async transformEntry(entry) {
                    transformState.foo++;
                    const file = new File(['foo'], 'foo-' + entry.file.name, {
                        type: 'text/plain',
                    });
                    return {
                        file,
                    };
                },
            };
        });
        const BarTransform = createTransformExtension('BarTransform', {}, () => {
            return {
                async transformEntry(entry) {
                    transformState.bar++;
                    const file = new File(['bar'], 'bar-' + entry.file.name, {
                        type: 'text/plain',
                    });
                    return {
                        file,
                    };
                },
            };
        });

        const BazTransform = createTransformExtension('BazTransform', {}, () => {
            return {
                async transformEntry(entry) {
                    transformState.baz++;
                    const file = new File(['baz'], 'baz-' + entry.file.name, {
                        type: 'text/plain',
                    });
                    return {
                        file,
                    };
                },
            };
        });

        extensionManager.extensions = [
            [
                FooTransform,
                {
                    actionTransform: 'foo',
                    shouldTransform: (entry) => {
                        return true;
                    },
                },
            ],
            [
                BarTransform,
                {
                    actionTransform: 'bar',
                    shouldTransform: (entry) => {
                        return true;
                    },
                },
            ],
            [
                BazTransform,
                {
                    actionTransform: 'baz',
                    shouldTransform: (entry) => {
                        return true;
                    },
                },
            ],
        ];

        let loop = 0;
        const unsub = entryTree.on('updateEntry', (entry) => {
            const { BazTransform } = entry.extension;

            // failsafe
            if (loop++ > 100) {
                unsub();
                extensionManager.destroy();
            }

            if (!BazTransform?.status.code.endsWith('COMPLETE')) return;

            unsub();
            expect(isFile(entry.file)).to.equal(true);
            expect(entry.file.name).to.equal('baz-bar-foo-file.txt');
            expect(transformState.foo).to.equal(1);
            expect(transformState.bar).to.equal(1);
            expect(transformState.baz).to.equal(1);
            done();
        });

        const entry = {
            src: new File(['blank'], 'file.txt', { type: 'text/plain' }),
        };

        entryTree.entries = [entry];
    });

    it('should re-run auto-transforms when a transform extension is reset', (done) => {
        let transformState = {
            foo: 0,
            bar: 0,
            baz: 0,
        };

        const FooTransform = createTransformExtension('Foo', {}, () => {
            return {
                async transformEntry(entry) {
                    transformState.foo++;

                    const [name, extension] = entry.file.name.split('.');

                    const file = new File(['foo'], name + '_foo.' + extension, {
                        type: 'text/plain',
                    });

                    return {
                        file,
                    };
                },
            };
        });

        const BarTransform = createTransformExtension('Bar', {}, () => {
            return {
                async transformEntry(entry) {
                    transformState.bar++;

                    const [name, extension] = entry.file.name.split('.');

                    const file = new File(['bar'], name + '_bar.' + extension, {
                        type: 'text/plain',
                    });
                    return {
                        file,
                    };
                },
            };
        });

        const BazTransform = createTransformExtension('Baz', {}, () => {
            return {
                async transformEntry(entry) {
                    transformState.baz++;

                    const [name, extension] = entry.file.name.split('.');

                    const file = new File(['baz'], name + '_baz.' + extension, {
                        type: 'text/plain',
                    });
                    return {
                        file,
                    };
                },
            };
        });

        extensionManager.extensions = [
            [
                FooTransform,
                {
                    actionTransform: 'foo',
                },
            ],
            [
                BarTransform,
                {
                    actionTransform: 'bar',
                    shouldTransform: async () => {
                        return true;
                    },
                },
            ],
            [
                BazTransform,
                {
                    actionTransform: 'baz',
                    shouldTransform: async () => {
                        return true;
                    },
                },
            ],
        ];

        let loop = 0;
        const unsub = entryTree.on('updateEntry', (entry) => {
            const { BazTransform } = entry.extension;

            // failsafe
            if (loop++ > 100) {
                unsub();
                extensionManager.destroy();
            }

            // return;

            if (entry.file.name !== 'file_foo_bar_baz.txt') {
                return;
            }

            unsub();
            loop = 0;

            {
                // we can only reset foo transform as it doesn't have a shouldTransform

                // console.log('-------------');
                // console.log('----reset----');
                // console.log('-------------');

                entryTree.updateEntry(entry, {
                    state: {
                        foo: false,
                    },
                });

                const unsub = entryTree.on('updateEntry', (entry) => {
                    // const { BazTransform } = entry.extension;

                    // console.log('🧪 updateEntry', { entry: structuredClone(entry) });

                    if (loop++ > 100) {
                        unsub();
                        extensionManager.destroy();
                    }

                    if (entry.file.name !== 'file_bar_baz.txt') return;
                    // if (entry.file.name !== 'file_bar.txt') return;

                    // console.log(transformState);

                    // if (!BazTransform?.status.code.endsWith('COMPLETE')) return;

                    // if (BazTransform.status.code.endsWith('COMPLETE')) {
                    //     return;
                    // }

                    // return;
                    unsub();
                    // console.log(structuredClone(entry.file));

                    expect(isFile(entry.file)).to.equal(true);
                    // expect(entry.file.name).to.equal('baz-bar-file.txt');
                    expect(transformState.foo).to.equal(1);
                    expect(transformState.bar).to.equal(2);
                    expect(transformState.baz).to.equal(2);
                    done();
                });
            }
        });

        const entry = {
            src: new File(['blank'], 'file.txt', { type: 'text/plain' }),
            state: {
                foo: true,
            },
        };

        entryTree.entries = [entry];
    });
});
