import type { Needle, FilePondEntry, FilePondEntrySource } from '../../types/index.js';
import type { Vector } from '../../utils/vector.js';

/** Internal interface for animating entries */
export interface AnimatedEntry {
    /** Is this entry animation delayed */
    delayed: boolean;

    /** The current entry being animated */
    entry: FilePondEntry;

    /** The name of the animation to run */
    animation: string;

    /** Called when the entry load is cancelled */
    oncancel: () => void;

    /** Called when the entry intro has completed */
    oncomplete: () => void;
}

export interface DragInteraction {
    id: string;
    element: HTMLElement | undefined;

    // for pointer interaction
    offset?: Vector;
    translation?: Vector;
    vector?: Vector;
    viewPosition?: Vector;

    // for keyboard interaction
    direction?: 'none' | 'up' | 'down' | 'left' | 'right';
}

export interface DropState {
    id?: string;
    remove: boolean;
}

export interface DragState {
    id: string;
    index: number;
    element: HTMLElement | undefined;
    offset?: Vector;
    translation?: Vector;
    parentTranslation?: Vector;
    outside?: boolean;
}

export interface AppCallbacks {
    setEntries: (entries: FilePondEntry[]) => void;
    insertEntries: (
        entry: FilePondEntrySource | FilePondEntrySource[],
        index?: number | number[]
    ) => void;
    removeEntries: (
        ...needles: Needle[]
    ) =>
        | ({ entry: FilePondEntry; index: number[] } | void)[]
        | { entry: FilePondEntry; index: number[] }
        | void;
    updateEntry: (needle: Needle, ...props: any[]) => void;
    setEntryExtensionState: (entry: FilePondEntry, props: { [key: string]: any }) => void;
    getEntryExtensionState: (entry: FilePondEntry) => { [key: string]: any };
    pushTask: (
        id: string,
        fn: Function,
        options?: { parallel?: number; ignoreSoftFailure?: boolean }
    ) => void;
    abortTask: (id: string, fn: Function) => void;
}
