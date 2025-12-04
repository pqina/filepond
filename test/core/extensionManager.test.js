import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createExtension } from '../../src/extensions/common/createExtension.js';

describe('extensionManager', function () {
    let extensionManager;
    beforeEach(() => {
        extensionManager = createExtensionManager({
            on: () => {
                return () => {};
            },
            entries: [],
        });
    });

    it('should set extensions', function () {
        const Foo = createExtension('Foo', {}, function () {
            return {
                destroy() {},
            };
        });

        const Bar = createExtension('Bar', {}, function () {
            return {
                destroy() {},
            };
        });

        const Baz = createExtension('Baz', {}, function () {
            return {
                destroy() {},
            };
        });

        extensionManager.extensions = [Foo, Bar, Baz];
        expect(extensionManager.extensions.length).to.equal(3);
    });

    it('should remove extensions', function (done) {
        const Foo = createExtension('Foo', {}, function () {
            return {
                destroy() {},
            };
        });

        const Bar = createExtension('Bar', {}, function () {
            return {
                destroy() {
                    done();
                },
            };
        });

        const Baz = createExtension('Baz', {}, function () {
            return {
                destroy() {},
            };
        });

        extensionManager.extensions = [Foo, Bar, Baz];

        extensionManager.extensions = [Foo, Baz];
    });

    it('should correctly update extension props', function (done) {
        const Foo = createExtension('Foo', {}, function () {
            return {
                destroy() {},
            };
        });

        const Bar = createExtension('Bar', { bar: false }, function ({ props, didSetProps }) {
            didSetProps(() => {
                if (props.bar === true) {
                    expect(props.bar).to.be.true;
                    done();
                }
            });

            return {
                destroy() {},
            };
        });

        const Baz = createExtension('Baz', {}, function () {
            return {
                destroy() {},
            };
        });

        extensionManager.extensions = [Foo, Bar, Baz];

        extensionManager.setExtensionProperties('Bar', {
            bar: true,
        });
    });

    it('should cache extension props', function (done) {
        const Foo = createExtension('Foo', {}, function () {
            return {
                destroy() {},
            };
        });

        const Bar = createExtension('Bar', { bar: false }, function ({ props, didSetProps }) {
            didSetProps(() => {
                if (props.bar === true) {
                    expect(props.bar).to.be.true;
                    done();
                }
            });

            return {
                destroy() {},
            };
        });

        const Baz = createExtension('Baz', {}, function () {
            return {
                destroy() {},
            };
        });

        extensionManager.setExtensionProperties('Bar', {
            bar: true,
        });

        extensionManager.extensions = [Foo, Bar, Baz];
    });

    it('should set props with array', function (done) {
        const Foo = createExtension('Foo', {}, function () {
            return {
                destroy() {},
            };
        });

        const Bar = createExtension('Bar', { bar: false }, function ({ props, didSetProps }) {
            didSetProps(() => {
                if (props.bar === true) {
                    expect(props.bar).to.be.true;
                    done();
                }
            });

            return {
                destroy() {},
            };
        });

        extensionManager.extensions = [Foo, [Bar, { bar: true }]];
    });

    it('should handle undefined props when props set with array', function () {
        const Foo = createExtension('Foo', {}, function () {
            return {
                destroy() {},
            };
        });

        const Bar = createExtension('Bar', {}, function () {
            return {
                destroy() {},
            };
        });

        let error = null;
        try {
            extensionManager.extensions = [Foo, [Bar, undefined]];
        } catch (err) {
            error = err;
        }

        expect(error).to.be.null;
    });
});
