import type {
    AnimationMode,
    FilePondDataTransferEntry,
    FilePondDirectoryEntry,
    FilePondFileEntry,
    Locale,
} from '../../types/index.js';
import type {
    FilePondEntrySource,
    PartialFilePondEntry,
    FilePondEntry,
} from '../../types/index.js';
import type { ExtensionStatus } from '../../extensions/common/createExtension.js';
import type { ExtensionFactory } from '../../core/extensionManager.js';

// import modules
import { createExtensionManager } from '../../core/extensionManager.js';
import { createEntryTree, type Needle } from '../../core/entryTree.js';
import {
    h,
    getAttribute,
    getFileSizeAttributeValue,
    setBooleanAttribute,
    setStringAttribute,
    getAttributeFromElements,
    removeAttributes,
    addListener,
    createStyleSheet,
} from '../../utils/dom.js';
import {
    isFile,
    isFileEntry,
    isNumber,
    isObject,
    isSafari,
    isString,
    isBlobOrFile,
    isCanvas,
    isDataTransfer,
    isDirectoryEntry,
} from '../../utils/test.js';
import { anyToInt } from '../../utils/number.js';
import { stringReplaceVariables, statusToLabel, statusCodeToLocaleKey } from '../common/string.js';
import { getUniqueId, toCamelCase } from '../../utils/string.js';
import { debounce } from '../../utils/debounce.js';
import { copyFilePropsToObject } from '../../utils/file.js';
import { dispatchCustomEvent } from '../../utils/dom.js';
import { Status } from '../../common/status.js';

// inline styles
import { HTMLElementSafe } from '../../common/ssr.js';
import { getFilenameFromURL } from '../../utils/url.js';
import { arrayRemoveFalsy } from '../../utils/array.js';
import defaultStyles from './index.css?inline';

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

/** Tests if the entry is an entry source */
function isEntrySrc(entry: FilePondEntrySource) {
    return isString(entry) || isBlobOrFile(entry) || isCanvas(entry) || isDataTransfer(entry);
}

/** If no name, that's fine, if does have a file name ignore if is a hidden file */
function shouldAddEntry(entry: FilePondEntrySource) {
    if (isString(entry) || isFileEntry(entry)) {
        const name = isString(entry)
            ? (getFilenameFromURL(entry) ?? '')
            : (entry.name ?? (isFile(entry?.src) ? entry.src.name : ''));

        return ![
            /\.git/,
            /thumbs\.db/,
            /\.DS_Store/,
            /desktop\.ini/,
            /^__MACOSX/,
            /node_modules/,
        ].find((regex) => regex.test(name));
    }

    return true;
}

/** Formats the entry so it conforms to the FilePondEntry type and is ready to be added to the list */
function formatEntry(entry: FilePondEntrySource): FilePondEntry {
    // test if entry is source object if so, we need to set that as the src
    const partialEntry: PartialFilePondEntry = isEntrySrc(entry) ? { src: entry } : { ...entry };

    // format base props
    partialEntry.state = isObject(partialEntry.state) ? partialEntry.state : {};
    partialEntry.extension = isObject(partialEntry.extension) ? partialEntry.extension : {};
    partialEntry.origin = partialEntry.origin ?? 'api';
    partialEntry.containerId = partialEntry.containerId ?? null;

    // if the source is a data transfer there's nothing left to format
    if (isDataTransfer(partialEntry.src)) {
        return partialEntry as FilePondDataTransferEntry;
    }

    // @ts-ignore it's either a directory entry or a file entry
    partialEntry.path = partialEntry.path ?? partialEntry.src?.path ?? null;

    // if not is a file, it's a directory, let's format subentries
    if (isDirectoryEntry(partialEntry)) {
        const { entries } = partialEntry;
        partialEntry.entries = entries.filter(shouldAddEntry).map(formatEntry);
        return partialEntry as FilePondDirectoryEntry;
    }

    // it's a file entry
    const partialFileEntry = partialEntry as FilePondFileEntry;
    partialFileEntry.file = partialFileEntry.file ?? undefined;

    // copy file ref if src is file
    if (isFile(partialFileEntry.src)) {
        partialFileEntry.file = partialFileEntry.src;
    }

    if (isFile(partialFileEntry.file)) {
        copyFilePropsToObject(partialFileEntry.file, partialFileEntry);
    }

    return partialFileEntry as FilePondFileEntry;
}

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

// We have two groups of attributes so we know which ones to sync to the source input
const GenericAttributes = ['required', 'name'];

const InteractionAttributes = ['disabled', 'multiple', 'accept'];

const BooleanAttributes = ['disabled', 'multiple', 'required'];

export interface FilePondBaseElementEvents {
    addEventListener<K extends keyof HTMLElementEventMap>(
        type: K | 'change' | 'update' | 'connected',
        listener: (this: FilePondBaseElement, ev: HTMLElementEventMap[K]) => any,
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
export class FilePondBaseElement extends HTMLElementSafe implements FilePondBaseElementEvents {
    /** FilePond element shadowRoot */
    #root: ShadowRoot;

    /** FilePond element slot */
    #slot: HTMLSlotElement;

    /** FilePond extension manager reference */
    #extensionManager: ReturnType<typeof createExtensionManager>;

    /** FilePond core instance reference */
    #entryTree: ReturnType<typeof createEntryTree>;

    /** Source input */
    #input: null | HTMLInputElement = null;

    /** Observes if a label is added */
    #labelObserver: null | MutationObserver = null;

    /** Locale object reference */
    #locale: null | Locale = null;

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
        return this.#root;
    }

    /** Returns a reference to the slot element */
    get _slot() {
        return this.#slot;
    }

    /** Attributes being observed for changes */
    static get observedAttributes() {
        return [
            'value',
            'multiple',
            'readonly',
            'required',
            'animations',
            'accept',
            'min-files',
            'max-files',
            'min-size',
            'max-size',
            'min-list-size',
            'max-list-size',

            //
            // changes to `disabled` attribute are handled by `formDisabledCallback`
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

        // make sure source input attributes are in sync with file-pond root
        this.#syncAttributeToInput(name, value);

        // some attributes are linked to extension properties, let's update those now
        this.#syncAttributeToExtensions(name, value);
    }

    /** Looks up the extension(s) linked to this attribute and assigns the matched props */
    #syncAttributeToExtensions(name: string, value: string | boolean) {
        const prop = toCamelCase(name);
        value = BooleanAttributes.includes(name) && value === '' ? true : value;
        this.#extensionManager.propagateExtensionProperty(prop, value);
    }

    /** Sets the inner input element id */
    set inputId(value: string) {
        // We know the input is defined at this point
        (this.#input as HTMLInputElement).id = value;

        // If there's a single label, we set its for attribute
        this.querySelector('label:only-of-type:not([for])')?.setAttribute('for', value);
    }

    /** Returns the inner input element id */
    get inputId(): string {
        // We know the input is defined at this point
        return (this.#input as HTMLInputElement).id;
    }

    /** Disable the field and sets the disabled attribute */
    set disabled(value: boolean) {
        setBooleanAttribute(this, 'disabled', value);
    }

    /** Gets the field disabled state */
    get disabled() {
        return !!getAttribute(this, 'disabled');
    }

    /** Toggle the field multiple state */
    set multiple(value: boolean) {
        setBooleanAttribute(this, 'multiple', value);
    }

    /** Gets the field multiple state */
    get multiple() {
        return !!getAttribute(this, 'multiple');
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

    get animations(): AnimationMode {
        return (getAttribute(this, 'animations') ?? 'auto') as AnimationMode;
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
        setStringAttribute(this, 'max-files', value);
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

        // so validity labels update to new language
        this.checkValidity();
    }

    /** Returns the current locale object, so it's easier to extend */
    get locale(): Locale | null {
        return this.#locale;
    }

    /** Sets custom extensions to load */
    set extensions(extensions: ExtensionFactory[]) {
        this.#extensionManager.extensions = extensions;
    }

    //#endregion

    //#region Element methods

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
        this.#root = this.attachShadow({ mode: 'open' });
        this.#root.adoptedStyleSheets = [defaultStyles, ...styles].map(createStyleSheet);
        this.#slot = document.createElement('slot');
        this.#root.append(this.#slot);

        // attach element internals, we'll assign getters from root the private internals prop
        this.#internals = this.attachInternals();

        // the pond "bridge" handles all comms between extensions
        this.#entryTree = createEntryTree({
            // formats the entry so all entries in the dataset follow the same data structure
            beforeAddEntry(entry) {
                // filter invalid entries
                if (!shouldAddEntry(entry)) {
                    return false;
                }

                // sanitize and filter
                return formatEntry(entry);
            },

            // makes modifications to the props the entry is updated with
            beforeUpdateEntryWithProps(entry, props, isUpdatingData) {
                // only handle file entries in this part, if data is being updated we need to update history
                if (isFileEntry(entry) && isUpdatingData) {
                    // we update both the source and new entry with the file props
                    copyFilePropsToObject(props.file, props);
                }

                // not updating extension, exit
                if (props.extension) {
                    // we're updating an extension status, let's remove progress if it's not part of the status update so it doesn't stick around when moving from one status to another
                    const extensionUpdates: { status: ExtensionStatus }[] = Object.values(
                        props.extension
                    );
                    for (const { status } of extensionUpdates) {
                        if (!status) {
                            continue;
                        }

                        // clear value and progress if it's not passed
                        status.values = status.values ?? null;
                        status.progress = isNumber(status.progress) ? status.progress : null;
                    }
                }
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
    }

    /** Connects or creates the source input field */
    #connectInput() {
        // already connected source input
        if (this.#input) {
            return;
        }

        // search for soure file input to enhance, or create one
        const input: HTMLInputElement =
            this.querySelector('input[type="file"]') ||
            (h('input', { type: 'file' }) as HTMLInputElement);

        // copy source input attributes to custom elements
        const syncedAttributes = [...GenericAttributes, ...InteractionAttributes];
        for (const attr of syncedAttributes) {
            const value = getAttributeFromElements(attr, input, this);

            // not set, so skip
            if (value === undefined) {
                continue;
            }

            // @ts-ignore
            this[attr] = value;
        }

        // clean up source input attributes
        removeAttributes(input, syncedAttributes);

        // store field reference for later usage
        this.#input = input;

        // sync interaction attributes to source input
        for (const attr of InteractionAttributes) {
            // @ts-ignore
            if (this[attr] === undefined) {
                continue;
            }
            // @ts-ignore
            this.#syncAttributeToInput(attr, this[attr]);
        }

        // we assign an id so a label can be linked
        if (!input.id) {
            // if a <label> is present and it has no `for` attribute, this sets the `for` attribute, it also sets this id to the input
            this.inputId = `file-pond-${getUniqueId()}`;
        }

        // by default we hide the source file input, if it's not appended yet we append it now
        if (!input.parentNode) {
            this.append(input);
        }
    }

    /** Syncs file-pond interaction attributes to source input attributes */
    #syncAttributeToInput(name: string, value: string | boolean) {
        // no source input defined yet (it's only there when connected)
        if (!this.#input || !InteractionAttributes.includes(name)) {
            return;
        }

        // @ts-ignore set attribute value
        this.#input[name] = value;
    }

    /** Called each time the element is added to the document */
    connectedCallback() {
        // this sets up the file input state
        this.#connectInput();

        // so when label is added its for attribute is synced with the input
        this.#labelObserver = new MutationObserver(([mutation]) => {
            const [addedNode] = mutation.addedNodes;

            // check if added label
            if (!(addedNode instanceof HTMLLabelElement) || addedNode.hasAttribute('for')) {
                return;
            }
            addedNode.setAttribute('for', this.inputId);
        });
        this.#labelObserver.observe(this, {
            childList: true,
            attributes: false,
        });

        /**
         * When the callback store changes we assign the value to the form internals for the custom
         * element
         */
        const handleCallbackStoreChange = (value: any) => {
            // if receives a value set formdata
            this.#internals?.setFormValue(
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
            element: this.#input,
            resetFilesOnAdd: true,
        });

        // Links up FormData to custom element
        this.#extensionManager.setExtensionProperties('ValueCallbackStore', {
            required: this.required,
            onChange: handleCallbackStoreChange,
        });

        // handle state updates so we can set custom validity if state is invalid, we also validate now so we know the current state
        this.#attachValidaton();

        // holds the last element that the pointer was down on, we use this to determine if pointer down was on the same element as pointerup when trying to browse for files
        let pointerCancelClick: null | boolean | EventTarget = null;

        // this listens for events on child elements
        this.#connectedSubs.push(
            // this toggles the dragging attribute to the file-pond element, we do this so we can move the file-pond element that is being interacted with to the front, so the dragged item also renders on top
            addListener(this, 'dragStart', () => {
                setBooleanAttribute(this, 'dragging', true);
            }),

            addListener(this, 'dragEnd', () => {
                setBooleanAttribute(this, 'dragging', false);
            }),

            // set up enter/spacebar press when file-pond is activeElement
            addListener(this, 'keypress', (e) => {
                if (e.target !== this || !/ | Enter/.test(e.key)) {
                    return;
                }

                // we'll deal with this event
                e.stopPropagation();
                e.preventDefault();

                // delegate click to source input
                this.#input?.click();
            }),

            // set up browse file on click interaction
            addListener(this, 'pointerdown', (e) => {
                pointerCancelClick = e.target;
            }),

            addListener(this, 'pointerup', (e) => {
                pointerCancelClick = e.target !== pointerCancelClick;
                // this auto resets the pointerCancelClick when the click right after the 'click' is handled
                setTimeout(() => {
                    pointerCancelClick = null;
                }, 0);
            }),

            addListener(this, 'click', (e) => {
                // don't handle if should be cancelled (when down target and up target differ)
                if (pointerCancelClick === true) {
                    return;
                }

                // get current target using pointer x,y as that also handles situations where we're dragging an entry and we're releasing it while our cursor is on top of the file input label
                const target = document.elementFromPoint(e.x, e.y);

                // need to have been a click on root
                if (target !== this || target?.nodeName !== 'FILE-POND-DROP-AREA') {
                    return;
                }

                // delegate click to source input
                this.#input?.click();
            }),

            // fire update events
            this.#entryTree.on('update', () => {
                dispatchCustomEvent(this, 'update');
            })
        );

        // the custom element logic is now connected
        dispatchCustomEvent(this, 'connected');
    }

    /** Called each time the element is removed from the document. */
    disconnectedCallback() {
        // stop observing
        this.#labelObserver?.disconnect();

        // unsub subscriptions created when connecting to the DOM
        this.#connectedSubs.forEach((unsub) => unsub());
        this.#connectedSubs = [];
    }

    //#region Form integration and validation
    /** This makes the element associateable with its parent form */
    static formAssociated = true;

    /** This Has a reference to the element form internals */
    #internals: ElementInternals | null = null;

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
        return this.#internals?.form ?? undefined;
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
                'update',
                debounce(() => this.checkValidity())
            ),
            this.#extensionManager.on(
                'update',
                debounce(() => this.checkValidity())
            )
        );

        this.checkValidity();

        // make focusable so validation messages are revealed correctly
        this.tabIndex = anyToInt(this.getAttribute('tabindex')) || 0;
    }

    /** Validates the current state of the field */
    checkValidity(): boolean | undefined {
        // get labels
        const { validationInvalidBusy = '', validationInvalidState = '' } = this.#locale || {};

        // need to know if extensions are currently working on files, if so, we show busy validity state
        if (hasBusyEntries(this.entries)) {
            // already in custom busy state
            if (this.#internals?.validity.customError === true) {
                return;
            }

            // set busy state
            this.#setValidity({ customError: true }, stringReplaceVariables(validationInvalidBusy));

            // we done until we're no longer busy
            return;
        }

        // get current extension states
        const extensionStates = this.#extensionManager.getState();

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
                ? statusToLabel(status, this.#locale, { debug: false })
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
        // field is valid
        if (!flags) {
            this.#internals?.setValidity({});
            return true;
        }

        /*
        It's unclear why Safari 17.6 doesn't want to focus the custom element itself. It throws "An invalid form control with name='...' is not focusable." when clicking the form submit button. It does work correctly when the anchor is set to the input 
        */
        const anchor = (isSafari() && this.#input) || undefined;
        this.#internals?.setValidity(flags, message, anchor);
        return false;
    }

    /** Proxy for element internals `reportValidity()` method */
    reportValidity() {
        this.#internals?.reportValidity();
    }

    /** Proxy for element internals `validity` getter */
    get validity() {
        return this.#internals?.validity;
    }

    /** Proxy for element internals `validationMessage` getter */
    get validationMessage() {
        return this.#internals?.validationMessage;
    }

    /** Called when element or parent element (for example a `<fieldset>`) is set to disabled */
    formDisabledCallback(isDisabled: boolean) {
        // sync up disabled state if parent element is disabled
        // this should not result in a disabled attribute being set on the <file-pond> element itself as that will silence this callback

        // copy to entry manager so we can disable ui in view extensions
        this.#extensionManager.propagateExtensionProperty('disabled', isDisabled);

        // copy to internal file input element if it's defined
        if (!this.#input) {
            return;
        }
        this.#input.disabled = isDisabled;
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
