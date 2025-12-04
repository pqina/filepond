import type { Size } from '../../../../../utils/size.js';

const cache: WeakMap<Blob, { size: Size; canvas: HTMLCanvasElement | null }> = new WeakMap();

export function setBitmapCacheItem(
    file: Blob,
    data: { size: Size; canvas: HTMLCanvasElement | null }
) {
    cache.set(file, data);
}

export function getBitmapCacheItem(file: Blob) {
    return cache.get(file);
}
