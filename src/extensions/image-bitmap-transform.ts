import { blobToFile } from '../utils/file.js';
import { getImageSize } from '../utils/media.js';
import { rectApply, rectFromSize } from '../utils/rect.js';
import { sizeFromRect, sizeIsEmpty } from '../utils/size.js';
import { didAbort } from '../utils/abort.js';
import { isFileEntry, isImageFile } from '../utils/test.js';
import { createThreadWorker, thread } from '../utils/thread.js';
import {
    createTransformExtension,
    type TransformExtensionCanTransformFunction,
    type TransformExtensionOptions,
    type TransformExtensionTransformFunction,
} from './common/createTransformExtension.js';
import { transformImage } from '../workers/transformImage.js';

export interface ImageBitmapTransformOptions extends TransformExtensionOptions {
    /** Image target width, defaults to `undefined` */
    width?: number;

    /** Image target height, defaults to `undefined` */
    height?: number;

    /** How to fit image in target size bounds, defaults to `'contain'` */
    fit?: 'cover' | 'contain' | 'force';

    /** Should we upscale images, defaults to `false` */
    upscale?: boolean;

    /** Output aspect ratio, defaults to input image aspect ratio */
    aspectRatio?: number;

    /** Output format type, defaults to input image type, some example types are `'image/jpeg'`, `'image/webp'`, and `'image/png'`, limited to what the canvas `toBlob` method can output for the current browser */
    type?: string;

    /** Resize quality. Defaults to `'medium'` */
    quality?: 'pixelated' | 'low' | 'medium' | 'high';

    /** Compression quality. Value between `0` and `1`, defaults to `.98`, only applies to JPEG and WEBP output */
    compression?: number;

    /** Where the extension can find the WebWorker to use */
    workersURL?: URL;

    /** Action name to use for rename. Defaults to `'transformImage'` */
    actionTransform?: string;
}

export const ImageBitmapTransform = createTransformExtension({
    name: 'ImageBitmapTransform',
    props: {
        actionTransform: 'transformImage',
        width: undefined,
        height: undefined,
        upscale: false,
        fit: 'contain',
        aspectRatio: undefined,
        type: undefined,
        quality: 'medium',
        compression: 0.98,
        workersURL: undefined,
        shouldTransform: () => true,
    } as ImageBitmapTransformOptions,
    factory: ({ props, extensionName }) => {
        /** Tests if we can transform this entry */
        const canTransformEntry: TransformExtensionCanTransformFunction = (entry) => {
            return isFileEntry(entry) && isImageFile(entry.file) && !/svg/i.test(entry.file.type);
        };

        const transformEntry: TransformExtensionTransformFunction = async (entry, { signal }) => {
            const {
                aspectRatio,
                width,
                height,
                upscale,
                fit,
                quality,
                compression,
                type,
                workersURL,
            } = props;
            const { file } = entry;

            const entryExtension = entry.extension[extensionName];

            // @ts-ignore
            const currentHistory = [...(entryExtension.history ?? [])];

            // get media size so we can compute other sizes
            const imageSize = await getImageSize(file);
            if (imageSize === null || sizeIsEmpty(imageSize)) {
                throw 'Failed to read image size';
            }

            // if crop aspect ratio is set we calculate sx, sy, sw, and sh
            const sourceRect = rectApply(rectFromSize(imageSize, aspectRatio), Math.round);

            // calculate target size
            let targetSize = sizeFromRect(sourceRect);
            if (width || height) {
                const sourceAspectRatio = sourceRect.width / sourceRect.height;
                const computedAspectRatio = aspectRatio || sourceAspectRatio;

                let computedWidth = width;
                let computedHeight = height;

                if (!computedHeight) {
                    computedHeight = computedWidth / computedAspectRatio;
                } else if (!computedWidth) {
                    computedWidth = computedHeight * computedAspectRatio;
                }

                // usually this is overruled by contain or cover, else this is the forced size
                targetSize.width = computedWidth;
                targetSize.height = computedHeight;

                // width & height describe outer bounds
                if (fit === 'contain') {
                    if (computedWidth > computedHeight) {
                        targetSize.width = computedHeight * computedAspectRatio;
                    } else {
                        targetSize.height = computedWidth / computedAspectRatio;
                    }
                }
                // width & height describe inner bounds
                else if (fit === 'cover') {
                    if (computedWidth > computedHeight) {
                        targetSize.height = computedWidth / computedAspectRatio;
                    } else {
                        targetSize.width = computedHeight * computedAspectRatio;
                    }
                }

                // we're not allowed to upscale so we scale down to fit the max source rect
                if (
                    !upscale &&
                    (targetSize.width > sourceRect.width || targetSize.height > sourceRect.height)
                ) {
                    const scalar = Math.min(
                        sourceRect.width / targetSize.width,
                        sourceRect.height / targetSize.height
                    );
                    targetSize.width *= scalar;
                    targetSize.height *= scalar;
                }
            }

            // we need to run this in a thread
            // - Chrome will automatically run `createImageBitmap` in a thread
            // - Firefox and Safari won't
            let bitmap: ImageBitmap;
            try {
                bitmap = (await thread(
                    createThreadWorker(workersURL, transformImage),
                    [
                        file,
                        sourceRect,
                        {
                            resizeWidth: Math.round(targetSize.width),
                            resizeHeight: Math.round(targetSize.height),
                            resizeQuality: quality,
                            imageOrientation: 'from-image',
                        },
                    ],
                    {
                        signal,
                    }
                )) as ImageBitmap;
            } catch (error) {
                if (didAbort(signal, error)) {
                    throw error;
                }

                throw 'Failed to create image bitmap';
            }

            // transfer bitmap to canvas
            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            const ctx = canvas.getContext('bitmaprenderer');
            if (ctx === null) {
                throw 'Failed to create bitmap renderer';
            }
            ctx.transferFromImageBitmap(bitmap);

            // turn canvas into file
            let blob;
            try {
                blob = await canvas.convertToBlob({
                    type: type || file.type,
                    quality: compression,
                });
            } catch (error) {
                throw 'Failed to convert canvas to blob';
            }
            const resizedFile = blobToFile(blob, file.name);

            // return resized image file
            return {
                file: resizedFile,
                history: [...currentHistory, resizedFile],
            };
        };

        return {
            canTransformEntry,
            transformEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ImageBitmapTransform: ImageBitmapTransformOptions;
    }
    interface defineFilePondOptions {
        ImageBitmapTransform?: ImageBitmapTransformOptions;
    }
}
