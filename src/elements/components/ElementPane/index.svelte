<script lang="ts">
    interface ElementPaneOptions {
        /** Optional class to add to the pane element */
        class?: string;

        /** Part id so it's targetable from outside the custom element */
        part?: string;

        /** Pane width */
        width: number;

        /** Pane height */
        height: number;

        /** Pane opacity */
        opacity?: number;

        /** Pixel precision */
        precision?: number;
    }

    import { roundPrecision } from '../../../utils/math.js';
    import { isNumber } from '../../../utils/test.js';

    let {
        class: klass,
        part,
        width,
        height,
        opacity = undefined,
        precision = 1,
    }: ElementPaneOptions = $props();

    function roundSize(value: number) {
        return isNumber(value) ? roundPrecision(Math.max(value, 0), precision) : 0;
    }

    const panelWidth = $derived(roundSize(width));
    const panelHeight = $derived(roundSize(height));
    const isOpaque = $derived(isNumber(opacity) ? opacity > 0 : true);
    const shouldRender = $derived(panelWidth > 0 && panelHeight > 0 && isOpaque);
    const styleWidth = $derived(`${panelWidth}px`);
    const styleHeight = $derived(`${panelHeight}px`);
</script>

{#if shouldRender}
    <element-pane {part} class={klass}>
        <div style:opacity style:width={styleWidth} style:height={styleHeight}></div>
    </element-pane>
{/if}
