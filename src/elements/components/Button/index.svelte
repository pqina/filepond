<script lang="ts">
    import { type Snippet } from 'svelte';
    import { createDefaultIcon } from '../../common/html.js';
    import { toSpaceSeparatedString } from '../../common/string.js';
    import { updateDataset, updateStyles } from '../../../utils/dom.js';
    import { noop } from '../../../utils/placeholder.js';

    interface ButtonOptions {
        /** Onclick handler */
        onclick?: () => void;

        /** The name part to assign to this button*/
        part?: string;

        /** Class to set on the button element */
        class?: string;

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

        /** Children to render in the button */
        children?: Snippet;
    }

    let {
        class: klass = undefined,
        onclick = noop,
        part = undefined,
        icon = undefined,
        label = undefined,
        title = undefined,
        disabled = false,
        inert = false,
        dataset = undefined,
        styles = undefined,
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

    // combine css classes
    const currentClass = $derived(klass);
    const buttonClass = $derived(toSpaceSeparatedString('button', currentClass));
</script>

<button
    bind:this={root}
    type="button"
    class={buttonClass}
    {part}
    {disabled}
    {inert}
    {onclick}
    title={title?.length ? title : undefined}
>
    {#if svg}<span class="icon">{@html svg}</span>{/if}
    {#if label?.length}<span class="label">{label}</span>{/if}
</button>
