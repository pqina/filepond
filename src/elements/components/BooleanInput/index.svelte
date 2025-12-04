<script lang="ts">
    import { createDefaultIcon } from '../../common/html.js';
    import { stopPropagation, updateDataset } from '../../../utils/dom.js';
    import { getUniqueId } from '../../../utils/string.js';

    interface BooleanInputOptions {
        class?: string;
        dataset?: { [key: string]: string | number | boolean };
        id?: string;
        label?: string;
        labelIsImplicit?: boolean;
        title?: string;
        type?: 'checkbox' | 'radio';
        icon?: string;
        name?: string;
        checked?: boolean;
        onchange: (checked: boolean) => void;
    }

    const {
        class: klass = undefined,
        dataset = undefined,
        id = `bool-${getUniqueId()}`,
        label,
        labelIsImplicit,
        title,
        type = 'checkbox',
        icon,
        name,
        checked,
        onchange,
    }: BooleanInputOptions = $props();

    let root: HTMLElement;

    // svg to use for icon
    const svg = $derived(
        icon ? (icon.startsWith('<svg') ? icon : createDefaultIcon(icon)) : undefined
    );

    // so we can update root dataset
    $effect(() => {
        updateDataset(root, dataset);
    });

    function handleOnChange(e: Event) {
        onchange?.((e.target as HTMLInputElement).checked);
    }
</script>

<boolean-input class={klass} bind:this={root}>
    <label for={id} class={labelIsImplicit ? 'implicit' : undefined}>{label}</label>
    <input
        {type}
        {id}
        {name}
        {checked}
        onchange={handleOnChange}
        oninput={stopPropagation}
        title={title?.length ? title : undefined}
    />
    {#if svg}<span class="icon">{@html svg}</span>{/if}
</boolean-input>
