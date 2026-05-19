import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import { setBooleanAttribute } from '../../utils/dom.js';
import { registerShadowRoot } from '../common/extendStyles.js';
import FilePondEntryListApp from './index.svelte';
import styles from './index.css?inline';
import type { SpringOptions } from '../../types/index.js';

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
