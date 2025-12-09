<script lang="ts">
    import { measurable } from '../../../attachments/measurable.js';
    import { rectFromBounds, type Rect } from '../../../../utils/rect.js';
    import { type Bounds } from '../../../../utils/bounds.js';
    import { noop } from '../../../../utils/placeholder.js';
    import { onDestroy } from 'svelte';

    interface EntryItemPlaceholderOptions {
        tag?: string;
        part?: string;
        class?: string;
        onmeasureitem: (rect?: Rect) => void;
    }

    let {
        tag = 'li',
        part,
        class: klass,
        onmeasureitem = noop,
    }: EntryItemPlaceholderOptions = $props();

    onDestroy(() => {
        // clear rect!
        onmeasureitem();
    });
</script>

<svelte:element
    this={tag}
    class={klass}
    {part}
    {@attach measurable({
        onmeasure: (bounds: Bounds) => onmeasureitem(rectFromBounds(bounds)),
    })}
></svelte:element>
