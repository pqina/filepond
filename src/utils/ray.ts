import type { Vector } from './vector.js';
import type { Rect } from './rect.js';

export function rayIntersectsRect(position: Vector, vector: Vector, rect: Rect) {
    const { x: ox, y: oy } = position;
    const { x: dx, y: dy } = vector;
    const { x: rx, y: ry, width, height } = rect;

    const t1 = (rx - ox) / dx;
    const t2 = (rx + width - ox) / dx;
    const t3 = (ry - oy) / dy;
    const t4 = (ry + height - oy) / dy;

    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    return tmax >= Math.max(0, tmin);
}
