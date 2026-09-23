<script lang="ts">
    import { measurable } from '../../../attachments/measurable.js';
    import { rectFromBounds, type Rect } from '../../../../utils/rect.js';
    import { type Bounds } from '../../../../utils/bounds.js';
    import { noop } from '../../../../utils/placeholder.js';
    import { onDestroy } from 'svelte';

    interface EntryItemPlaceholderOptions {
        id: string;
        index: number;
        onmeasureitem?: (id: string, index: number, rect?: Rect) => void;
        tag?: string;
        part?: string;
        class?: string;
    }

    let {
        id,
        index,
        part,
        tag = 'li',
        class: klass,
        onmeasureitem = noop,
    }: EntryItemPlaceholderOptions = $props();

    function handleMeasureElement(bounds: Bounds) {
        onmeasureitem(id, index, rectFromBounds(bounds));
    }

    onDestroy(() => {
        // clear rect!
        onmeasureitem(id, index, undefined);
    });
</script>

<svelte:element
    this={tag}
    class={klass}
    {part}
    {@attach measurable({
        onmeasure: handleMeasureElement,
    })}
></svelte:element>
