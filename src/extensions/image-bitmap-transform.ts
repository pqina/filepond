import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import { blobToFile } from '../utils/file.js';
import { getImageSize, getMediaSize } from '../utils/media.js';
import { rectApply, rectFromSize } from '../utils/rect.js';
import { sizeFromRect } from '../utils/size.js';
import { isFile, isFileEntry, isImageFile } from '../utils/test.js';
import { thread } from '../utils/thread.js';
import type { Extension } from './common/createExtension.js';
import {
    createTransformExtension,
    type TransformExtensionOptions,
} from './common/createTransformExtension.js';

export interface ImageBitmapTransformOptions extends TransformExtensionOptions {
    /** Target width, defaults to `undefined` */
    width?: number;

    /** Target height, defaults to `undefined` */
    height?: number;

    /** How to fit image if different aspect ratio, defaults to `'contain'` */
    fit?: 'cover' | 'contain' | 'force';

    /** Should we upscale smaller images, defaults to `false` */
    upscale?: boolean;

    /** Output aspect ratio, defaults to input aspect ratio */
    aspectRatio?: number;

    /** Output type, defaults to input file type */
    type?: string;

    /** Resize quality. Defaults to `'medium'` */
    quality?: 'pixelated' | 'low' | 'medium' | 'high';

    /** Compression quality. Value between `0` and `1`, defaults to `.98`, only applies to JPEG and WEBP output */
    compression?: number;

    /** Action name to use for rename. Defaults to `'transformImage'` */
    actionTransform?: string;
}

export const ImageBitmapTransform = createTransformExtension(
    'ImageBitmapTransform',
    {
        actionTransform: 'transformImage',
        width: undefined,
        height: undefined,
        upscale: false,
        fit: 'contain',
        aspectRatio: undefined,
        type: undefined,
        quality: 'medium',
        compression: 0.98,
        shouldTransform: () => true,
    } as ImageBitmapTransformOptions,
    ({ props, extensionName }) => {
        /** Tests if we can transform this entry */
        function canTransformEntry(entry: FilePondEntry): boolean | Promise<boolean> {
            return isFileEntry(entry) && isImageFile(entry.file) && !/svg/.test(entry.file.type);
        }

        /** Converts the passed file into a scaled image bitmap */
        function transformImageWorker(
            file: Blob,
            sx: number,
            sy: number,
            sw: number,
            sh: number,
            width: number,
            height: number,
            quality: 'pixelated' | 'low' | 'medium' | 'high',
            done: (err?: string | null, content?: any, transferList?: any[]) => void
        ) {
            createImageBitmap(file, sx, sy, sw, sh, {
                resizeWidth: width,
                resizeHeight: height,
                resizeQuality: quality,
                imageOrientation: 'from-image',
            }).then((bitmap) => {
                done(null, bitmap, [bitmap]);
            });
        }

        async function transformEntry(
            entry: FilePondFileEntry & { file: File },
            { abortController }: { abortController: AbortController }
        ) {
            const { aspectRatio, width, height, upscale, fit, quality, compression, type } = props;
            const { file } = entry;

            const entryExtension = entry.extension[extensionName];

            // @ts-ignore
            const currentHistory = [...(entryExtension.history ?? [])];

            // get media size so we can compute other sizes
            const imageSize = await getImageSize(file);
            if (imageSize === null) {
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
                // width & height descibe inner bounds
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
                    transformImageWorker,
                    [
                        file,
                        sourceRect.x,
                        sourceRect.y,
                        sourceRect.width,
                        sourceRect.height,
                        Math.round(targetSize.width),
                        Math.round(targetSize.height),
                        quality,
                    ],
                    {
                        abortController,
                    }
                )) as ImageBitmap;
            } catch (error) {
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
        }

        return {
            canTransformEntry,
            transformEntry,
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        ImageBitmapTransform: ImageBitmapTransformOptions;
    }
    interface defineFilePondOptions {
        ImageBitmapTransform: ImageBitmapTransformOptions;
    }
}
