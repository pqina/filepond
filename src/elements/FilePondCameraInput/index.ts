import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import CameraInputApp from './index.svelte';
import { registerShadowRoot } from '../common/extendStyles.js';
import defaultStyles from '../styles/defaults.css?inline';
import styles from './index.css?inline';
import { getAttribute, setBooleanAttribute, setStringAttribute } from '../../utils/dom.js';

export interface CameraInputElementOptions {
    oncapture?: (output: File) => void;
    onreset?: () => void;
    onerror?: (error: Error) => void;
    filename?: ((blob: Blob) => string) | string | undefined;
    blobOptions?: {
        type?: string;
        quality?: number;
    };
}

export class CameraInputElement extends FilePondSvelteComponentElement {
    declare requestCameraAccess: (constraints?: MediaStreamConstraints) => Promise<boolean>;
    declare oncapture: (output: File) => void;
    declare filename: ((blob: Blob) => string) | string | undefined;

    /** This makes the element associable with its parent form */
    static formAssociated = true;

    /** Internal value */
    #value: File | undefined;

    /** This Has a reference to the element form internals */
    #internals: ElementInternals;

    /** Sets the current field name */
    set name(value: string) {
        setStringAttribute(this, 'name', value);
    }

    /** Returns the current field name */
    get name(): string | undefined {
        return this.getAttribute('name') ?? undefined;
    }

    /** Gets camera value */
    get value(): File | undefined {
        return this.#value;
    }

    /** Sets camera value */
    set value(value: File | undefined) {
        this.#value = value;
    }

    /** Proxy for element internals `validity` getter */
    get validity() {
        return this.#internals.validity;
    }

    /** Proxy for element internals `validationMessage` getter */
    get validationMessage() {
        return this.#internals.validationMessage;
    }
    /** Set field as required */
    set required(value: boolean) {
        setBooleanAttribute(this, 'required', value);
    }

    /** Gets the field required state */
    get required() {
        return !!getAttribute(this, 'required');
    }

    constructor() {
        super(CameraInputApp, {
            styles: [styles],
            properties: ['filename', 'oncapture', 'onreset'],
            methods: ['requestCameraAccess'],
        });

        // attach element internals, we'll assign getters from root the private internals prop
        this.#internals = this.attachInternals();

        registerShadowRoot(this._root, defaultStyles + styles);
    }

    connectedCallback() {
        super.connectedCallback();

        // handle capture
        this.oncapture = (output: File) => {
            this.#value = output;
            this.#internals.setFormValue(output);

            this.checkValidity();
        };

        this.onreset = () => {
            this.#value = undefined;
            this.#internals.setFormValue(null);

            this.checkValidity();
        };

        this.tabIndex = -1;

        this.checkValidity();
    }

    checkValidity() {
        if (this.required && !this.#value) {
            this.#internals.setValidity(
                {
                    valueMissing: true,
                },
                // TODO: translate
                'Please fill in this field'
            );
            return;
        }

        // valid
        this.#internals.setValidity({});
    }

    /**
     * Called when user resets form. Resets field to initial state.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
     */
    formResetCallback() {
        this.#value = undefined;
        this.#internals.setFormValue(null);
    }
}
