<script lang="ts">
    import { type Snippet } from 'svelte';
    import { createDefaultIcon } from '../../common/html.js';
    import { toSpaceSeparatedString } from '../../common/string.js';
    import { updateDataset, updateStyles } from '../../../utils/dom.js';
    import { noop } from '../../../utils/placeholder.js';
    import { isElement, isString } from '../../../utils/test.js';

    interface ButtonOptions {
        /** Onclick handler */
        onclick?: () => void;

        /** The name part to assign to this button */
        part?: string;

        /** Class to set on the button element */
        class?: string;

        /** Type to set on the button element */
        type?: 'button' | 'submit' | 'reset';

        /** Label to use */
        label?: string;

        /** Title to use */
        title?: string;

        /** Icon to use */
        icon?: string;

        /** Defaults to false */
        disabled?: boolean;

        /** Defaults to false */
        inert?: boolean;

        /** Defaults to undefined */
        dataset?: { [key: string]: string | number | boolean };

        /** Defaults to undefined */
        styles?: { [key: string]: string };

        /** id of element that describes this button in more detail */
        ariaDescribedby?: string;

        /** Should move focus to this button when created */
        autofocus?: boolean;

        /** command name */
        command?: string;

        /** command target */
        commandfor?: string | HTMLElement;

        /** tabindex */
        tabindex?: number | null | undefined;

        /** Children to render in the button */
        children?: Snippet;
    }

    let {
        class: klass = undefined,
        type = 'button',
        onclick = noop,
        part = undefined,
        icon = undefined,
        label = undefined,
        title = undefined,
        disabled = false,
        inert = false,
        dataset = undefined,
        styles = undefined,
        ariaDescribedby = undefined,
        command = undefined,
        commandfor = undefined,
        tabindex = undefined,
        autofocus = false,
    }: ButtonOptions = $props();

    // svg to use for icon
    const svg = $derived(
        icon ? (icon.startsWith('<svg') ? icon : createDefaultIcon(icon)) : undefined
    );

    let root: HTMLButtonElement;

    // so we can update root dataset
    $effect(() => {
        updateDataset(root, dataset);
    });

    // so we can update styles
    $effect(() => {
        updateStyles(root, styles);
    });

    // so we can set element command for
    $effect(() => {
        root.commandForElement = isElement(commandfor) ? commandfor : null;
    });

    $effect(() => {
        if (autofocus && !inert) {
            root.focus({
                preventScroll: true,
            });

            // reset
            autofocus = false;
        }
    });

    // combine css classes
    const currentClass = $derived(klass);
    const buttonClass = $derived(toSpaceSeparatedString('button', currentClass));
</script>

<button
    bind:this={root}
    {type}
    class={buttonClass}
    {part}
    {disabled}
    {inert}
    {onclick}
    {tabindex}
    {command}
    commandfor={isString(commandfor) ? commandfor : undefined}
    aria-describedby={ariaDescribedby}
    title={title?.length ? title : undefined}
>
    {#if svg}<span class="icon">{@html svg}</span>{/if}
    {#if label?.length}<span class="label">{label}</span>{/if}
</button>
