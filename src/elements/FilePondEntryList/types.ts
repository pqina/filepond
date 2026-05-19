import type {
    Needle,
    FilePondEntry,
    FilePondEntrySource,
    TemplateNode,
    NodeContext,
    EntryAnimation,
} from '../../types/index.js';
import type { Vector } from '../../utils/vector.js';
import type { FilePondSvelteComponentOptions } from '../FilePondSvelteComponent/index.svelte.js';

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

export interface FilePondEntryListOptions extends Omit<FilePondSvelteComponentOptions, 'root'> {
    /** Set entries in list */
    entries?: FilePondEntry[];

    /** Template to use for rendering different types */
    template?: TemplateNode[];

    /** Hook to manipulate nodes before rendering */
    beforeRenderNode?: (
        node: TemplateNode,
        context: NodeContext,
        sharedContext: NodeContext
    ) => TemplateNode | void | false;

    /** Toggle drop functionality on/off */
    drop?: boolean;

    /** Which element to use as drop container, defaults to `null` */
    dropRoot?: HTMLElement;

    /** Padding around drop area that will also catch drops, defaults to `20` */
    dropPadding?: number;

    /** Toggle drag functionality on/off */
    drag?: boolean;

    /** User needs to hold down on item for this amount of milliseconds to start dragging operation. Defaults to `100` */
    dragGrabTimeout?: number;

    /** The distance from the root element after which the element will be detached from the list, defaults to `40` */
    dragDetachMargin?: number;

    /** The distance from the root element after which the element will be removed when dropped, defaults to `80`, set to `Infinity` to prevent removal by dragging */
    dragSafetyMargin?: number;

    /** Toggle the UI on/off */
    disabled?: boolean;

    /** Maps Entry origin to animation for intro effect */
    entryAnimationOriginMap?: { [origin: string]: string };

    /** Animation configuration for each entry animation */
    entryAnimationProps?: { [animation: string]: EntryAnimation };

    /** Delay to use between entry animations that are staggered (insert / remove) */
    entryAnimationStaggerInterval?: number;

    /** The assets resource to use for icons, defaults to `{}` */
    assets?: { [key: string]: string };

    /** The locale resource props to use for text, defaults to `{}` */
    locale?: { [key: string]: string };

    /** The data format to use in the templates */
    byteUnits?: 'mega' | 'mebi';

    /**
     * Automatically maps a property name to a resource value in locale and/or assets, defaults to `{ title: 'locale', label: 'locale', icon: 'assets' }` meaning that the value of a `label` property is automatically looked up in the `locale` property
     */
    propResourceMap?: { [componentProperty: string]: string };
}
