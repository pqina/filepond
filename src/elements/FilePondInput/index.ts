import type { AnimationMode, Locale } from '../../types/index.js';
import type { FilePondEntrySource, FilePondEntry } from '../../types/index.js';
import type { ExtensionFactory } from '../../core/extensionManager.js';

// import modules
import {
    createExtensionManager,
    type ExtensionMangerInstance,
} from '../../core/extensionManager.js';
import { createEntryTree, type Needle } from '../../core/entryTree.js';
import {
    h,
    getAttribute,
    getFileSizeAttributeValue,
    setBooleanAttribute,
    setStringAttribute,
    getAttributeFromElements,
    addListener,
    createStyleSheet,
    setAttributes,
} from '../../utils/dom.js';
import { isFile, isNumber, isObject, isString } from '../../utils/test.js';
import { stringReplaceVariables, statusToLabel, statusCodeToLocaleKey } from '../common/string.js';
import { toCamelCase } from '../../utils/string.js';
import { debounce } from '../../utils/debounce.js';
import { dispatchCustomEvent } from '../../utils/dom.js';
import { Status } from '../../common/status.js';
import { HTMLElementSafe } from '../../common/ssr.js';
import { arrayRemoveFalsy } from '../../utils/array.js';
import defaultStyles from './index.css?inline';
import { createFilePondEntryTree } from './createFilePondEntryTree.js';

// https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setValidity#flags
// validity flag order
const VALIDATION_FLAGS_ORDER = [
    // customError
    'customError',
    // if accept is mismatched
    'typeMismatch',
    // some min range exceeded
    'rangeUnderflow',
    // some max range exceeded
    'rangeOverflow',
    // if is required and value is missing
    'valueMissing',
];

function hasBusyEntries(entries: FilePondEntry[]) {
    return entries.some((entry) => {
        return Object.values(entry.extension ?? {}).some(({ status }) => {
            // no status, not busy
            if (!status) {
                return false;
            }

            // has progress
            return isNumber(status.progress);
        });
    });
}

function hasInvalidEntries(entries: FilePondEntry[]) {
    return entries.some((entry) => {
        return Object.values(entry.extension ?? {}).some(({ status }) => {
            // no status, no error
            if (!status) {
                return false;
            }

            // has error status
            return status.type === 'error';
        });
    });
}

/** Converst a passed value to a FormData object */
function toFormData(fieldName: string, value: string | File | (string | File)[]) {
    const values = Array.isArray(value) ? value : [value];
    const formData = new FormData();
    for (const value of values) {
        if (isFile(value)) {
            formData.append(fieldName, value, value.name);
            continue;
        }
        formData.append(fieldName, isObject(value) ? JSON.stringify(value) : `${value}`);
    }
    return formData;
}

// Along with the InteractionAttributes these attributes are synced from an optional slotted file input to the custom element
const GenericAttributes = ['required', 'name', 'id'];

// These attributes are assigend to the hidden file input so it correctly responds when calling `browse()` the 'multiple' attribute isn't in this list as it can't be set on the file-pond element
const InteractionAttributes = ['disabled', 'accept', 'capture', 'webkitdirectory'];

// these attributes when set on the custom element have their boolean values (which read as '') auto-converted to `true`
const BooleanAttributes = ['disabled', 'required', 'webkitdirectory'];

export interface FilePondInputElementEvents {
    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K | 'change' | 'update' | 'connected',
        listener: (this: FilePondInputElement, ev: HTMLElementEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;
}

/**
 * FilePond Custom Element Base
 *
 * @event {CustomEvent} 'change' - emitted when form value changed
 * @event {CustomEvent} 'update' - emitted when entries list updated
 * @event {CustomEvent} 'connected' - emitted when connected to the DOM
 */
export class FilePondInputElement extends HTMLElementSafe implements FilePondInputElementEvents {
    /** FilePond element shadowRoot */
    #root: ShadowRoot;

    /** Div element that wraps styleable children */
    #wrapper: HTMLDivElement;

    /** FilePond element slot */
    #slot: HTMLSlotElement;

    /** This Has a reference to the element form internals */
    #internals: ElementInternals;

    /** Source input */
    #fileInput: HTMLInputElement;

    /** Browse button */
    #browseButton: HTMLButtonElement;

    /** FilePond extension manager reference */
    #extensionManager: ExtensionMangerInstance;

    /** FilePond core instance reference */
    #entryTree: ReturnType<typeof createEntryTree>;

    /** Locale object reference */
    #locale: undefined | Locale = undefined;

    /** Key to use for the browse button label */
    #browseButtonLabelKey = 'browse';

    /** Holds Names of extensions we've currently set up proxies for */
    #extensionProxies: string[] = [];

    /**
     * Holds default entries as set by developer to .entries, we use this so we can reset to initial
     * state when reset is clicked
     */
    #initialEntries: null | FilePondEntrySource[] = null;

    /** Holds references to event subscriptions so we can more easily unsub */
    #connectedSubs: (() => void)[] = [];

    //#region getters and setters for <file-pond> custom element attributes
    /** Returns a reference to the shadow root element */
    get _root() {
        return this.#wrapper;
    }

    /** Returns a reference to the slot element */
    get _slot() {
        return this.#slot;
    }

    /** Attributes being observed for changes */
    static get observedAttributes() {
        return [
            'animations',
            'value',
            'readonly',
            'required',
            'webkitdirectory',
            'capture',
            'accept',
            'nobrowse',

            //
            // apart from 'max-files' these are convenience attributes for validation extensions
            //
            'min-files',
            'max-files',
            'min-size',
            'max-size',
            'min-list-size',
            'max-list-size',

            //
            // the root doesn't have the 'multiple' attribute it uses 'min-files' / 'max-files'
            //

            //
            // changes to 'disabled' attribute are handled by `formDisabledCallback`
            //
        ];
    }

    /** Called when attributes are changed, added, removed, or replaced */
    attributeChangedCallback(name: string, _: string, value: string | boolean) {
        // route to value prop
        if (name === 'value') {
            this.value = `${value}`;
            return;
        }

        // // nobrowse
        // if (name === 'nobrowse') {
        //     this.noBrowse = isString(value);
        //     return;
        // }

        // make sure internal state is updated based on attribute changes
        this.#syncAttributeToInternals(name, value);

        // make sure source input attributes are in sync with file-pond root
        this.#syncAttributeToFileInput(name, value);

        // some attributes are linked to extension properties, let's update those now
        this.#syncAttributeToExtensions(name, value);
    }

    /** Syncs attribute to internal element state */
    #syncAttributeToInternals(name: string, value: string | boolean) {
        // sync noBrowse
        if (name === 'nobrowse') {
            // enabled
            if (isString(value)) {
                this.#browseButton.remove();
            }
            // disabled
            else {
                this.#slot.prepend(this.#browseButton);
            }

            return;
        }

        // sync max files
        if (name === 'max-files') {
            const maxFiles = parseInt(value as string, 10);

            // auto limit entries to max amount when updating max files
            if (this.#entryTree.entries.length > maxFiles) {
                this.#entryTree.entries = this.#entryTree.entries.toSpliced(maxFiles);
            }

            // can have more than one file, set multiple
            this.#fileInput.multiple = maxFiles > 1;

            // need to update browse button label as it is different when allowing multiple files
            this.#syncBrowseButton();

            // retest validity
            this.checkValidity();

            return;
        }
    }

    /** Syncs file-pond interaction attributes (attributes that impact file system file selection UX) to source input attributes */
    #syncAttributeToFileInput(name: string, value: string | boolean) {
        // no need to sync to input
        if (!InteractionAttributes.includes(name)) {
            return;
        }

        // if is boolean attribute
        if (BooleanAttributes.includes(name)) {
            setBooleanAttribute(this.#fileInput, name, value === true || value === '');
            return;
        }

        // string attribute
        setStringAttribute(this.#fileInput, name, value);
    }

    /** Looks up the extension(s) linked to this attribute and assigns the matched props */
    #syncAttributeToExtensions(name: string, value: string | boolean) {
        const prop = toCamelCase(name);
        value = BooleanAttributes.includes(name) && value === '' ? true : value;
        this.#extensionManager.propagateExtensionProperty(prop, value);
    }

    /** Disable the field and sets the disabled attribute */
    set disabled(value: boolean) {
        setBooleanAttribute(this, 'disabled', value);
    }

    /** Gets the field disabled state */
    get disabled() {
        return !!getAttribute(this, 'disabled');
    }

    /** Set the field webkitdirectory state */
    set webkitdirectory(value: boolean) {
        setBooleanAttribute(this, 'webkitdirectory', value);
    }

    /** Gets the field webkitdirectory state */
    get webkitdirectory() {
        return !!getAttribute(this, 'webkitdirectory');
    }

    /** Toggle the field multiple state */
    set multiple(allowMultiple: boolean) {
        if (allowMultiple && this.maxFiles === 1) {
            this.maxFiles = Infinity;
        }
        if (!allowMultiple && this.maxFiles !== 1) {
            this.maxFiles = 1;
        }
    }

    /** Gets the field multiple state */
    get multiple() {
        return this.maxFiles !== 1;
    }

    /**
     * Set field as readonly. Only for situations where FilePond has initial files and those files
     * should be posted. The `readonly` attribute isn't supported on a file input element as it
     * cannot have an initial value.
     */
    set readOnly(value: boolean) {
        setBooleanAttribute(this, 'readonly', value);
    }

    /** Gets the field readonly state */
    get readOnly() {
        return !!getAttribute(this, 'readonly');
    }

    /** Set field as required */
    set required(value: boolean) {
        setBooleanAttribute(this, 'required', value);
    }

    /** Gets the field required state */
    get required() {
        return !!getAttribute(this, 'required');
    }

    /** Accepted files setter https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept */
    set accept(value: string) {
        setStringAttribute(this, 'accept', value);
    }

    /** Returns the current value of accept */
    get accept(): string {
        return getAttribute(this, 'accept') as string;
    }

    /** Setting to toggle animations */
    set animations(value: AnimationMode) {
        setStringAttribute(this, 'animations', value);
    }

    /** Returns the current animation mode */
    get animations(): AnimationMode {
        return (getAttribute(this, 'animations') ?? 'auto') as AnimationMode;
    }

    /** Toggle browse button */
    set noBrowse(value: boolean) {
        if (value) {
            setBooleanAttribute(this, 'nobrowse', true);
            // this.#browseButton.remove();
        } else {
            setBooleanAttribute(this, 'nobrowse', false);
            // this.#slot.prepend(this.#browseButton);
        }
    }

    /** Returns the current browse button state */
    get noBrowse() {
        return !this.#browseButton.parentNode;
    }

    /** Min file size setter, accepts a number of bytes or a natural filesize string like 1MB */
    set minSize(value: number | string) {
        setStringAttribute(this, 'min-size', value);
    }

    /** Returns the currently set min file size */
    get minSize(): number | string | undefined {
        return getFileSizeAttributeValue(this, 'min-size');
    }

    /** Max file size setter, accepts a number of bytes or a natural filesize string like 1MB */
    set maxSize(value: number | string) {
        setStringAttribute(this, 'max-size', value);
    }

    /** Returns the currently set max file size */
    get maxSize(): number | string | undefined {
        return getFileSizeAttributeValue(this, 'max-size');
    }

    /** Min total file size setter, accepta a number of bytes or a natural filesize string like 1MB */
    set minListSize(value: number | string) {
        setStringAttribute(this, 'min-list-size', value);
    }

    /** Returns the currently set min total file size */
    get minListSize(): number | string | undefined {
        return getFileSizeAttributeValue(this, 'min-list-size');
    }

    /** Max total file size setter, accepts a number of bytes or a natural filesize string like 1MB */
    set maxListSize(value: number | string) {
        setStringAttribute(this, 'max-list-size', value);
    }

    /** Returns the currently set max total file size */
    get maxListSize(): number | string | undefined {
        return getFileSizeAttributeValue(this, 'max-list-size');
    }

    /** Min total entries setter, an integer, defaults to `0` */
    set minFiles(value: number) {
        setStringAttribute(this, 'min-files', value);
    }

    /** Returns the currently set min total entries */
    get minFiles() {
        return parseInt(this.getAttribute('min-files') ?? '0', 10);
    }

    /** Max total entries setter, an integer, defaults to `Infinity` */
    set maxFiles(value: number) {
        if (value === Infinity) {
            this.removeAttribute('max-files');
        } else {
            setStringAttribute(this, 'max-files', value);
        }
    }

    /** Returns the currently set max total entries */
    get maxFiles() {
        const attributeValue = this.getAttribute('max-files');
        return attributeValue ? parseInt(attributeValue, 10) : Infinity;
    }

    //#endregion

    //#region Element properties

    /** Set the current entries */
    set entries(entries: FilePondEntrySource[]) {
        this.#entryTree.entries = entries;
    }

    /** Returns a `structuredClone` of the current entries array */
    get entries(): FilePondEntry[] {
        return this.#entryTree.entries;
    }

    /** Sets the locale */
    set locale(value: Locale) {
        // store locally
        this.#locale = value;

        // pass to view extension props
        this.#extensionManager.propagateExtensionProperty('locale', value);

        // update browse button label
        this.#syncBrowseButton();

        // so validity labels update to new language
        this.checkValidity();
    }

    /** Returns the current locale object, so it's easier to extend */
    get locale(): Locale | undefined {
        return this.#locale;
    }

    /** Sets custom extensions to load */
    set extensions(extensions: ExtensionFactory[]) {
        this.#extensionManager.extensions = extensions;
    }

    /** Update worker url */
    set workersURL(value: URL) {
        this.#extensionManager.propagateExtensionProperty('workersURL', value);
    }

    //#endregion

    //#region Element methods

    /** Browse files */
    browse() {
        // can only browse if browsing enabled
        if (this.noBrowse) {
            return;
        }

        // this follows default browser file input interactions, when we click a label linked to a file inupt the file input is focussed and then the browse interaction starts.
        this.#browseButton.focus({ preventScroll: true });
        this.#fileInput.click();
    }

    /** Listen for events */
    on(type: string, handler: (...args: any[]) => void) {
        return this.#entryTree.on(type, handler);
    }

    /** Add/Insert entries in the entry tree */
    insertEntries(entry: FilePondEntry | FilePondEntry[], index?: number | number[]) {
        return this.#entryTree.insertEntries(entry, index);
    }

    /** Find entries in the entry tree */
    findEntries(...needles: Needle[]) {
        return this.#entryTree.findEntries(...needles);
    }

    /** Find entries in the entry tree */
    removeEntries(...needles: Needle[]) {
        return this.#entryTree.removeEntries(...needles);
    }

    /** Sorts the entry tree using the passed sorting function */
    sortEntries(fn: (a: FilePondEntry, b: FilePondEntry) => 1 | -1 | 0) {
        this.#entryTree.sortEntries(fn);
    }

    /** Update an entry */
    updateEntry(needle: Needle, ...props: any[]) {
        this.#entryTree.updateEntry(needle, ...props);
    }

    /** Update an entry state */
    updateEntryState(needle: Needle, ...props: any[]) {
        this.#entryTree.updateEntry(needle, {
            state: props,
        });
    }

    moveEntry(needle: Needle, index: number | number[]) {
        return this.#entryTree.moveEntry(needle, index);
    }

    replaceEntry(needle: Needle, ...entries: FilePondEntry[]) {
        return this.#entryTree.replaceEntry(needle, ...entries);
    }

    //#endregion

    /** Called when the custom element is created */
    constructor(options: { styles: string[] }) {
        super();

        const { styles = [] } = options || {};

        // attach shadow DOM and inner slot
        this.#root = this.attachShadow({ mode: 'open', delegatesFocus: true });
        this.#root.adoptedStyleSheets = [defaultStyles, ...styles].map(createStyleSheet);

        // attach wrapper, this is used for custom styles
        this.#wrapper = h('div') as HTMLDivElement;
        this.#wrapper.tabIndex = -1;
        this.#root.append(this.#wrapper);

        // create slot
        this.#slot = h('slot') as HTMLSlotElement;
        this.#wrapper.append(this.#slot);

        // create hidden file input
        this.#fileInput = h('input', {
            type: 'file',
            'aria-hidden': true,
            hidden: true,
            multiple: true,
            tabIndex: -1,
        }) as HTMLInputElement;
        this.#wrapper.prepend(this.#fileInput);

        // set up browse button
        this.#browseButton = h('button', {
            type: 'button',
            part: 'browse-button',
        }) as HTMLButtonElement;
        this.#wrapper.prepend(this.#browseButton);

        // attach element internals, we'll assign getters from root the private internals prop
        this.#internals = this.attachInternals();

        // manages all the entries
        this.#entryTree = createFilePondEntryTree({
            // handles one or multiple files state
            beforeInsertEntries: (
                entriesToInsert: FilePondEntry[],
                currentEntries: FilePondEntry[]
            ) => {
                // there's a limit imposed on the amount of files, let's prevent adding more
                if (
                    this.maxFiles < Infinity &&
                    currentEntries.length + entriesToInsert.length > this.maxFiles
                ) {
                    return entriesToInsert.toSpliced(this.maxFiles - currentEntries.length);
                }

                // insert all files
                return entriesToInsert;
            },
        });

        // create the core file manager and make sure we can store results in the custom element
        this.#extensionManager = createExtensionManager(this.#entryTree);

        // we need to know when extension names change so we can add getters and setters on the custom element dynamically
        this.#extensionManager.on('setExtensions', ({ extensionNames }) => {
            // remove extension proxies that are no longer in use
            this.#extensionProxies
                .filter((extensionName) => {
                    // only delete proxies that aren't
                    return !extensionNames.includes(extensionName);
                })
                .forEach((extensionName) => {
                    // @ts-ignore delete
                    delete this[extensionName];
                });

            // set new proxies
            extensionNames.forEach((extensionName: string) => {
                // we create "proxy" getters/setters to the entry manager
                Object.defineProperty(this, extensionName, {
                    // getter / setter
                    set(props) {
                        this.#extensionManager.setExtensionProperties(extensionName, props);
                    },
                    get() {
                        return this.#extensionManager.getExtensionProperties(extensionName);
                    },

                    // so we can delete this proxy later
                    configurable: true,
                });
            });

            // so we know which proxies we have currently set
            this.#extensionProxies = extensionNames;

            // new extensions could mean stricter validation rules
            this.checkValidity();
        });

        // update aria label
        this.#entryTree.on('updateEntries', (entries) => {
            if (!this.locale) {
                return;
            }
            this.#syncBrowseButton();
        });
    }

    setBrowseButtonLabelKey(key: string) {
        this.#browseButtonLabelKey = key;
        this.#syncBrowseButton();
    }

    #syncBrowseButton() {
        const totalEntries = this.#entryTree.entries.length;

        const localeData = {
            multiple: `${this.multiple}`,
            //
            name: totalEntries === 1 ? this.#entryTree.entries[0].name || 'untitled' : null,
            count: totalEntries,

            //
            maxFiles: this.maxFiles,
            maxFilesUnit: 'unitFiles',
        };

        // accessibility attributes
        if (this.#locale) {
            const localeKey =
                totalEntries === 0
                    ? 'ariaNoEntries'
                    : totalEntries === 1
                      ? 'ariaSingleEntry'
                      : 'ariaMultipleEntries';

            setAttributes(this.#browseButton, {
                // aria label is always base browse button
                'aria-label': stringReplaceVariables(this.#locale.browse, localeData, this.#locale),

                // aria description is always base browse button
                'aria-description': arrayRemoveFalsy([
                    stringReplaceVariables(this.#locale[localeKey], localeData, this.#locale),
                    this.#locale.ariaRequired,
                    this.validationMessage,
                ]).join(', '),
            });
        }

        // normal button is different based
        this.#browseButton.innerHTML = stringReplaceVariables(
            this.#locale ? this.#locale[this.#browseButtonLabelKey] : this.#browseButtonLabelKey,
            localeData,
            this.#locale
        );
    }

    #syncSlottedElements() {
        // get all slotted file inputs, there should probably be only one, but *shrug*
        const inputs = this.#slot
            .assignedElements({ flatten: true })
            .filter((element) => element.matches('input[type="file"]')) as HTMLInputElement[];

        // copy relevant attributes to web-component (this will also assign relevant attributes to shadow #fileInput), when done we remove any slotted inputs
        const syncedAttributes = [...GenericAttributes, ...InteractionAttributes];
        for (const attr of syncedAttributes) {
            const value = getAttributeFromElements(attr, ...inputs, this);

            // not set, so skip
            if (value === undefined) {
                continue;
            }

            // @ts-ignore
            this[attr] = value;
        }

        // handle multiple
        if (inputs.length) {
            this.multiple = !!getAttributeFromElements('multiple', ...inputs);
        }

        // remove inputs
        inputs.forEach((input) => input.remove());
    }

    /** Called each time the element is added to the document */
    connectedCallback() {
        // sync slotted chidlren for first time
        this.#syncSlottedElements();

        /**
         * When the callback store changes we assign the value to the form internals for the custom element
         */
        const handleCallbackStoreChange = (value: any) => {
            // if receives a value set formdata
            this.#internals.setFormValue(
                value.length > 0 ? toFormData(this.name ?? 'filepond', value) : null
            );

            // New FormData set, let's check validity
            this.checkValidity();

            // An actual form data change triggers a 'change' event
            dispatchCustomEvent(this, 'change');

            /*
            NOTE: Doesn't fire an input event for now, need to determine if needed
            oninput: fired when input happens
            onchange: fired when input is blurred
            */
        };

        // Loads files selected by the user in the source input
        this.#extensionManager.setExtensionProperties('FileInputSource', {
            element: this.#fileInput,
            resetFilesOnAdd: true,
        });

        // Links up FormData to custom element
        this.#extensionManager.setExtensionProperties('ValueCallbackStore', {
            required: this.required,
            onChange: handleCallbackStoreChange,
        });

        // handle state updates so we can set custom validity if state is invalid, we also validate now so we know the current state
        this.#attachValidaton();

        // this listens for events on child elements
        this.#connectedSubs.push(
            addListener(this, 'click', (e) => {
                const target = e.composedPath()[0];

                // if not root element or browse button is origin (this follows default browser file input behaviour, also when label clicked the file input browse function is called)
                if (
                    target !== this &&
                    target !== this.#browseButton &&
                    !this.#browseButton.contains(target)
                ) {
                    return;
                }

                // we'll deal with this event
                e.stopPropagation();
                e.preventDefault();

                // delegate click to source input
                this.browse();
            }),

            // fire update events
            this.#entryTree.on('updateEntries', () => {
                dispatchCustomEvent(this, 'update');
            })
        );

        // the custom element logic is now connected
        dispatchCustomEvent(this, 'connected');
    }

    /** Called each time the element is removed from the document. */
    disconnectedCallback() {
        // unsub subscriptions created when connecting to the DOM
        this.#connectedSubs.forEach((unsub) => unsub());
        this.#connectedSubs = [];
    }

    //#region Form integration and validation
    /** This makes the element associateable with its parent form */
    static formAssociated = true;

    /** Sets the current field name */
    set name(value: string) {
        setStringAttribute(this, 'name', value);
    }

    /** Returns the current field name */
    get name(): string | undefined {
        return this.getAttribute('name') ?? undefined;
    }

    /** Proxy for Element internals `form` getter */
    get form(): HTMLFormElement | undefined {
        return this.#internals.form ?? undefined;
    }

    /**
     * Sets/Updates the value of the the entry manager
     *
     * Will also remember this value for when form is reset
     */
    set value(value: string | FilePondEntrySource[]) {
        // map string value to entries
        let entries: FilePondEntrySource[] = [];
        if (isString(value)) {
            entries = value
                .split(',')
                .map((src) => src.trim())
                .map((src) => ({
                    src,
                }));
        }

        // remember for when reset is called
        this.#initialEntries = entries;

        // set entries
        this.entries = entries;
    }

    /** Proxy for `entries` getter */
    get value(): FilePondEntry[] {
        return this.entries;
    }

    /** Sets up the field for validation */
    #attachValidaton() {
        this.#connectedSubs.push(
            this.#entryTree.on(
                'updateEntries',
                debounce(() => this.checkValidity())
            ),
            this.#extensionManager.on(
                'updateExtensionState',
                debounce(() => this.checkValidity())
            )
        );

        this.checkValidity();
    }

    /** Validates the current state of the field */
    checkValidity(): boolean | undefined {
        // get labels
        const { validationInvalidBusy = '', validationInvalidState = '' } = this.#locale || {};

        // need to know if extensions are currently working on files, if so, we show busy validity state
        if (hasBusyEntries(this.entries)) {
            // already in custom busy state
            if (this.#internals.validity.customError === true) {
                return;
            }

            // set busy state
            this.#setValidity({ customError: true }, stringReplaceVariables(validationInvalidBusy));

            // we done until we're no longer busy
            return;
        }

        // get current generic extension states, these are prioritized over generic invalid entry states
        const extensionStates = {
            // add generic item state, for when an extension doesn't set a generic state on the extension manager (this allows for more extension specific error messages like "not all items have been stored")
            ...(hasInvalidEntries(this.entries)
                ? {
                      FilePondItemValidator: {
                          status: {
                              type: 'error',
                              code: 'VALIDATION_INVALID_ENTRIES',
                              meta: null,
                              values: [],
                          },
                      },
                  }
                : {}),
            // overwrite with specific extension states
            ...this.#extensionManager.getState(),
        };

        /** Message for each flag */
        const messages: { [key: string]: string } = {};

        // if isn't empty, validate, otherwise we show required field error
        for (const { status } of Object.values(extensionStates)) {
            // skip irrelevant extensions
            if (!status || status.type !== Status.Error) {
                continue;
            }

            // mark flag as error, use flag set to extension status meta or use `customError` flag
            const { flag = 'customError' }: { flag?: string } = status?.meta ?? {};

            // set flag message
            const validationMessage = this.#locale
                ? statusToLabel(
                      {
                          ...status,
                          values: {
                              // error state values
                              ...status.values,

                              // append input state
                              multiple: this.multiple,
                          },
                      },
                      this.#locale
                  )
                : statusCodeToLocaleKey(status.code);

            // render validation message or fallback to invalid state label
            messages[flag] = validationMessage ?? stringReplaceVariables(validationInvalidState);
        }

        // all flags are false if is valid
        const isValid = Object.keys(messages).length === 0;

        // is a valid field, all is good
        if (isValid) {
            return this.#setValidity();
        }

        // get most important validation message
        const message = arrayRemoveFalsy(VALIDATION_FLAGS_ORDER.map((flag) => messages[flag])).at(
            0
        );

        // create ValidityStateFlags object
        const flags = VALIDATION_FLAGS_ORDER.reduce(
            (state: { [key: string]: boolean }, flag: string) => {
                state[flag] = messages[flag] ? true : false;
                return state;
            },
            {}
        );

        // sets current validity state
        return this.#setValidity(flags, message);
    }

    /** Sets the validity state on the element internals. Returns `true` if valid, `false` if invalid */
    #setValidity(flags?: void | ValidityStateFlags, message?: string): boolean {
        let valid = true;

        // field is valid
        if (!flags) {
            this.#internals.setValidity({});
        }
        // field is invalid
        else {
            this.#internals.setValidity(flags, message, this.#wrapper);
            valid = false;
        }

        // validity is reflected in browse button description for screenreader users
        this.#syncBrowseButton();

        // return resulting state
        return valid;
    }

    /** Proxy for element internals `reportValidity()` method */
    reportValidity() {
        this.#internals.reportValidity();
    }

    /** Proxy for element internals `validity` getter */
    get validity() {
        return this.#internals.validity;
    }

    /** Proxy for element internals `validationMessage` getter */
    get validationMessage() {
        return this.#internals.validationMessage;
    }

    /** Called when element or parent element (for example a `<fieldset>`) is set to disabled */
    formDisabledCallback(isDisabled: boolean) {
        // sync up disabled state if parent element is disabled
        // this should not result in a disabled attribute being set on the <file-pond> element itself as that will silence this callback

        // copy to entry manager so we can disable ui in view extensions
        this.#extensionManager.propagateExtensionProperty('disabled', isDisabled);

        // copy to internal file input element
        this.#fileInput.disabled = isDisabled;
        this.#browseButton.disabled = isDisabled;
    }

    /**
     * Called when user resets form. Resets field to initial state. The initial state is either
     * empty or set to what the developer has set to the `.entries` prop. This tries to mimic the
     * workings of `setAttribute` on default form fields.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
     */
    formResetCallback() {
        // TODO: the animation can be a bit quirky, this should probably just instantly clear the list of files and replace it
        this.entries = this.#initialEntries ?? [];
    }

    /** Called when user returns to form with back button */
    formStateRestoreCallback(state: any, mode: string) {
        // When user returns to form with back button this restores input state.
        // Tried to implement this hook but didn't seem to be called.
    }
    //#endregion
}
