import type { Rect } from './rect.js';
import type { Vector } from './vector.js';
import type { Bounds } from './bounds.js';

/** A size */
export interface Size {
    width: number;
    height: number;
}

/** Creates a new size */
export function sizeCreate(width: number = 0, height: number = 0): Size {
    return {
        width,
        height,
    };
}

/** Turns a rectangle into a size */
export function sizeFromRect(rect: Rect): Size {
    return {
        width: rect.width,
        height: rect.height,
    };
}

/** Turns a bounds into a size */
export function sizeFromBounds(bounds: Bounds): Size {
    return {
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
    };
}

/** Multiplies passed size by factor */
export function sizeMultiply(target: Size, factor: number): Size {
    target.width *= factor;
    target.height *= factor;
    return target;
}

export function sizeEqual(a: Size, b: Size) {
    return a.width === b.width && a.height === b.height;
}

/** Updates size with values */
export function sizeUpdate(target: Size, width: number, height: number) {
    target.width = width;
    target.height = height;
    return target;
}

/** Updates target size with property values of source size */
export function sizeUpdateWithSize(target: Size, source: Size): Size {
    target.width = source.width;
    target.height = source.height;
    return target;
}

/** Returns false if size defines zero pixels, either width or height is 0 */
export function sizeIsEmpty(size: Size): boolean {
    return size.width === 0 || size.height === 0;
}
