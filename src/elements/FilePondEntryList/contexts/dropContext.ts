import { getContext, setContext } from 'svelte';
import type { DropState } from '../types.js';

const key = {};

export interface DropContext {
    readonly current: DropState | undefined;
}

export function setDropContext(value: DropContext) {
    setContext(key, value);
}

export function getDropContext(): DropContext {
    return getContext(key);
}
