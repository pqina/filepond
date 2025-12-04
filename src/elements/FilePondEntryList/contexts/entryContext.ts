import { getContext, setContext } from 'svelte';
import type { FilePondEntry } from '../../../types/index.js';

const key = {};

interface EntryContext {
    readonly current: FilePondEntry;
}

export function setEntryContext(value: EntryContext) {
    setContext(key, value);
}

export function getEntryContext(): EntryContext {
    return getContext(key);
}
