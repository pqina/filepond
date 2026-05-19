import { it, describe, expect, beforeEach } from 'vitest';
import { createExtensionManager } from '../../src/core/extensionManager.js';
import { createDefaultEntryTree } from '../stub/createDefaultEntryTree.js';
import { CanvasLoader } from '../../src/extensions/canvas-loader.js';
import { ImageBitmapTransform } from '../../src/extensions/image-bitmap-transform.js';
import { getImageSize } from '../../src/utils/media.js';

function createCanvas(width = 256, height = width) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return canvas;
}

function waitForTransformComplete(entryTree, cb) {
    const unsub = entryTree.on('updateEntry', (entry) => {
        const { status } = entry?.extension?.ImageBitmapTransform || {};
        if (status?.code !== 'TRANSFORM_COMPLETE') {
            return;
        }
        unsub();
        cb(entry);
    });
}

describe('ImageBitmapTransform', () => {
    let entryTree;
    let extensionManager;

    beforeEach(() => {
        entryTree = createDefaultEntryTree();
        extensionManager = createExtensionManager({ entryTree });
        extensionManager.extensions = [CanvasLoader, ImageBitmapTransform];
    });

    describe('image formatting', () => {
        it('should output JPG', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    type: 'image/jpeg',
                });

                waitForTransformComplete(entryTree, (entry) => {
                    expect(entry.file.type).to.equal('image/jpeg');
                    done();
                });

                entryTree.entries = [
                    {
                        src: createCanvas(),
                    },
                ];
            }));

        it('should output PNG if is invalid output format', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    type: 'image/foo',
                });

                waitForTransformComplete(entryTree, (entry) => {
                    expect(entry.file.type).to.equal('image/png');
                    done();
                });

                entryTree.entries = [
                    {
                        src: createCanvas(),
                    },
                ];
            }));
    });

    describe('image compression', () => {
        it('should compress JPEG', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    type: 'image/jpeg',
                    compression: 0.01,
                });

                // default compression .98 size = 78.539, 0.01 is 10.699
                const canvas = createCanvas(1280, 1280);

                waitForTransformComplete(entryTree, (entry) => {
                    expect(entry.file.size).toBeLessThan(20000);
                    done();
                });

                entryTree.entries = [{ src: canvas }];
            }));
    });

    describe('image resizing', () => {
        it('should resize image to fit in width', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    width: 64,
                });

                const canvas = createCanvas(1024, 768);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(64);
                        expect(size.height).toEqual(48);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should resize image to fit in height', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    height: 384,
                });

                const canvas = createCanvas(1024, 768);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(512);
                        expect(size.height).toEqual(384);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should resize image to fit when given width and height', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    width: 256,
                    height: 512,
                });

                const canvas = createCanvas(1024, 768);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(256);
                        expect(size.height).toEqual(192);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should resize image to cover a given width and height', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    width: 512,
                    height: 512,
                    fit: 'cover',
                });

                const canvas = createCanvas(1024, 768);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(683);
                        expect(size.height).toEqual(512);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should not upscale by default', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    width: 512,
                    height: 512,
                });

                const canvas = createCanvas(64, 64);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(64);
                        expect(size.height).toEqual(64);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should upscale image when upscale is set to true', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    width: 128,
                    height: 128,
                    upscale: true,
                });

                const canvas = createCanvas(64, 64);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(128);
                        expect(size.height).toEqual(128);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should force resize an image', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    width: 64,
                    height: 128,
                    fit: 'force',
                });

                const canvas = createCanvas(256, 128);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(64);
                        expect(size.height).toEqual(128);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));
    });

    describe('image cropping', () => {
        it('should crop a square', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    aspectRatio: 1,
                });

                const canvas = createCanvas(1024, 768);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(768);
                        expect(size.height).toEqual(768);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should crop landscape', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    aspectRatio: 16 / 9,
                });

                const canvas = createCanvas(1000, 1000);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(1000);
                        expect(size.height).toEqual(563);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));

        it('should crop landscape and round correctly', () =>
            new Promise((done) => {
                extensionManager.setExtensionProperties('ImageBitmapTransform', {
                    aspectRatio: 16 / 9,
                });

                const canvas = createCanvas(1000, 562);

                waitForTransformComplete(entryTree, (entry) => {
                    getImageSize(entry.file).then((size) => {
                        expect(size.width).toEqual(999);
                        expect(size.height).toEqual(562);
                        done();
                    });
                });

                entryTree.entries = [{ src: canvas }];
            }));
    });
});
