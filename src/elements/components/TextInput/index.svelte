<script lang="ts">
    import { noop } from '../../../utils/placeholder.js';
    import { isFunction } from '../../../utils/test.js';
    import { Key, routeKeyboardEvent } from '../../../utils/dom.js';

    interface TextInputOptions {
        /** Class to add to the root element */
        class?: string;

        /** Value, defaults to `0` */
        value?: string;

        /** Type, defaults to `text` */
        type?: string;

        /** Inputmode, defaults to `text` */
        inputmode?: 'text' | 'search' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal';

        /** Check for spelling errors */
        spellcheck?: any;

        /** Autocapitalize input */
        autocapitalize?: 'none' | 'off' | 'on' | 'characters' | 'sentences' | 'words';

        /** Autocorrect input */
        autocorrect?: '' | 'off' | 'on';

        /** Autocomplete input */
        autocomplete?: any;

        onconfirm?: (detail: string) => void;
        oninput?: (detail: string) => void;
        onfocus?: (detail: string) => void;
        onblur?: (detail: string) => void;

        disabled?: boolean;
    }

    let {
        class: klass = undefined,
        value = '',
        type = 'text',
        inputmode = 'text',
        spellcheck = 'false',
        autocapitalize = 'off',
        autocorrect = 'off',
        autocomplete = 'off',
        oninput = noop,
        onfocus = noop,
        onblur = noop,
        onconfirm = undefined,
        disabled = false,
    }: TextInputOptions = $props();

    /** A reference to the Input element */
    let inputElement = $state.raw() as HTMLInputElement;

    /** Handles changing the range input value */
    function handleInput() {
        value = inputElement.value;
        oninput(inputElement.value);
    }

    function handleBlur() {
        onblur(inputElement.value);
    }

    function handleFocus() {
        onfocus(inputElement.value);
    }

    const keyboardRoutes = {
        [Key.ENTER]: (e: KeyboardEvent) => {
            onconfirm?.(inputElement.value);
            inputElement.blur();
        },
    };

    function handleKeyPress(e: KeyboardEvent) {
        routeKeyboardEvent(e, keyboardRoutes);
    }
</script>

<input
    bind:this={inputElement}
    class={klass}
    {value}
    {type}
    {spellcheck}
    {autocapitalize}
    {autocomplete}
    {autocorrect}
    {inputmode}
    {disabled}
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeypress={isFunction(onconfirm) ? handleKeyPress : undefined}
/>
