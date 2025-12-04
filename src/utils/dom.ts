import { flattenTree } from './tree.js';
import { isNumber, isFileEntry, isString, isBoolean, isBrowser, isFile } from './test.js';
import { arrayItemsEqual, arrayRemoveFalsy } from './array.js';
import type { FilePondFileEntry } from '../types/index.js';

export function dispatchCustomEvent(element: HTMLElement, type: string, options?: CustomEventInit) {
    element.dispatchEvent(new CustomEvent(type, options));
}

/** Adds an event listener to an element */
export function addListener(
    element: Element | Window | Document,
    event: string,
    cb: (...args: any) => void,
    options?: AddEventListenerOptions | boolean | undefined
) {
    element.addEventListener(event, cb, options);
    return () => unlisten(element, event, cb, options);
}

/** Removes an event listener from an element */
export function unlisten(
    element: Element | Window | Document,
    event: string,
    cb: (...args: any) => void,
    options?: AddEventListenerOptions | boolean | undefined
) {
    element.removeEventListener(event, cb, options);
}

/** Simple helper function to stop event propagation */
export function stopPropagation(event: Event) {
    event.stopPropagation();
}

export function isKey(event: KeyboardEvent, key: string) {
    return event.key === key;
}

export const Key = {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
};

export function routeKeyboardEvent(
    event: KeyboardEvent,
    routes: { [type: string]: (detail: any) => void }
) {
    const handler = routes[event.key];
    if (!handler) {
        return;
    }
    handler(event);
}

export function getAsElement(element: Element | string | undefined) {
    return typeof element === 'string' ? (document.querySelector(element) ?? undefined) : element;
}

export function setStyles(element: HTMLElement, styles: string) {
    styles.split(';').forEach((style) => {
        const [property, rawValue] = style.split(':');
        if (!property.length || !rawValue) {
            return;
        }
        const [value, important] = rawValue.split('!important');
        element.style.setProperty(
            property,
            value,
            typeof important === 'string' ? 'important' : undefined
        );
    });
}

/** HTML element creation helper function */
export function h(
    name: string,
    attributes: { [key: string]: ((...args: any[]) => void) | string | boolean | number } = {},
    children: (HTMLElement | void | false | null | undefined)[] = []
) {
    const el = document.createElement(name);

    // @ts-ignore ignore __proto__ does not exist on element warning
    const descriptors = Object.getOwnPropertyDescriptors(el.__proto__);

    //
    for (const [key, value] of Object.entries(attributes)) {
        // skip
        if (value === undefined) continue;

        // is style
        if (key === 'style' && typeof value === 'string') {
            setStyles(el, value);
        }

        // is element instance property
        else if (
            descriptors[key]?.set ||
            key === 'textContent' ||
            key === 'innerHTML' ||
            typeof value === 'function'
        ) {
            // @ts-ignore
            el[key] = value;
        }

        // is attribute
        else {
            el.setAttribute(key, `${value}`);
        }
    }

    // append optional children
    el.append(...(arrayRemoveFalsy(children) as HTMLElement[]));

    return el;
}

/** Sets a list of files/directories to a file input element */
export function setFileInputFilesFromEntries(
    element: HTMLInputElement,
    entries?: FilePondFileEntry[] | undefined,
    options?: { customEventType: string }
) {
    const { customEventType = 'update' } = options ?? {};

    // clear
    if (!entries || !entries.length) {
        element.value = '';
        return;
    }

    const fileList = getFileListFromEntries(entries);

    // no change since last update
    if (arrayItemsEqual([...fileList], [...(element.files ?? [])])) {
        return;
    }

    // set new files
    element.files = fileList;

    // let others know the input value was changed
    element.dispatchEvent(new CustomEvent(customEventType));
}

/** Sets a list of files/directories to a file input element */
export function getFileListFromEntries(entries: FilePondFileEntry[]): FileList {
    // create data tranfer instance which we'll use as a proxy to get a FileList
    const dataTransfer = new DataTransfer();

    // add all files
    flattenTree(entries)
        .filter((entry) => isFileEntry(entry) && isFile(entry.file))
        .forEach((entry) => {
            dataTransfer.items.add((entry as FilePondFileEntry & { file: File }).file);
        });

    return dataTransfer.files;
}

/** Tests if a video element has an audio track */
export function videoHasAudioTrack(
    video: HTMLVideoElement,
    options?: { attempts?: number; interval?: number }
) {
    const { attempts = 5, interval = 16 } = options ?? {};
    return new Promise((resolve) => {
        // @ts-ignore - standards
        if (video['audioTracks'] && video['audioTracks'].length) {
            return resolve(true);
        }

        // @ts-ignore - firefox
        if (video['mozHasAudio'] && video['mozHasAudio'] === true) {
            return resolve(true);
        }

        // @ts-ignore - chrome
        if (isNumber(video['webkitAudioDecodedByteCount'])) {
            let attempt = 0;
            function testByteCount() {
                attempt++;
                // @ts-ignore
                if (video['webkitAudioDecodedByteCount'] > 0) {
                    return resolve(true);
                }

                // no more attempts
                if (attempt >= attempts) {
                    return resolve(false);
                }

                // we'll try again in a couple milliseconds
                setTimeout(testByteCount, interval);
            }

            // run first test
            testByteCount();
            return;
        }

        // no support
        resolve(false);
    });
}

/** Sets or updates the dataset attribute on an element */
export function updateDataset(
    element: HTMLElement,
    dataset: { [key: string]: string | number | boolean | undefined } | undefined
) {
    if (!dataset) {
        return;
    }

    Object.entries(dataset).forEach(([key, value]) => {
        // should remove
        if (value === undefined) {
            delete element.dataset[key];
            return;
        }

        // test if already set
        const valueAsString = `${value}`;
        if (element.dataset[key] === valueAsString) {
            return;
        }

        // update
        element.dataset[key] = valueAsString;
    });
}

/** Sets or updates the style attribute on an element */
export function updateStyles(
    element: HTMLElement,
    styles: { [key: string]: string | number } | undefined
) {
    if (!styles) {
        return;
    }

    Object.entries(styles).forEach(([key, value]) => {
        if (value === undefined) {
            element.style.removeProperty(key);
            return;
        }

        element.style.setProperty(key, `${value}`);
    });
}

export function getStyleProperty(computedStyles: CSSStyleDeclaration, propertyName: string) {
    if (!computedStyles) {
        return;
    }
    return computedStyles.getPropertyValue(propertyName);
}

export function getStylePropertyAsNumber(
    computedStyles: CSSStyleDeclaration,
    propertyName: string
) {
    if (!computedStyles) {
        return;
    }
    const propertyValue = getStyleProperty(computedStyles, propertyName);
    return propertyValue !== undefined ? parseFloat(propertyValue) : undefined;
}

export function getStylePropertyAsInt(computedStyles: CSSStyleDeclaration, propertyName: string) {
    if (!computedStyles) {
        return;
    }
    const propertyValue = getStyleProperty(computedStyles, propertyName);
    return propertyValue !== undefined ? parseInt(propertyValue, 10) : undefined;
}

export function copyAttributes(
    sourceElement: HTMLElement,
    targetElement: HTMLElement,
    filter: (name: string) => boolean
) {
    Array.from(sourceElement.attributes)
        .filter((attr) => filter(attr.name))
        .forEach((attr) => {
            targetElement.setAttribute(attr.name, attr.value);
        });
}

/** Removes array for attributes from element */
export function removeAttributes(element: HTMLElement, attributesToRemove: string[]) {
    attributesToRemove.forEach((name) => {
        element.removeAttribute(name);
    });
}

/** Sets attributes, sets non string values as props */
export function setAttributes(element: HTMLElement, attributesToSet: { [key: string]: any }) {
    Object.entries(attributesToSet).forEach(([key, value]) => {
        if (typeof value === 'string') {
            element.setAttribute(key, value);
            return;
        }
        // @ts-ignore
        element[key] = value;
    });
}

/** Sets a string attribute, removes the attribute if value is `undefined` or `null` */
export function setStringAttribute(
    element: HTMLElement,
    name: string,
    value: boolean | string | number
) {
    if (isString(value) || isNumber(value) || isBoolean(value)) {
        element.setAttribute(name, `${value}`);
    } else {
        element.removeAttribute(name);
    }
}

export function setBooleanAttribute(element: HTMLElement, name: string, value: boolean) {
    if (value) {
        element.setAttribute(name, '');
    } else {
        element.removeAttribute(name);
    }
}

/** Returns the attribute value, if the element doesn't have this attribute it returns `undefined` */
export function getAttribute(element: HTMLElement, name: string) {
    if (element.hasAttribute(name)) {
        const value = element.getAttribute(name);
        if (value === '') {
            return true;
        }
        return value;
    }
    return undefined;
}

/**
 * Returns `undefined` if not found, returns boolean for singular attributes, returns string for
 * attributes with value
 */
export function getAttributeFromElements(attributeName: string, ...elements: HTMLElement[]) {
    for (const element of elements) {
        if (element.hasAttribute(attributeName)) {
            return getAttribute(element, attributeName);
        }
    }
    // not found
    return undefined;
}

export function attributeValueToBool(value: string | null): boolean {
    return value !== null;
}

export function attributeValueToDefined(value: string | null): string | undefined {
    return value === null ? undefined : value;
}

export function boolToAttributeValue(value: boolean | undefined): string | undefined {
    return value ? '' : undefined;
}

/** Returns either the size in bytes or the size in natural file size */
export function getFileSizeAttributeValue(
    element: HTMLElement,
    name: string
): string | number | undefined {
    if (!element.hasAttribute(name)) {
        return undefined;
    }

    const attributeValue = element.getAttribute(name) as string;

    // we test if this is a natural size notation, if so we return it as-is, else as a number
    return /[a-z]$/i.test(attributeValue) ? attributeValue : parseFloat(attributeValue);
}

/** Injects styles in document head */
export function adoptStyles(target: Document | ShadowRoot = document, styles?: string) {
    // already injected styles
    if (!styles) {
        return;
    }

    // already has this sheet, let's adopt if is shadow root
    if (injectMap.has(styles)) {
        if (target !== document) {
            const sheet = injectMap.get(styles);
            target.adoptedStyleSheets.push(sheet);
        }

        // we done!
        return;
    }

    // add to doc
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    target.adoptedStyleSheets.push(sheet);

    // if target isn't the document we need to globally register any @properties
    if (target !== document) {
        registerCSSProperties(sheet);
    }

    // remember we already injected these styles
    injectMap.set(styles, sheet);
}

export function createStyleSheet(styles: string) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(styles);
    registerCSSProperties(sheet);
    return sheet;
}

const registeredProperties = new Set();
function registerCSSPropertyRule({ name, syntax, inherits, initialValue }: CSSPropertyRule) {
    if (registeredProperties.has(name)) {
        return;
    }
    CSS.registerProperty({
        name,
        syntax,
        inherits,
        initialValue: initialValue ?? undefined,
    });
    registeredProperties.add(name);
}

function registerCSSProperties(sheet: CSSStyleSheet) {
    for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSPropertyRule)) {
            continue;
        }
        registerCSSPropertyRule(rule);
    }
}

// remembers if we did inject styles for this custom element
const injectMap = new Map();

/** Tests if the element with the given name has already been defined */
export function hasDefinedTag(name: string) {
    if (!isBrowser()) {
        return false;
    }

    return !!customElements.get(name);
}

/** Defines the custom element if it's not already been defined */
export function defineCustomElement(tag: string, CustomElement: CustomElementConstructor): void {
    if (!isBrowser()) {
        return;
    }

    if (hasDefinedTag(tag)) {
        return;
    }

    customElements.define(tag, CustomElement);
}

/** Defines multiple custom elements in one go */
export function defineCustomElements(
    customElements: { [tag: string]: CustomElementConstructor } = {}
) {
    for (const [tag, constructor] of Object.entries(customElements)) {
        defineCustomElement(tag, constructor);
    }
}
