import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import { setBooleanAttribute } from '../../utils/dom.js';
import { registerShadowRoot } from '../common/extendStyles.js';
import FilePondEntryListApp from './index.svelte';
import styles from './index.css?inline';
import type {
    EntryAnimation,
    FilePondEntry,
    FilePondEntrySource,
    Locale,
    Needle,
    NodeContext,
    SpringOptions,
    TemplateNode,
} from '../../types/index.js';

// Props to create getters and setters for, the defaults for these props are set in the FilePondEntryList component
export const COMPONENT_PROPS = [
    'disabled',
    'assets',
    'locale',
    'template',
    'propResourceMap',
    'drag',
    'dragGrabTimeout',
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
    'byteUnits',
    'beforeRenderNode',
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

export interface FilePondEntryListElement {
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
    locale?: Locale;

    /** The data format to use in the templates */
    byteUnits?: 'mega' | 'mebi';

    /**
     * Automatically maps a property name to a resource value in locale and/or assets, defaults to `{ title: 'locale', label: 'locale', icon: 'assets' }` meaning that the value of a `label` property is automatically looked up in the `locale` property
     */
    propResourceMap?: { [componentProperty: string]: string };

    /** Called when entries are set */
    onSetEntries(entries: FilePondEntry[]): void;

    /** Called when entry is inserted */
    onInsertEntry(entry: FilePondEntry): void;

    /** Called when entry is removed */
    onRemoveEntry(detail: { entry: FilePondEntry; index: number[] }): void;

    /** Set the callback to use when the view updates entries */
    setSetEntriesCallback(cb: (entries: FilePondEntry[]) => void): void;

    /** Set the callback to use when user wants to remove entry */
    setInsertEntriesCallback(
        cb: (entry: FilePondEntrySource | FilePondEntrySource[], index?: number | number[]) => void
    ): void;

    /** Set the callback to use when user wants to remove entry */
    setRemoveEntriesCallback(
        cb: (
            ...needles: Needle[]
        ) =>
            | ({ entry: FilePondEntry; index: number[] } | void)[]
            | { entry: FilePondEntry; index: number[] }
            | void
    ): void;

    /** Set the callback to use for updating entry state */
    setUpdateEntryCallback(cb: (needle: Needle, ...props: any[]) => void): void;

    /** Set the callback to use to get the current entry state */
    setGetEntryExtensionStateCallback(cb: (entry: FilePondEntry) => { [key: string]: any }): void;

    /** Set the callback to use to update the entry status */
    setSetEntryExtensionStateCallback(
        cb: (entry: FilePondEntry, props: { [key: string]: any }) => void
    ): void;

    setPushTaskCallback(cb: (id: string, fn: Function) => void): void;

    setAbortTaskCallback(cb: (id: string, fn: Function) => void): void;
}

interface FilePondEntryListElementEvents {
    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K | 'dragentrystart' | 'dragentry' | 'dragentryend' | 'updateplaceholder',
        listener: (this: FilePondEntryListElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
}

/**
 * FilePondEntryListElement
 *
 * @event {CustomEvent} 'dragentrystart' - Fired when an entry drag operation starts
 * @event {CustomEvent} 'dragentry' - Fired when an entry is dragged
 * @event {CustomEvent} 'dragentryend' - Fired when an entry drag operation ends
 * @event {CustomEvent} 'updateplaceholder' - Fired when a placeholder rect is updated
 */
export class FilePondEntryListElement
    extends FilePondSvelteComponentElement
    implements FilePondEntryListElementEvents
{
    //
    // /** Called when entries are set */
    // onSetEntries: (entries: FilePondEntry[]) => void;

    // /** Called when entry is inserted */
    // onInsertEntry: (entry: FilePondEntry) => void;

    // /** Called when entry is removed */
    // onRemoveEntry: (detail: { entry: FilePondEntry; index: number[] }) => void;

    // /** Set the callback to use when the view updates entries */
    // setSetEntriesCallback: (cb: (entries: FilePondEntry[]) => void) => void;

    // /** Set the callback to use when user wants to remove entry */
    // setInsertEntriesCallback: (
    //     cb: (entry: FilePondEntrySource | FilePondEntrySource[], index?: number | number[]) => void
    // ) => void;

    // /** Set the callback to use when user wants to remove entry */
    // setRemoveEntriesCallback: (
    //     cb: (
    //         ...needles: Needle[]
    //     ) =>
    //         | ({ entry: FilePondEntry; index: number[] } | void)[]
    //         | { entry: FilePondEntry; index: number[] }
    //         | void
    // ) => void;

    // /** Set the callback to use for updating entry state */
    // setUpdateEntryCallback: (cb: (needle: Needle, ...props: any[]) => void) => void;

    // /** Set the callback to use to get the current entry state */
    // setGetEntryExtensionStateCallback: (
    //     cb: (entry: FilePondEntry) => { [key: string]: any }
    // ) => void;

    // /** Set the callback to use to update the entry status */
    // setSetEntryExtensionStateCallback: (
    //     cb: (entry: FilePondEntry, props: { [key: string]: any }) => void
    // ) => void;

    // setPushTaskCallback: (cb: (id: string, fn: Function) => void) => void;

    // setAbortTaskCallback: (cb: (id: string, fn: Function) => void) => void;

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
    } as SpringOptions;
}

export function getDefaultEntryAnimationProps() {
    return {
        // spring state when dragging outside list
        dissolve: {
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
