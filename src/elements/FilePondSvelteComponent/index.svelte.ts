import { mount, unmount, type Component } from 'svelte';
import { HTMLElementSafe } from '../../common/ssr.js';
import { addListener, createStyleSheet, dispatchCustomEvent } from '../../utils/dom.js';
import { arrayRemoveFalsy } from '../../utils/array.js';
import type {
    AnimationMode,
    Locale,
    ReducedMotionPreference,
    SpringOptions,
} from '../../types/index.js';

export const COMPONENT_PROPS = ['locale', 'reducedMotionPreference', 'springOptions'];

const ObservedAttributes = ['reduced-motion'];

export interface FilePondSvelteComponentElementEventMap {
    connected: CustomEvent<null>;
    disconnected: CustomEvent<null>;
}

interface FilePondSvelteElementEventHandler {
    addEventListener<K extends keyof FilePondSvelteComponentElementEventMap>(
        type: K,
        listener: (
            this: FilePondSvelteComponentElement,
            event: FilePondSvelteComponentElementEventMap[K]
        ) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
}

export interface FilePondSvelteComponentOptions {
    /** The component root element */
    root: HTMLElement;

    /** Optional labels */
    locale?: Locale;

    /** Should we use motion or not */
    reducedMotionPreference?: ReducedMotionPreference;

    /** Generic Spring configuration to use */
    springOptions?: SpringOptions;
}

/**
 * FilePond Svelte Component Element
 *
 * @event {CustomEvent<null>} 'connected' - Fired when connected to the DOM
 * @event {CustomEvent<null>} 'disconnected' - Fired when disconnected from the DOM
 */
export class FilePondSvelteComponentElement
    extends HTMLElementSafe
    implements FilePondSvelteElementEventHandler
{
    declare springOptions?: SpringOptions;
    declare reducedMotionPreference?: AnimationMode;
    declare locale?: Locale;

    #root: ShadowRoot;
    #app: any;
    #props: any;
    #queue: [string, any[]][] = [];
    #events: string[];
    #listeners: (() => void)[] = [];
    #Component: Component<any, any, any>;

    /** Protected props */
    get _app() {
        return this.#app;
    }

    get _root() {
        return this.#root;
    }

    /** Attributes being observed for changes */
    static get observedAttributes() {
        return ObservedAttributes;
    }

    attributeChangedCallback(name: string, _: string, value: string) {
        if (name === 'reduced-motion') {
            this.#props.reducedMotionPreference = value;
            return;
        }

        // assign directly to #props
        Object.assign(this.#props, {
            [name]: value,
        });
    }

    constructor(
        component: Component<any, any, any>,
        options: {
            styles?: string[];
            properties?: string[];
            methods?: string[];
            events?: string[];
        }
    ) {
        super();

        const { styles = [], properties = [], methods = [], events = [] } = options || {};

        // this is the component we'll mount
        this.#Component = component;

        // create root element to wrap
        this.#root = this.attachShadow({ mode: 'open' });
        this.#root.adoptedStyleSheets = arrayRemoveFalsy(styles).map(createStyleSheet);

        // so we can reference it elsewhere in this class (for internal svelte reason we can't assign directly to this.#props with $state)
        this.#props = $state({
            root: this,
            springOptions: undefined,
            locale: undefined,
            reducedMotionPreference: this.getAttribute('reduced-motion') || 'auto',
        });

        [...new Set([...COMPONENT_PROPS, ...properties])].forEach((key) => {
            Object.defineProperty(this, key, {
                get() {
                    return this.#props[key];
                },
                set(value) {
                    // console.log(this.tagName, key, value);
                    this.#props[key] = value;
                },
            });
        });

        Object.defineProperties(
            this,
            methods.reduce((instance: { [key: string]: any }, key) => {
                instance[key] = {
                    value: function (...args: any[]) {
                        if (!this.#app) {
                            this.#queue.push([key, args]);
                            return;
                        }
                        return this.#app[key](...args);
                    },
                    writable: false,
                    configurable: false,
                };
                return instance;
            }, {})
        );

        // assign events
        this.#events = events;
    }

    addListener(type: string, cb: (e: CustomEvent) => void) {
        if (!this._root.children[0]) {
            return;
        }
        const unsub = addListener(this._root.children[0], type, cb);
        this.#listeners.push(unsub);
        return unsub;
    }

    connectedCallback() {
        if (this.#app) {
            return;
        }

        this.#app = mount(this.#Component, {
            target: this.#root,
            props: this.#props,
        });

        this.#events.forEach((type) => {
            const unsub = addListener(this._root.children[0], type, (e) => {
                dispatchCustomEvent(this, type, {
                    bubbles: true,
                    detail: e.detail,
                });
            });
            this.#listeners.push(unsub);
        });

        this.#queue.forEach(([key, args]) => {
            this.#app[key](...args);
        });
        this.#queue.length = 0;

        this.dispatchEvent(new CustomEvent('connected'));
    }

    disconnectedCallback() {
        this.#listeners.forEach((unsub) => unsub());
        this.#listeners.length = 0;

        if (this.#app) {
            unmount(this.#app);
            this.#app = null;
        }

        this.dispatchEvent(new CustomEvent('disconnected'));
    }
}
