import type { ExtensionFactory } from '../../core/extensionManager.ts';
import type { AnimationMode, Locale, SpringOptions, TemplateNode } from '../../types/index.js';
import { FilePondBaseElement } from '../FilePondBase/index.js';
import { FilePondEntryListElement } from '../FilePondEntryList/index.js';
import { FilePondDropAreaElement } from '../FilePondDropArea/index.js';
import { FilePondDropIndicatorElement } from '../FilePondDropIndicator/index.js';
import { FileInputSource } from '../../extensions/file-input-source.js';
import { DataTransferLoader } from '../../extensions/data-transfer-loader.js';
import { ValueCallbackStore } from '../../extensions/value-callback-store.js';

import {
    getDefaultEntryAnimationOriginMap,
    getDefaultEntryAnimationProps,
    getDefaultSpringConfig,
} from '../FilePondEntryList/index.js';

import { EntryListView, type EntryListViewOptions } from '../../extensions/entry-list-view.js';

import {
    h,
    defineCustomElement,
    defineCustomElements,
    hasDefinedTag,
    addListener,
} from '../../utils/dom.js';
import { isBrowser, isString } from '../../utils/test.js';
import { assets } from '../../assets/index.js';

// default FilePond styles
import defaultStyles from './index.css?inline';

// template
import { createFilePondEntryList } from '../../templates/entry.js';

/** Auto assigns props to just created file-pond elements */
function autoAssignFilePondProperties(tag: string, options: unknown) {
    if (!isBrowser()) {
        return;
    }
    const elements = Array.from(document.querySelectorAll(tag));
    for (const element of elements) {
        Object.assign(element, options);
    }
    return elements;
}

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

const SharedProps = ['springConfig', 'animations'];

export class FilePondElement extends FilePondBaseElement {
    #instances: any[] = [];

    /** Set to `true` to remove the attribution link */
    #attributionLink: HTMLAnchorElement | undefined;

    /** Pass spring and animaton config to children */
    set springConfig(value: SpringOptions) {
        this.#instances.forEach((instance) => {
            instance.springConfig = value;
        });
    }

    set animations(value: AnimationMode) {
        this.#instances.forEach((instance) => {
            instance.animations = value;
        });
    }

    /** Wraps `createFilePondExtensionSet` so we always set the default extension set */
    set extensions(value: ExtensionFactory[]) {
        super.extensions = createFilePondExtensionSet(value);
    }

    /** Set to false to hide credits */
    static get observedAttributes() {
        return [...super.observedAttributes, 'noattribution'];
    }

    attributeChangedCallback(name: string, _: string, value: string | boolean) {
        if (name === 'noattribution') {
            this.#toggleAttributionLink(!isString(value));
            return;
        }

        super.attributeChangedCallback(name, _, value);
    }

    #toggleAttributionLink(enable: boolean) {
        if (!this.#attributionLink) {
            return;
        }

        if (enable) {
            this._root.append(this.#attributionLink);
        } else {
            this.#attributionLink.remove();
        }
    }

    set noAttribution(value: boolean) {
        if (value) {
            this.setAttribute('noattribution', '');
        } else {
            this.removeAttribute('noattribution');
        }
    }

    get noAttribution() {
        return !this.#attributionLink?.parentNode;
    }

    constructor() {
        super({
            styles: [defaultStyles],
        });
    }

    connectedCallback() {
        super.connectedCallback();

        // create items list
        const filePondEntryList = h('file-pond-entry-list', {
            part: 'entry-list',
        }) as FilePondEntryListElement;

        const filePondDropIndicator = h('file-pond-drop-indicator', {
            part: 'drop-indicator',
        }) as FilePondDropIndicatorElement;

        const filePondDropArea = h('file-pond-drop-area', {
            part: 'drop-area',
        }) as FilePondDropAreaElement;

        // so we can set shared props on these lements
        this.#instances.push(filePondEntryList, filePondDropIndicator, filePondDropArea);

        // this makes sure the parts defined in the entry list nodelist are automatically exported
        const exportparts = new Set();
        function syncExportparts(part?: string) {
            if (!part || exportparts.has(part)) {
                return;
            }
            const parts = Array.from(exportparts.add(part)).join(',');
            filePondEntryList.setAttribute('exportparts', parts);
        }

        // assign default options
        Object.assign(this, {
            // add items view
            extensions: createFilePondExtensionSet(this.extensions),

            // set up items view extension
            EntryListView: {
                // the element that the item list will be appended to
                element: filePondEntryList,

                // the root element to use for dragging and dropping elements, defaults to the list itself
                dropRoot: filePondDropArea,

                // assets to use, these contain icons
                assets,

                // the template to render
                template: createFilePondEntryList({
                    // debug: false,
                }),

                // called before rendering a node, allows dynamically modifying a node or adding nodes
                beforeRenderNode(node: any) {
                    syncExportparts(node.props?.part || node.attrs?.part);
                    // TODO: improve this, list should render an item node, or a placeholder node that have their own `part` property
                    syncExportparts(node.props?.itemPart);
                    syncExportparts(node.props?.itemPlaceholderPart);
                    syncExportparts(node.props?.buttonPart);
                    return node;
                },

                // animations
                entryAnimationProps: getDefaultEntryAnimationProps(),
                entryAnimationOriginMap: getDefaultEntryAnimationOriginMap(),
                springConfig: getDefaultSpringConfig(),
            } as EntryListViewOptions,
        });

        // set default springconfig to this element and it's children
        this.springConfig = getDefaultSpringConfig();

        // set initial values to children
        SharedProps.forEach((key) => {
            // @ts-ignore
            this[key] = filePondEntryList[key];
        });

        // optionally insert link to filepond.com
        this.#attributionLink = createAttributionLink({
            caption: 'Powered by FilePond',
        });

        // add components
        this._root.prepend(filePondDropArea, filePondDropIndicator);
        this._root.append(filePondEntryList);
        this.#attributionLink &&
            !this.hasAttribute('noattribution') &&
            this._root.append(this.#attributionLink);

        // @ts-ignore
        addListener(filePondDropArea, 'updaterect', (e: CustomEvent) => {
            if (!e.detail) {
                return;
            }

            // we use this information to center the label with transforms
            this._slot.style.setProperty('--width', e.detail.width);
            this._slot.style.setProperty('--height', e.detail.height);

            // we position the attribution link with transforms
            this.#attributionLink?.style.setProperty('--x', e.detail.width);
            this.#attributionLink?.style.setProperty('--y', e.detail.height);
        });

        // link up placeholder position with drop indicator
        addListener(filePondEntryList, 'updateplaceholder', (e) => {
            filePondDropIndicator.indicatorRect = e.detail;
        });
    }
}

/**
 * Adds attribution link below droparea
 */
function createAttributionLink(options?: { caption: string }) {
    const { caption = '' } = options || {};
    if (!caption.length) {
        return;
    }

    return h('a', {
        textContent: caption,
        href: 'https://filepond.com',
        target: '_tab',
        rel: 'noopener noreferrer nofollow',
        part: 'attribution-link',
    }) as HTMLAnchorElement;
}

export interface defineFilePondOptions {
    /** Initial locale to use */
    locale?: Locale;

    /** Initial extensions to load on top of default FilePond extensions */
    extensions?: ExtensionFactory[];

    /** Initial Spring configuration */
    springConfig?: SpringOptions;
}

/**
 * Registers the `<file-pond>` custom element, `initialOptions` passed will be assigned as props,
 * returns an array of `<file-pond>` elements on the page at time of registration
 * @param initialOptions - The initial options to pass to the FilePond elements
 */
export function defineFilePond(initialOptions?: defineFilePondOptions): FilePondElement[] {
    const tag = 'file-pond';

    // Already defined this custom element
    if (hasDefinedTag(tag)) {
        return [];
    }

    // When using the default version of the FilePond we need to define these custom elements as well
    defineCustomElements({
        [`${tag}-entry-list`]: FilePondEntryListElement,
        [`${tag}-drop-area`]: FilePondDropAreaElement,
        [`${tag}-drop-indicator`]: FilePondDropIndicatorElement,
    });

    // Define the element
    defineCustomElement(tag, FilePondElement);

    // let's automatically assign the passed options to all created file-pond elements
    const elements = autoAssignFilePondProperties(tag, initialOptions) as unknown[];

    // we return all elements
    return elements as FilePondElement[];
}
