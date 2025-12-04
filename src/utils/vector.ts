import type { Rect } from './rect.js';

import { elastify } from './math.js';

export const ORIGIN = vectorCreate();

/** A vector */
export interface Vector {
    x: number;
    y: number;
}

/** Creates a new vector */
export function vectorCreate(x = 0, y = 0): Vector {
    return {
        x,
        y,
    };
}

/** Turns a rectangle into a vector */
export function vectorFromRect(rect: Rect) {
    return vectorCreate(rect.x, rect.y);
}

/** Returns squared distanced between vectors */
export function vectorDistanceSquared(a: Vector, b: Vector) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    return x * x + y * y;
}

/** Returns squared distanced between vectors */
export function vectorLengthSquared(v: Vector) {
    return vectorDistanceSquared(v, vectorCreate());
}

/** Returns square root of distance between vectors */
export function vectorDistance(a: Vector, b: Vector) {
    return Math.sqrt(vectorDistanceSquared(a, b));
}

/** Adds vector `b` to vector `a` and returns a new vector */
export function vectorAdd(a: Vector, b: Vector) {
    return vectorCreate(a.x + b.x, a.y + b.y);
}

/** Subtract vector `b` from vector `a` and returns a new vector */
export function vectorSubtract(a: Vector, b: Vector) {
    return vectorCreate(a.x - b.x, a.y - b.y);
}

/** Tests if vector `a` and `b` are equal */
export function vectorEqual(a: Vector, b: Vector) {
    return a.x === b.x && a.y === b.y;
}

/** Clones vector */
export function vectorClone(v: Vector) {
    return vectorCreate(v.x, v.y);
}

/** Vector dot product */
export function vectorDotProduct(a: Vector, b: Vector) {
    return a.x * b.x + a.y * b.y;
}

/** Is vector `v` pointing from `origin` to `target` */
export function isVectorPointingTowardsPoint(v: Vector, origin: Vector, target: Vector) {
    return (
        vectorDotProduct(v, {
            x: target.x - origin.x,
            y: target.y - origin.y,
        }) > 0
    );
}

/** Returns new normalized vector, or 0,0 if length is 0 */
export function vectorNormalize(v: Vector) {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) {
        return vectorCreate();
    }
    return vectorCreate(v.x / length, v.y / length);
}

/** Returns vector angle in radians */
export function vectorAngle(v: Vector) {
    return Math.atan2(v.y, v.x);
}

/** Returns inverted copy of vector */
export function vectorInvert(v: Vector) {
    return vectorCreate(-v.x, -v.y);
}

/** Returns new elastified vector between `a` and `b` */
export function vectorElastify(a: Vector, b: Vector, dist: number) {
    if (!b || !dist) {
        return { ...a };
    }
    return vectorCreate(a.x + elastify(b.x - a.x, dist), a.y + elastify(b.y - a.y, dist));
}
