import { getContext, setContext } from 'svelte';
import type { DragState } from '../index.js';

const key = {};

export interface DragContext {
    readonly current: DragState | undefined;
}

export function setDragContext(value: DragContext) {
    setContext(key, value);
}

export function getDragContext(): DragContext {
    return getContext(key);
}
