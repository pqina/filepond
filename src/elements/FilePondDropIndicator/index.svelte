<script lang="ts">
    import { Spring } from 'svelte/motion';
    import { rectCenter, rectContainsPoint, rectFromBounds, rectPad } from '../../utils/rect.js';
    import {
        vectorElastify,
        vectorFromRect,
        vectorSubtract,
        type Vector,
    } from '../../utils/vector.js';
    import { type Rect } from '../../utils/rect.js';
    import { droparea, type DropEventDetail } from '../attachments/droparea.js';
    import { measurable } from '../attachments/measurable.js';
    import {
        computeAnimationPreference,
        getGlobalPreventAnimations,
        getShouldReduceMotion,
    } from '../common/animationPreference.svelte.js';
    import { sizeFromRect } from '../../utils/size.js';
    import { ElementPane } from '../components/ElementPane/index.js';
    import type { FilePondSvelteComponentOptions } from '../../types/index.js';
    import type { Bounds } from '../../utils/bounds.js';

    let { animations = 'auto', springDefaults }: FilePondSvelteComponentOptions = $props();

    export function setIndicatorRect(rect: Rect) {
        // no rect so let's stop showing the placeholder indicator
        if (!rect) {
            placeholderRect = undefined;
            return;
        }

        // test if root rect is inside my root rect (we add placeholder size so if root needs to expand to wrap placeholder we can keep it into account)
        const point = vectorFromRect(rect);
        const paddedRootRect = rectPad(rootRect as Rect, Math.min(rect.width, rect.height));
        if (!rectContainsPoint(paddedRootRect, point)) {
            return;
        }

        // update rect
        placeholderRect = { ...rect };
    }

    const IndicatorSize = { width: 64, height: 64 };
    const IndicatorElasticity = 4;

    // update animation preference when changes
    const globalPreventState = getGlobalPreventAnimations();
    const reduceMotionState = getShouldReduceMotion();
    const enableAnimations = $derived(
        computeAnimationPreference(animations, globalPreventState, reduceMotionState)
    );

    //
    // geom
    //
    let rootRect: Rect | undefined = $state.raw() as Rect;
    let pointerPosition: Vector | undefined = $state.raw() as Vector;
    let placeholderRect: Rect | undefined = $state.raw() as Rect;

    const hasCoordinates = $derived(rootRect && placeholderRect && pointerPosition ? true : false);

    const pointerPositionRelativeToRoot = $derived(
        hasCoordinates ? vectorSubtract(pointerPosition, rootRect) : undefined
    );

    const placeholderCenterRelativeToRoot = $derived(
        hasCoordinates ? vectorSubtract(rectCenter(placeholderRect), rootRect) : undefined
    );

    const indicatorPosition = $derived.by(() => {
        if (!hasCoordinates) {
            return undefined;
        }

        if (!enableAnimations) {
            return placeholderCenterRelativeToRoot;
        }

        return vectorElastify(
            placeholderCenterRelativeToRoot as Vector,
            pointerPositionRelativeToRoot as Vector,
            IndicatorElasticity
        );
    });

    //
    // spring updates
    //
    const indicatorPositionSpring = new Spring(undefined) as Spring<Vector | undefined>;
    $effect(() => {
        if (!springDefaults) {
            return;
        }
        Object.assign(indicatorPositionSpring, springDefaults);
    });

    let didNotHaveCoordinates = false;
    $effect(() => {
        if (!indicatorPosition) {
            didNotHaveCoordinates = true;
            return;
        }

        indicatorPositionSpring.set(indicatorPosition, {
            instant: !enableAnimations || didNotHaveCoordinates,
        });

        didNotHaveCoordinates = false;
    });

    const indicatorOpacitySpring = new Spring(1);
    $effect(() => {
        if (!springDefaults) {
            return;
        }
        Object.assign(indicatorOpacitySpring, springDefaults);
    });

    $effect(() => {
        if (!hasCoordinates) {
            indicatorOpacitySpring.set(0, { instant: !enableAnimations });
            return;
        }

        indicatorOpacitySpring.set(1);
    });

    const indicatorSizeSpring = new Spring(IndicatorSize);
    $effect(() => {
        if (!springDefaults) {
            return;
        }
        Object.assign(indicatorSizeSpring, springDefaults);
    });

    $effect(() => {
        if (indicatorOpacitySpring.current <= 0) {
            indicatorSizeSpring.set(IndicatorSize, { instant: !enableAnimations });
            return;
        }

        if (hasCoordinates) {
            indicatorSizeSpring.set(sizeFromRect(placeholderRect as Rect), {
                instant: !enableAnimations,
            });
        }
    });

    const shouldRenderIndicator = $derived(
        !!indicatorPositionSpring.current && indicatorOpacitySpring.current > 0
    );

    function handleMeasure(bounds: Bounds) {
        rootRect = rectFromBounds(bounds);
    }

    function handleDragItem({ viewPosition }: DropEventDetail) {
        pointerPosition = {
            x: viewPosition.x,
            y: viewPosition.y,
        };
    }

    //
    // styles
    //
    const translationX = $derived(
        indicatorPositionSpring.current
            ? indicatorPositionSpring.current.x - indicatorSizeSpring.current.width * 0.5
            : 0
    );
    const translationY = $derived(
        indicatorPositionSpring.current
            ? indicatorPositionSpring.current.y - indicatorSizeSpring.current.height * 0.5
            : 0
    );
    const styleTransform = $derived(`translate(${translationX}px,${translationY}px)`);
</script>

<div
    class="root"
    {@attach measurable({
        onmeasure: handleMeasure,
    })}
    {@attach droparea({
        ondragitem: handleDragItem,
    })}
>
    {#if shouldRenderIndicator}
        <div style:transform={styleTransform} style:opacity={indicatorOpacitySpring.current}>
            <ElementPane {...indicatorSizeSpring.current}></ElementPane>
        </div>
    {/if}
</div>
