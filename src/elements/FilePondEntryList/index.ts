import type {
    Needle,
    FilePondEntry,
    FilePondEntrySource,
    TemplateNode,
} from '../../types/index.js';
import type { Vector } from '../../utils/vector.js';
import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import { setBooleanAttribute } from '../../utils/dom.js';
import { registerShadowRoot } from '../common/extendStyles.js';
import FilePondEntryListApp from './index.svelte';
import styles from './index.css?inline';

export interface AnimatedEntry {
    delayed: boolean;
    entry: FilePondEntry;
    animation: string;
    oncancel: () => void;
    oncomplete: () => void;
}

export interface DragInteraction {
    id: string;
    element: HTMLElement | undefined;
    offset: Vector;
    translation: Vector;
    vector: Vector;
    viewPosition: Vector;
}

export interface DropState {
    id?: string;
    remove: boolean;
}

export interface DragState {
    id: string;
    index: number;
    element: HTMLElement | undefined;
    offset: Vector;
    translation: Vector;
    parentTranslation: Vector;
    outside: boolean;
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
        options?: { parallel?: number; isOptional?: boolean }
    ) => void;
    abortTask: (id: string, fn: Function) => void;
}

// Props to create getters and setters for, the defaults for these props are set in the FilePondEntryList component
export const COMPONENT_PROPS = [
    // We don't include 'template' as it's handled with a manual setter, this prevents Svelte from creating a proxy when the template is passed to the `beforeAssignTemplate` function
    'disabled',
    'beforeAssignTemplate',
    'beforeRenderNode',
    'assets',
    'locale',
    'propResourceMap',
    'drag',
    'dragDetachMargin',
    'dragSafetyMargin',
    'drop',
    'dropRoot',
    'dropPadding',
    'animations',
    'entryAnimationProps',
    'entryAnimationOriginMap',
    'entryAnimationStaggerInterval',
    'springDefaults',
];

const COMPONENT_METHODS = [
    // update routes from model
    'onSetEntries',
    'onInsertEntry',
    'onRemoveEntry',

    // registered callbacks
    'setSetEntriesCallback',
    'setInsertEntriesCallback',
    'setRemoveEntriesCallback',
    'setUpdateEntryCallback',
    'setGetEntryExtensionStateCallback',
    'setSetEntryExtensionStateCallback',
    'setPushTaskCallback',
    'setAbortTaskCallback',
];

const COMPONENT_EVENTS = ['dragentry', 'dragentrystart', 'dragentryend', 'updateplaceholder'];

/** FilePond EntryList Element */
export class FilePondEntryListElement extends FilePondSvelteComponentElement {
    set template(value: TemplateNode[]) {
        this._app.setTemplate(value);
    }

    constructor() {
        super(FilePondEntryListApp, {
            properties: COMPONENT_PROPS,
            methods: COMPONENT_METHODS,
            events: COMPONENT_EVENTS,
        });

        // so can receive component styles
        registerShadowRoot(this._root, styles);
    }

    connectedCallback() {
        super.connectedCallback();

        this.addListener('updateentries', (e) => {
            setBooleanAttribute(this, 'empty', e.detail === 0);
        });
    }
}

export function getDefaultEntryAnimationOriginMap() {
    return {
        clipboard: 'drop',
        drop: 'rise',
        input: 'slide',
        remote: 'rise',
    };
}

export function getDefaultSpringOptions() {
    return {
        stiffness: 0.1,
        damping: 0.495,
        precision: 0.001,
    };
}

export function getDefaultEntryAnimationProps() {
    return {
        // spring state when dragging outside list
        disolve: {
            scale: 1,
            opacity: 0.5,
        },
        // spring state while dragging
        lift: {
            translationSpringOptions: { stiffness: 0.1, damping: 0.4 },
            scaleSpringOptions: { stiffness: 0.1, damping: 0.35 },
            scale: 1.025,
            opacity: 1,
        },
        release: {
            scale: 1,
            opacity: 1,
        },
        // spring target when removed
        fall: {
            scaleSpringOptions: { stiffness: 0.1, damping: 0.9 },
            scale: 0.95,
            opacitySpringOptions: { stiffness: 0.25, damping: 0.95 },
            opacity: 0,
        },
        // fade in from smaller size
        rise: {
            translationFrom: { x: 0, y: -5 },
            scaleSpringOptions: { stiffness: 0.1, damping: 0.31 },
            scaleFrom: 0.95,
            scale: 1,
            opacitySpringOptions: { stiffness: 0.1, damping: 0.6 },
            opacityFrom: 0,
            opacity: 1,
        },
        // fade in from bigger size
        drop: {
            scaleSpringOptions: { stiffness: 0.1, damping: 0.31 },
            scaleFrom: 1.05,
            scale: 1,
            opacitySpringOptions: { stiffness: 0.1, damping: 0.6 },
            opacityFrom: 0,
            opacity: 1,
        },
        // animating in from the top
        slide: {
            translationSpringOptions: { stiffness: 0.05, damping: 0.5 },
            translationFrom: {
                x: 0,
                y: -15,
            },
            scaleSpringOptions: { stiffness: 0.1, damping: 0.31 },
            scaleFrom: 0.95,
            scale: 1,
            opacitySpringOptions: { stiffness: 0.1, damping: 0.6 },
            opacityFrom: 0,
            opacity: 1,
        },
    };
}
