import type { Vector } from './vector.js';
import type { Bounds } from './bounds.js';

import { vectorCreate } from './vector.js';

/** A rectangle */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Creates a new rectangle */
export function rectCreate(x = 0, y = 0, width = 0, height = 0): Rect {
    return {
        x,
        y,
        width,
        height,
    };
}

export function rectFromBounds(bounds: Bounds): Rect {
    return {
        x: bounds.left,
        y: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
    };
}

/** Updates rectangle A with values */
export function rectUpdate(
    target: Rect,
    x: number,
    y: number,
    width: number,
    height: number
): Rect {
    target.x = x;
    target.y = y;
    target.width = width;
    target.height = height;
    return target;
}

/** Updates target rectangle with property values of source rectangle */
export function rectUpdateWithRect(target: Rect, source: Rect) {
    target.x = source.x;
    target.y = source.y;
    target.width = source.width;
    target.height = source.height;
    return target;
}

/** Updates rectangle A with properties of rectangle B */
export function rectEqual(a: Rect, b: Rect) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

export function rectCenter(rect: Rect) {
    return vectorCreate(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5);
}

/** Tests if rectangles a and b overlap */
export function rectIntersectWithRect(a: Rect, b: Rect) {
    const aLeft = a.x;
    const aRight = a.x + a.width;
    const aTop = a.y;
    const aBottom = a.y + a.height;

    const bLeft = b.x;
    const bRight = b.x + b.width;
    const bTop = b.y;
    const bBottom = b.y + b.height;

    return !(aLeft > bRight || bLeft > aRight || aTop > bBottom || bTop > aBottom);
}

export function rectGetCorners(rect: Rect) {
    return [
        vectorCreate(rect.x, rect.y),
        vectorCreate(rect.x + rect.width, rect.y),
        vectorCreate(rect.x + rect.width, rect.y + rect.height),
        vectorCreate(rect.x, rect.y + rect.height),
    ];
}

/** Tests if rect contains point */
export function rectContainsPoint(r: Rect, v: Vector) {
    if (v.x < r.x) {
        return false;
    }
    if (v.y < r.y) {
        return false;
    }
    if (v.x > r.x + r.width) {
        return false;
    }
    if (v.y > r.y + r.height) {
        return false;
    }
    return true;
}

/** Returns a new scaled rectangle */
export function rectScale(rect: Rect, scalar: number, pivot?: Vector): Rect {
    pivot = pivot ?? rectCenter(rect);
    return {
        x: scalar * (rect.x - pivot.x) + pivot.x,
        y: scalar * (rect.y - pivot.y) + pivot.y,
        width: scalar * rect.width,
        height: scalar * rect.height,
    };
}

/** Returns a new translated rectangle */
export function rectTranslate(rect: Rect, translation: Vector): Rect {
    return {
        x: rect.x + translation.x,
        y: rect.y + translation.y,
        width: rect.width,
        height: rect.height,
    };
}

/** Returns a new padded rectangle */
export function rectPad(rect: Rect, padding: number): Rect {
    return {
        x: rect.x - padding,
        y: rect.y - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
    };
}
