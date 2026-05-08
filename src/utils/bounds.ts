import type { Rect } from './rect.js';

/** Element bounds */
export interface Bounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/** Creates a new bounds object */
export function boundsCreate(top = 0, right = 0, bottom = 0, left = 0): Bounds {
    return {
        top,
        right,
        bottom,
        left,
    };
}

/** Creates a new bounds object from a rect */
export function boundsFromRect(rect: Rect): Bounds {
    return {
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height,
        left: rect.x,
    };
}

export function boundsFromRects(...rects: Rect[]) {
    const bounds = rects.map(boundsFromRect);
    let { top, right, bottom, left } = bounds[0];
    for (let { top: t, right: r, bottom: b, left: l } of bounds) {
        top = Math.min(top, t);
        right = Math.max(right, r);
        bottom = Math.max(bottom, b);
        left = Math.min(left, l);
    }
    return boundsCreate(top, right, bottom, left);
}

/** Updates target bounds with values */
export function boundsUpdate(
    target: Bounds,
    top: number,
    right: number,
    bottom: number,
    left: number
): Bounds {
    target.top = top;
    target.right = right;
    target.bottom = bottom;
    target.left = left;
    return target;
}

/** Updates target bounds with property values of source bounds */
export function boundsUpdateWithBounds(target: Bounds, source: Bounds): Bounds {
    target.top = source.top;
    target.right = source.right;
    target.bottom = source.bottom;
    target.left = source.left;
    return target;
}

/** Tests if a is equal to b */
export function boundsEqual(a: Bounds, b: Bounds) {
    return a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;
}

/** Tests if a is outside of b */
export function boundsOutsideBounds(a: Bounds, b: Bounds) {
    return a.bottom < b.top || a.top > b.bottom || a.right < b.left || a.left > b.right;
}
