import type { ExtensionFactory } from '../../core/extensionManager.ts';
import type { AnimationMode, Locale, SpringOptions } from '../../types/index.js';
import { FilePondInputElement } from '../FilePondInput/index.js';
import { FilePondEntryListElement } from '../FilePondEntryList/index.js';
import { FilePondDropAreaElement } from '../FilePondDropArea/index.js';
import { FilePondDropIndicatorElement } from '../FilePondDropIndicator/index.js';
import { FileInputSource } from '../../extensions/file-input-source.js';
import { DataTransferLoader } from '../../extensions/data-transfer-loader.js';
import { ValueCallbackStore } from '../../extensions/value-callback-store.js';

import {
    getDefaultEntryAnimationOriginMap,
    getDefaultEntryAnimationProps,
    getDefaultSpringOptions,
} from '../FilePondEntryList/index.js';

import { EntryListView, type EntryListViewOptions } from '../../extensions/entry-list-view.js';

import {
    h,
    defineCustomElement,
    defineCustomElements,
    hasDefinedTag,
    addListener,
    dispatchCustomEvent,
    setBooleanAttribute,
} from '../../utils/dom.js';
import { isString } from '../../utils/test.js';
import { assets } from '../../assets/index.js';

// default FilePond styles
import defaultStyles from './index.css?inline';

// template
import { createFilePondEntryList } from '../../templates/entry.js';

/** Wraps a set of extensions in with the default FilePond custom element extensions */
export function createFilePondExtensionSet(extensions: ExtensionFactory[] = []) {
    return [
        FileInputSource,
        ...extensions,
        DataTransferLoader,
        ValueCallbackStore,
        EntryListView,
    ] as ExtensionFactory[];
}

const SharedProps = ['springDefaults', 'animations'];

// This holds the initial options object passed to `defineFilePond`, we store this value so we can assign the initialOptions to FilePond components created _after_ the first `defineFilePond` call.
let globalInitialOptions: defineFilePondOptions | undefined;

export class FilePondElement extends FilePondInputElement {
    // Child components
    #components: { [key: string]: any } = {};

    /** Holds reference to attribution link element */
    #attributionLink: HTMLAnchorElement;

    /** Holds references to event subscriptions so we can more easily unsub */
    #connectedSubs: (() => void)[] = [];

    /** Pass spring and animaton config to children */
    set springDefaults(value: SpringOptions) {
        Object.values(this.#components).forEach((element) => {
            element.springDefaults = value;
        });
    }

    set animations(value: AnimationMode) {
        Object.values(this.#components).forEach((element) => {
            element.animations = value;
        });
    }

    /** Wraps `createFilePondExtensionSet` so we always set the default extension set */
    set extensions(value: ExtensionFactory[]) {
        super.extensions = createFilePondExtensionSet(value);
    }

    /** Set to false to hide credits */
    static get observedAttributes() {
        return [...super.observedAttributes, 'noattribution', 'nodrop'];
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

        super.attributeChangedCallback(name, _, value);
    }

    /** Set to `true` to remove drop area */
    set noDrop(value: boolean) {
        // toggle attribute
        setBooleanAttribute(this, 'nodrop', value);

        // remove/add components
        if (value) {
            this.#components.dropArea.remove();
            this.#components.dropIndicator.remove();
            Object.assign(this, {
                EntryListView: {
                    drop: false,
                },
            });
        } else {
            this._root.prepend(this.#components.dropArea, this.#components.dropIndicator);
            Object.assign(this, {
                EntryListView: {
                    drop: true,
                },
            });
        }

        // update label
        this.setBrowseButtonLabelKey(value ? 'browse' : 'browseAndDrop');
    }

    /** Returns current nodrop state */
    get noDrop() {
        return this.hasAttribute('nodrop');
    }

    /** Set to `true` to remove the attribution link */
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

    constructor() {
        super({
            styles: [defaultStyles],
        });

        // can also drop!
        this.setBrowseButtonLabelKey('browseAndDrop');

        // create items list
        const entryList = h('file-pond-entry-list', {
            part: 'entry-list',
        }) as FilePondEntryListElement;

        const dropArea = h('file-pond-drop-area', {
            part: 'drop-area',
        }) as FilePondDropAreaElement;

        const dropIndicator = h('file-pond-drop-indicator', {
            part: 'drop-indicator',
        }) as FilePondDropIndicatorElement;

        // so we can set shared props on these lements
        this.#components = {
            entryList,
            dropArea,
            dropIndicator,
        };

        // this makes sure the parts defined in the entry list nodelist are automatically exported, default modifiers are always exported
        const exportparts = new Set(['dragging', 'virtualized', 'selected', 'checked']);
        function syncExportparts(part?: string) {
            if (!part || exportparts.has(part)) {
                return;
            }
            const parts = Array.from(exportparts.add(part)).join(',');
            entryList.setAttribute('exportparts', parts);
        }

        // assign default options, anything view related we assign in connectedCallback()
        Object.assign(this, {
            // add items view
            extensions: createFilePondExtensionSet(this.extensions),

            // show progress indicator for data transfers
            DataTransferLoader: {
                perceivedPerformance: true,
            },

            // set up items view extension
            EntryListView: {
                // the element that the item list will be appended to
                element: this.#components.entryList,

                // the root element to use for dragging and dropping components, defaults to the list itself
                dropRoot: this.#components.dropArea,

                // assets to use
                assets,

                // the nodes to render
                template: createFilePondEntryList(),

                // called before rendering a node, allows dynamically modifying a node or adding nodes
                beforeRenderNode(node: any) {
                    syncExportparts(node.props?.part || node.attrs?.part);
                    return node;
                },

                // animations
                entryAnimationProps: getDefaultEntryAnimationProps(),
                entryAnimationOriginMap: getDefaultEntryAnimationOriginMap(),
                springDefaults: getDefaultSpringOptions(),
            } as EntryListViewOptions,
        });

        // set default springconfig to this element and it's children
        this.springDefaults = getDefaultSpringOptions();

        // set initial values to children
        SharedProps.forEach((key) => {
            // @ts-ignore
            this[key] = entryList[key];
        });

        // optionally insert link to filepond.com
        this.#attributionLink = createAttributionLink({
            caption: 'Powered by FilePond',
        });

        // apply intial options
        Object.assign(this, globalInitialOptions);
    }

    connectedCallback() {
        super.connectedCallback();

        const { dropArea, dropIndicator, entryList } = this.#components;

        // re-add sub components
        if (!this.hasAttribute('nodrop')) {
            this._root.prepend(dropArea, dropIndicator);
        }

        this._root.append(entryList);
        if (!this.hasAttribute('noattribution')) {
            this._root.append(this.#attributionLink);
        }

        // listen to events
        this.#connectedSubs.push(
            // route clicks on drop area to browse button
            addListener(dropArea, 'click', () => {
                this.browse();
            }),

            // did compute target rect
            addListener(dropArea, 'computerect', (e: CustomEvent) => {
                if (!e.detail) {
                    return;
                }

                const computedRect = e.detail;

                dispatchCustomEvent(this, 'computerect', { detail: computedRect });
            }),

            // did update visual rect
            addListener(dropArea, 'updaterect', (e: CustomEvent) => {
                if (!e.detail) {
                    return;
                }

                const animatedRect = e.detail;

                // we use this information to center the label with transforms
                this._root.style.setProperty('--width', animatedRect.width);
                this._root.style.setProperty('--height', animatedRect.height);

                // did compute rect
                dispatchCustomEvent(this, 'updaterect', { detail: animatedRect });
            }),

            // link up placeholder position with drop indicator
            addListener(entryList, 'updateplaceholder', (e) => {
                dropIndicator.indicatorRect = e.detail;
            }),

            // these two listeners toggle the dragging attribute to the file-pond element, we do this so we can move the file-pond element that is being interacted with to the front, so the dragged item also renders on top. Additionally they prevent interaction with slot content and attribution link while dragging
            addListener(entryList, 'dragentrystart', () => {
                setBooleanAttribute(this, 'dragging', true);
                this._slot.inert = true;
                this.#attributionLink.inert = true;
            }),

            addListener(entryList, 'dragentryend', () => {
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
        Object.values(this.#components).forEach((element) => element.remove());
        this.#attributionLink.remove();

        // unsub subscriptions created when connecting to the DOM
        this.#connectedSubs.forEach((unsub) => unsub());
        this.#connectedSubs = [];
    }
}

/**
 * Adds attribution link below droparea
 */
function createAttributionLink(options?: { caption: string }) {
    const { caption = '' } = options || {};
    return h('a', {
        textContent: caption,
        href: 'https://filepond.com',
        target: '_tab',
        rel: 'noopener noreferrer nofollow',
        part: 'attribution-link',
        tabindex: '-1',
    }) as HTMLAnchorElement;
}

export interface defineFilePondOptions {
    /** Initial locale to use */
    locale?: Locale;

    /** Initial extensions to load on top of default FilePond extensions */
    extensions?: ExtensionFactory[];

    /** Initial Spring configuration */
    springDefaults?: SpringOptions;
}

/**
 * Registers the `<file-pond>` custom element, `initialOptions` passed will be assigned as props,
 * returns an array of `<file-pond>` components on the page at time of registration
 * @param initialOptions - The initial options to pass to the FilePond components
 */
export function defineFilePond(initialOptions?: defineFilePondOptions): FilePondElement[] {
    const tag = 'file-pond';

    // remember these options
    globalInitialOptions = initialOptions;

    // Already defined this custom element
    if (hasDefinedTag(tag)) {
        return Array.from(document.querySelectorAll(tag)) as FilePondElement[];
    }

    // When using the default version of the FilePond we need to define these custom components as well
    defineCustomElements({
        [`${tag}-entry-list`]: FilePondEntryListElement,
        [`${tag}-drop-area`]: FilePondDropAreaElement,
        [`${tag}-drop-indicator`]: FilePondDropIndicatorElement,
    });

    // Define the element
    defineCustomElement(tag, FilePondElement);

    // return found components
    return Array.from(document.querySelectorAll(tag)) as FilePondElement[];
}
