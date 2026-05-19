import { it, describe, expect, beforeEach } from 'vitest';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createExtension } from '../../src/extensions/common/createExtension.js';
import { createEntryTree } from '../../src/core/entryTree.js';

describe('extensionManager', function () {
    let extensionManager;

    const createTestExtension = (
        name,
        props = {},
        factory = function () {
            return {
                destroy() {},
            };
        }
    ) =>
        createExtension({
            name,
            type: 'resource',
            props,
            factory,
        });

    beforeEach(() => {
        extensionManager = createExtensionManager({
            entryTree: createEntryTree(),
        });
    });

    it('should set extensions', function () {
        const Foo = createTestExtension('Foo');
        const Bar = createTestExtension('Bar');
        const Baz = createTestExtension('Baz');

        extensionManager.extensions = [Foo, Bar, Baz];
        expect(extensionManager.extensions.length).to.equal(3);
    });

    it('should remove extensions', () =>
        new Promise((done) => {
            const Foo = createTestExtension('Foo');

            const Bar = createTestExtension('Bar', {}, function () {
                return {
                    destroy() {
                        done();
                    },
                };
            });

            const Baz = createTestExtension('Baz');

            extensionManager.extensions = [Foo, Bar, Baz];

            extensionManager.extensions = [Foo, Baz];
        }));

    it('should correctly update extension props', () =>
        new Promise((done) => {
            const Foo = createTestExtension('Foo');

            const Bar = createTestExtension(
                'Bar',
                { bar: false },
                function ({ props, didSetProps }) {
                    didSetProps(() => {
                        if (props.bar === true) {
                            expect(props.bar).to.be.true;
                            done();
                        }
                    });

                    return {
                        destroy() {},
                    };
                }
            );

            const Baz = createTestExtension('Baz');

            extensionManager.extensions = [Foo, Bar, Baz];

            extensionManager.setExtensionProperties('Bar', {
                bar: true,
            });
        }));

    it('should cache extension props', () =>
        new Promise((done) => {
            const Foo = createTestExtension('Foo');

            const Bar = createTestExtension(
                'Bar',
                { bar: false },
                function ({ props, didSetProps }) {
                    didSetProps(() => {
                        if (props.bar === true) {
                            expect(props.bar).to.be.true;
                            done();
                        }
                    });

                    return {
                        destroy() {},
                    };
                }
            );

            const Baz = createTestExtension('Baz');

            extensionManager.setExtensionProperties('Bar', {
                bar: true,
            });

            extensionManager.extensions = [Foo, Bar, Baz];
        }));

    it('should set props with array', () =>
        new Promise((done) => {
            const Foo = createTestExtension('Foo');

            const Bar = createTestExtension(
                'Bar',
                { bar: false },
                function ({ props, didSetProps }) {
                    didSetProps(() => {
                        if (props.bar === true) {
                            expect(props.bar).to.be.true;
                            done();
                        }
                    });

                    return {
                        destroy() {},
                    };
                }
            );

            extensionManager.extensions = [Foo, [Bar, { bar: true }]];
        }));

    it('should handle undefined props when props set with array', function () {
        const Foo = createTestExtension('Foo');
        const Bar = createTestExtension('Bar');

        let error = null;
        try {
            extensionManager.extensions = [Foo, [Bar, undefined]];
        } catch (err) {
            error = err;
        }

        expect(error).to.be.null;
    });
});
