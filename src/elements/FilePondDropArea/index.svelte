<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Spring } from 'svelte/motion';
    import { measurable } from '../attachments/measurable.js';
    import { createAnimationState } from '../common/animationPreference.svelte.js';
    import { rectFromBounds, type Rect } from '../../utils/rect.js';
    import { ElementPane } from '../components/ElementPane/index.js';
    import type { FilePondSvelteComponentOptions } from '../../types/index.js';
    import type { Bounds } from '../../utils/bounds.js';

    let { animations = 'auto', springDefaults }: FilePondSvelteComponentOptions = $props();

    const callbacks = {
        animateRect: (rect: Rect) => {},
        computeRect: (rect: Rect) => {},
    };

    export function setAnimateRectCallback(cb: (rect: Rect) => void) {
        callbacks.animateRect = cb;
    }

    export function setComputeRectCallback(cb: (rect: Rect) => void) {
        callbacks.computeRect = cb;
    }

    // is a state so it triggers pane redraw
    let rootRect = $state.raw() as Rect;

    // update animation preference when changes
    // svelte-ignore state_referenced_locally
    const animationState = createAnimationState(animations);
    $effect(() => animationState.setPreference(animations));
    const enableAnimations = $derived(animationState.current);

    // update spring
    const rootRectSpring = new Spring<Rect | undefined>(undefined, {
        precision: 1,
    }) as Spring<Rect>;
    $effect(() => {
        if (!springDefaults) {
            return;
        }

        Object.assign(rootRectSpring, springDefaults);
    });
    $effect(() => {
        rootRectSpring.set(rootRect, { instant: !enableAnimations });
    });

    function handleMeasure(bounds: Bounds) {
        rootRect = rectFromBounds(bounds);
    }

    $effect(() => {
        callbacks.computeRect(rootRect);
    });

    $effect(() => {
        callbacks.animateRect(rootRectSpring.current);
    });
</script>

<div
    class="root"
    {@attach measurable({
        onmeasure: handleMeasure,
    })}
>
    {#if rootRectSpring.current}
        <ElementPane width={rootRectSpring.current.width} height={rootRectSpring.current.height}
        ></ElementPane>
    {/if}
</div>
