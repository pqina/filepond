import type { Rect } from '../utils/rect.js';

/** Converts the passed file into a scaled image bitmap in a separate thread */
export function transformImage(
    file: Blob,
    origin: Rect | null,
    options: ImageBitmapOptions | null,
    done: (err?: string | null, content?: any, transferList?: any[]) => void
) {
    const params = (!!origin ? [file, ...Object.values(origin), options] : [file, options]) as any;
    createImageBitmap.apply(null, params).then((bitmap) => {
        done(null, bitmap, [bitmap]);
    });
}

transformImage.fileName = 'transformImage';
