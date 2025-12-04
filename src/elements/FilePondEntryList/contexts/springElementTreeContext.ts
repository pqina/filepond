import type { Rect } from '../../../utils/rect.js';
import type { Size } from '../../../utils/size.js';
import type { Vector } from '../../../utils/vector.js';
import { getContext, setContext } from 'svelte';

const key = {};

export interface SpringElementContext {
    /** If the element is ready to be positioned, this is true if it has a parent rect */
    isReady: boolean;
    targetSize: Size | undefined;
    currentSize: Size | null;

    /** The client rectangle of the element */
    currentRect: Rect | null;
    currentRectCenter: Vector | null;
    currentScale: number;

    /** The total number of child springs */
    childSpringCount: number;
    /** The total number of child springs that are ready */
    childSpringReadyCount: number;

    /** A reference to the parent spring element */
    parent: SpringElementContext | null;
}

export function setSpringElementTreeContext(value: SpringElementContext) {
    setContext(key, value);
}

export function getSpringElementTreeContext(): SpringElementContext {
    return getContext(key);
}

export function hasSpringElementTreeContext() {
    return getContext(key) !== undefined;
}
