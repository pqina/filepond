import { mount, unmount, type Component } from 'svelte';
import { HTMLElementSafe } from '../../common/ssr.js';
import { addListener, createStyleSheet, dispatchCustomEvent } from '../../utils/dom.js';
import { arrayRemoveFalsy } from '../../utils/array.js';

const ObservedAttributes = ['animations'];
const SharedProperties = ['animations', 'springDefaults'];

export class FilePondSvelteComponentElement extends HTMLElementSafe {
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
            springDefaults: undefined,
            animations: this.getAttribute('animations') || undefined,
        });

        [...new Set([...SharedProperties, ...properties])].forEach((key) => {
            Object.defineProperty(this, key, {
                get() {
                    return this.#props[key];
                },
                set(value) {
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
                        this.#app[key](...args);
                    },
                    writable: false,
                    configurable: false,
                };
                return instance;
            }, {})
        );

        // assign events
        this.#events = events;

        // // create the app
        // this.#createApp();
    }

    // #createApp() {

    // }

    addListener(type: string, cb: (e: CustomEvent) => void) {
        const unsub = addListener(this._root.children[0], type, cb);
        this.#listeners.push(unsub);
        return unsub;
    }

    connectedCallback() {
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
    }

    disconnectedCallback() {
        this.#listeners.forEach((unsub) => unsub());
        unmount(this.#app);
        this.#app = null;
    }
}
