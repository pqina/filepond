import type { ExtensionFactory } from '../../core/extensionManager.ts';
import type { AnimationMode, Locale, SpringOptions } from '../../types/index.js';
import type { Bounds } from '../../utils/bounds.js';
import type { Rect } from '../../utils/rect.js';
import { FilePondInputElement } from '../FilePondInput/index.js';
import { FilePondEntryListElement } from '../FilePondEntryList/index.js';
import { FilePondFrameElement } from '../FilePondFrame/index.js';
import { FilePondDropIndicatorElement } from '../FilePondDropIndicator/index.js';
import { FilePondSourceListElement } from '../FilePondSourceList/index.js';

import {
    getDefaultEntryAnimationOriginMap,
    getDefaultEntryAnimationProps,
    getDefaultSpringOptions,
} from '../FilePondEntryList/index.js';

import type { EntryListViewOptions } from '../../extensions/entry-list-view.js';

import {
    h,
    defineCustomElement,
    defineCustomElements,
    hasDefinedTag,
    addListener,
    dispatchCustomEvent,
    setBooleanAttribute,
    getAttribute,
    setStringAttribute,
} from '../../utils/dom.js';
import { isBrowser, isString } from '../../utils/test.js';
import { assets } from '../../assets/index.js';

// default FilePond styles
import defaultStyles from './index.css?inline';

// templates
import { createFilePondEntryList } from '../../templates/entry-list/index.js';
import { createFilePondSourceList } from '../../templates/source-list/index.js';

// extensions
import { createFilePondExtensionSet } from './createFilePondExtensionSet.js';

// This holds the initial options object passed to `defineFilePond`, we store this value so we can assign the initialOptions to FilePond components created _after_ the first `defineFilePond` call.
let globalInitialOptions: DefineFilePondOptions | undefined;

export interface FilePondElementEventMap {
    rectcompute: CustomEvent<Bounds>;
    rectchange: CustomEvent<Bounds>;
}

interface FilePondElementEvents {
    addEventListener<K extends keyof FilePondElementEventMap>(
        type: K,
        listener: (this: FilePondInputElement, event: FilePondElementEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
}

function createExportPartsSyncer(element: HTMLElement, exportparts: Set<string> = new Set([])) {
    return (part?: string) => {
        if (!part || exportparts.has(part)) {
            return;
        }
        const parts = Array.from(exportparts.add(part)).join(',');
        element.setAttribute('exportparts', parts.replace(/ /g, ','));
    };
}

/**
 * FilePondElement
 *
 * @event {CustomEvent<Bounds>} 'rectcompute' - Fired when the element rect has been computed
 * @event {CustomEvent<Bounds>} 'rectchange' - Fired when the element visual rect has been updated
 */
export class FilePondElement extends FilePondInputElement implements FilePondElementEvents {
    // Child components
    #components: { [key: string]: any } = {};

    /** Holds reference to attribution link element */
    #attributionLink: HTMLAnchorElement;

    /** Holds references to event subscriptions so we can more easily unsub */
    #connectedSubs: (() => void)[] = [];

    /** Calls a function for each component */
    #eachComponent(cb: (comp: any) => void) {
        Object.values(this.#components).forEach(cb);
    }

    /** Automatically passes value to child elements, for usage see `FilePondSvelteComponentElement` */
    set springDefaults(value: SpringOptions) {
        this.#eachComponent((element) => (element.springDefaults = value));
    }

    /** Returns the current animation mode */
    get animations(): AnimationMode {
        return (getAttribute(this, 'animations') ?? 'auto') as AnimationMode;
    }

    /** Setting to toggle animations, automatically passes `animations` setting to child elements, for usage see `FilePondSvelteComponentElement` */
    set animations(value: AnimationMode) {
        setStringAttribute(this, 'animations', value);
        this.#eachComponent((element) => (element.animations = value));
    }

    /** Wraps `createFilePondExtensionSet` so we always set the default extension set */
    set extensions(value: ExtensionFactory[]) {
        super.extensions = createFilePondExtensionSet(value);
    }

    /** Set to `true` to remove drop area */
    set noDrop(value: boolean) {
        // toggle attribute
        setBooleanAttribute(this, 'nodrop', value);

        // remove/add components
        if (value) {
            this.#components.dropIndicator.remove();
        } else {
            this._root.prepend(this.#components.dropIndicator);
        }

        // update entry list state
        Object.assign(this, {
            EntryListView: {
                drop: !value,
            },
        });
    }

    /** Returns current nodrop state */
    get noDrop() {
        return this.hasAttribute('nodrop');
    }

    /**
    A programmatic way to toggle the attribution link on/off.

    When set to `true` this property automatically adds the `noattribution` attribute to the `<file-pond>` element.

    ```js
    const element = document.querySelector('file-pond');
    element.noAttribution = true;
    ```
    */
    set noAttribution(value: boolean) {
        if (value) {
            setBooleanAttribute(this, 'noattribution', true);
            this.#attributionLink.remove();
        } else {
            setBooleanAttribute(this, 'noattribution', false);
            this._root.append(this.#attributionLink);
        }
    }

    /** Returns current noattribution state */
    get noAttribution() {
        return !this.#attributionLink?.parentNode;
    }

    /** Sets the locale on parent */
    set locale(value: Locale) {
        super.locale = value;

        // pass to child elements
        this.#eachComponent((element) => (element.locale = value));
    }

    static get observedAttributes() {
        return [...super.observedAttributes, 'animations', 'noattribution', 'nodrop'];
    }

    attributeChangedCallback(name: string, _: string, value: string | boolean) {
        // toggle attribution
        if (name === 'noattribution') {
            this.noAttribution = isString(value);
            return;
        }

        // toggle drop
        if (name === 'nodrop') {
            this.noDrop = isString(value);
            return;
        }

        // toggle nodrop if nobrowse is set because it makes no sense to allow dropping files but not browsing for files
        if (name === 'nobrowse' && isString(value)) {
            this.noDrop = isString(value);
            super.attributeChangedCallback(name, _, value);
            return;
        }

        // toggle animations
        if (name === 'animations') {
            this.animations = value as AnimationMode;
        }

        super.attributeChangedCallback(name, _, value);
    }

    constructor() {
        super({
            styles: [defaultStyles],
        });

        // create parts
        const entryList = h('file-pond-entry-list', {
            part: 'entry-list-element',
        }) as FilePondEntryListElement;

        const sourceList = h('file-pond-source-list', {
            part: 'source-list-element',
        }) as FilePondSourceListElement;

        const sourceDescription = h('file-pond-source-description', {
            part: 'source-description-element',
        }) as HTMLElement;

        const frame = h('file-pond-frame', {
            part: 'frame-element',
        }) as FilePondFrameElement;

        const dropIndicator = h('file-pond-drop-indicator', {
            part: 'drop-indicator-element',
        }) as FilePondDropIndicatorElement;

        // so we can set shared props on these elements
        this.#components = {
            entryList,
            sourceList,
            frame,
            dropIndicator,
            sourceDescription,
        };

        // this makes sure the parts defined in the entry and node list nodelist are automatically exported, default modifiers are always exported
        const syncEntryListExportParts = createExportPartsSyncer(
            entryList,
            new Set(['dragging', 'virtualized', 'selected', 'checked'])
        );

        const syncSourceListExportParts = createExportPartsSyncer(entryList);

        // template to use, if it's already supplied we don't have to set it again
        const entryListTemplate =
            globalInitialOptions?.EntryListView?.template || createFilePondEntryList();

        // assign default options, anything view related we assign in connectedCallback()
        Object.assign(this, {
            // add items view
            extensions: this.extensions,

            // default spring values
            springDefaults: getDefaultSpringOptions(),

            // default animation state
            animations: 'auto',

            // show progress indicator for data transfers
            DataTransferLoader: {
                perceivedPerformance: true,
            },

            // renders the description label
            SourceDescriptionView: {
                element: this.#components.sourceDescription,
            },

            // set up source list view extension
            SourceListView: {
                element: this.#components.sourceList,

                // the nodes to render
                template: createFilePondSourceList(),

                // assets to use
                assets,

                // sync source entry list parts
                beforeRenderNode(node: any) {
                    syncSourceListExportParts(node.props?.part || node.attrs?.part);
                    return node;
                },
            },

            // set up entry list view extension
            EntryListView: {
                // the element that the item list will be appended to
                element: this.#components.entryList,

                // the root element to use for dragging and dropping components, defaults to the list itself
                dropRoot: this.#components.frame,

                // assets to use
                assets,

                // the nodes to render
                template: entryListTemplate,

                // called before rendering a node, allows dynamically modifying a node or adding nodes
                beforeRenderNode(node: any) {
                    syncEntryListExportParts(node.props?.part || node.attrs?.part);
                    return node;
                },

                // animations
                entryAnimationProps: getDefaultEntryAnimationProps(),
                entryAnimationOriginMap: getDefaultEntryAnimationOriginMap(),
            } as EntryListViewOptions,
        });

        // optionally insert link to filepond.com
        this.#attributionLink = createAttributionLink({
            caption: 'Powered by FilePond',
        });

        // overwrite default options with global options
        Object.assign(this, globalInitialOptions);
    }

    connectedCallback() {
        super.connectedCallback();

        const { entryList, sourceList, sourceDescription, frame, dropIndicator } = this.#components;

        // re-add sub components
        if (!this.hasAttribute('nodrop')) {
            this._root.prepend(dropIndicator);
        }

        this._root.prepend(frame, sourceDescription);
        this._root.append(sourceList, entryList);

        // attribution
        if (!this.hasAttribute('noattribution')) {
            this._root.append(this.#attributionLink);
        }

        // route events
        this.#connectedSubs.push(
            // did compute target rect
            addListener(frame, 'rectcompute', (e: CustomEvent) => {
                if (!e.detail) {
                    return;
                }
                const computedRect = e.detail;
                dispatchCustomEvent(this, 'rectcompute', { detail: computedRect });
            }),

            // did update visual rect
            addListener(frame, 'rectchange', (e: CustomEvent) => {
                if (!e.detail) {
                    return;
                }

                const animatedRect = e.detail;

                // we use this information to center the label with transforms
                this._root.style.setProperty('--width', animatedRect.width);
                this._root.style.setProperty('--height', animatedRect.height);

                // did compute rect
                dispatchCustomEvent(this, 'rectchange', { detail: animatedRect });
            }),

            // link up placeholder position with drop indicator
            addListener(entryList, 'placeholderchange', (e: CustomEvent<Rect | null>) => {
                dropIndicator.indicatorRect = e.detail;
            }),

            // these two listeners toggle the dragging attribute to the file-pond element, we do this so we can move the file-pond element that is being interacted with to the front, so the dragged item also renders on top. Additionally they prevent interaction with slot content and attribution link while dragging
            addListener(entryList, 'entrydragstart', () => {
                setBooleanAttribute(this, 'dragging', true);
                this._slot.inert = true;
                this.#attributionLink.inert = true;
            }),

            addListener(entryList, 'entrydragend', () => {
                setBooleanAttribute(this, 'dragging', false);
                this._slot.inert = false;
                this.#attributionLink.inert = false;
            })
        );
    }

    /** Called each time the element is removed from the document. */
    disconnectedCallback() {
        // run super connected now
        super.disconnectedCallback();

        // remove children
        this.#eachComponent((element) => element.remove());
        this.#attributionLink.remove();

        // unsub subscriptions created when connecting to the DOM
        this.#connectedSubs.forEach((unsub) => unsub());
        this.#connectedSubs = [];
    }
}

/**
 * Adds attribution link below drop area
 */
function createAttributionLink(options?: { caption: string }) {
    const { caption = '' } = options || {};
    return h('a', {
        textContent: caption,
        href: 'https://filepond.com',
        target: '_tab',
        rel: 'noopener noreferrer nofollow',
        part: 'attribution-link',
        // don't want to interfere with keyboard navigation
        tabindex: '-1',
        // don't want to annoy assistive tech with this attribution link
        'aria-hidden': 'true',
    }) as HTMLAnchorElement;
}

export interface DefineFilePondOptions {
    /** Initial locale to use */
    locale?: Locale;

    /** Initial extensions to load on top of default FilePond extensions */
    extensions?: ExtensionFactory[];

    /** Initial Spring configuration */
    springDefaults?: SpringOptions;

    /** Location of web workers */
    workersURL?: URL;
}

/**
 * Registers the `<file-pond>` custom element, `initialOptions` passed will be assigned as props,
 * returns an array of `<file-pond>` components on the page at time of registration
 * @param initialOptions - The initial options to pass to the FilePond components
 */
export function defineFilePond(initialOptions?: DefineFilePondOptions): FilePondElement[] {
    // Bail when not in browser
    if (!isBrowser()) {
        return [];
    }

    // for re-use purposes
    const tag = 'file-pond';

    // remember these options
    globalInitialOptions = initialOptions;

    // Already defined this custom element
    if (hasDefinedTag(tag)) {
        return Array.from(document.querySelectorAll(tag)) as FilePondElement[];
    }

    // When using the default version of the FilePond we need to define these custom components as well
    defineCustomElements({
        [`${tag}-source-list`]: FilePondSourceListElement,
        [`${tag}-entry-list`]: FilePondEntryListElement,
        [`${tag}-frame`]: FilePondFrameElement,
        [`${tag}-drop-indicator`]: FilePondDropIndicatorElement,
    });

    // Define the element
    defineCustomElement(tag, FilePondElement);

    // return found components
    return Array.from(document.querySelectorAll(tag)) as FilePondElement[];
}
