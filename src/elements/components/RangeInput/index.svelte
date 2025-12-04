<script lang="ts">
    import { type SpringOptions } from '../../../types/index.js';
    import { type Snippet } from 'svelte';
    import { type Size } from '../../../utils/size.js';
    import { Spring } from 'svelte/motion';
    import { resizable } from '../../attachments/resizable.js';
    import { getStylePropertyAsNumber } from '../../../utils/dom.js';
    import { clamp } from '../../../utils/math.js';
    import { noop } from '../../../utils/placeholder.js';
    import { isNumber } from '../../../utils/test.js';
    import { ElementPane } from '../ElementPane/index.js';

    interface RangeInputOptions {
        /** Class to add to the root element */
        class?: string;

        /** Min value, defaults to `0` */
        min?: number;

        /** Max value, defaults to `1` */
        max?: number;

        /** Value, defaults to `0` */
        value?: number;

        /** Step, defaults to `0.1` */
        step?: number;

        /** Used to limit the number of decimals, defaults to 3 */
        precision?: number;

        /** Progress slider children */
        children: Snippet<[{ hoverValue: number }]>;

        enableAnimations?: boolean;

        springConfig?: SpringOptions;

        oninput?: (detail: number) => void;

        onhover?: (detail: number) => void;
    }

    let {
        class: klass = undefined,
        min = 0,
        max = 1,
        value = 0,
        step = 0.1,
        oninput = noop,
        onhover = noop,
        precision = 2,
        children,
        enableAnimations = true,
        springConfig,
    }: RangeInputOptions = $props();

    // @ts-ignore so we can animate back pane
    const animatedWidth: Spring<number | undefined> = new Spring(undefined);
    $effect(() => {
        if (!springConfig) {
            return;
        }
        Object.assign(animatedWidth, springConfig);
    });

    /** The iInput[type="range"] element */
    let inputElement = $state.raw() as HTMLInputElement;

    /** The element that renders the track */
    let trackElement: HTMLElement | undefined = $state.raw();

    /** CSS Class name to apply to set on the component root */
    const componentClassName: string | undefined = klass;

    const trackComputedStyles = $derived(trackElement && getComputedStyle(trackElement));
    const trackComputedBorderRadius = $derived(
        trackComputedStyles
            ? getStylePropertyAsNumber(trackComputedStyles, 'border-radius') || 0
            : 0
    );

    let inputWidth: null | number = $state.raw(null);
    let rootWidth: null | number = $state.raw(null);
    let pointerOffsetX: null | number = $state.raw(null);

    /** `trackHeight` is used to calculate the current border radius */
    let trackHeight = $state.raw() as number;

    const trackAnimatedWidth = $derived(
        isNumber(animatedWidth.current) ? animatedWidth.current : null
    ) as number;
    const trackBorderRadius = $derived(Math.min(trackComputedBorderRadius, trackHeight * 0.5));
    const trackCurrentWidth = $derived(Math.max(0, trackAnimatedWidth - trackBorderRadius * 2));

    /** Measures the input width so we can correctly position title */
    function handleResizeRoot(size: Size) {
        rootWidth = size.width;
        animatedWidth.set(rootWidth, {
            instant: !enableAnimations,
        });
    }

    /** Measures the input width so we can correctly position title */
    function handleResizeInput(size: Size) {
        inputWidth = size.width;
    }

    /** Measures the track height so we can correctly calculate the current border radius */
    function handleResizeTrack(size: Size) {
        trackHeight = size.height;
    }

    //#region Hover
    let isPointerDown = false;

    function handlePointerDown() {
        isPointerDown = true;
    }

    function handlePointerUp() {
        isPointerDown = false;
    }

    /** Handles pointer movement in input element */
    function handlePointerMove(e: PointerEvent) {
        // store so we show hover indicator
        pointerOffsetX = e.offsetX;

        // if pointer is down we also update the value, this improves UX on touch devices
        if (!isPointerDown) {
            return;
        }

        // update value based on pointerOffset
        inputElement.value = `${min + (pointerOffsetX / (inputWidth as number)) * (max - min)}`;
        oninput(parseFloat(inputElement.value));
    }

    function handlePointerLeave() {
        pointerOffsetX = null;
        isPointerDown = false;
    }

    const isHovering = $derived(pointerOffsetX !== null);

    let lastHoverProgress = $state.raw(0);
    function storeLastHoverProgress(p: number) {
        lastHoverProgress = p;
    }

    /** Returns current hover progress */
    function getCurrentHoverProgress(
        pointerX: number,
        inputElementWidth: number,
        rootElementWidth: number,
        borderRadius: number
    ) {
        const margin = inputElementWidth - rootElementWidth;
        return clamp(
            (pointerX - margin / 2 - borderRadius) / (inputElementWidth - margin - borderRadius * 2)
        );
    }

    const hoverProgress = $derived(
        isHovering && inputWidth && rootWidth && pointerOffsetX !== null
            ? getCurrentHoverProgress(pointerOffsetX, inputWidth, rootWidth, trackBorderRadius)
            : lastHoverProgress
    );

    $effect(() => {
        storeLastHoverProgress(hoverProgress);
        onhover?.(hoverProgress);
    });

    //#endregion

    //#region Title
    let titleWidth = $state.raw() as number;
    function handleResizeTitle(size: Size) {
        titleWidth = size.width;
    }

    /** Returns the position of the title above the progress indicator */
    function getCurrentTitleOffset(progress: number, rootElementWidth: number, titleWidth: number) {
        return clamp(
            progress * rootElementWidth - titleWidth * 0.5,
            0,
            rootElementWidth - titleWidth
        );
    }

    const titleOffsetX = $derived(
        rootWidth && titleWidth ? getCurrentTitleOffset(hoverProgress, rootWidth, titleWidth) : 0
    );

    //#endregion

    /** Used to update the progress indicator bar */
    const currentProgress = $derived(value / (max - min));

    /** Handles changing the range input value */
    function handleInput() {
        oninput(parseFloat(inputElement.value));
    }
</script>

<range-input
    class={componentClassName}
    style:--track-border-radius={trackBorderRadius}
    {@attach resizable({
        onresize: handleResizeRoot,
    })}
>
    <input
        bind:this={inputElement}
        type="range"
        {min}
        {max}
        {value}
        step={step.toFixed(precision)}
        oninput={handleInput}
        onpointerdown={handlePointerDown}
        onpointerup={handlePointerUp}
        onpointermove={handlePointerMove}
        onpointerleave={handlePointerLeave}
        {@attach resizable({
            onresize: handleResizeInput,
        })}
    />

    <div
        bind:this={trackElement}
        class="range-input-bar range-input-track"
        {@attach resizable({
            onresize: handleResizeTrack,
        })}
    >
        <ElementPane width={trackCurrentWidth} height={trackHeight}></ElementPane>
    </div>

    <div class="range-input-bar range-input-hover">
        <ElementPane width={trackCurrentWidth * hoverProgress} height={trackHeight}></ElementPane>
    </div>

    <div class="range-input-bar range-input-progress">
        <ElementPane
            width={Math.max(trackCurrentWidth * currentProgress, trackHeight)}
            height={trackHeight}
        ></ElementPane>
    </div>

    <div
        class="range-input-knob"
        style:--offset={(trackCurrentWidth * currentProgress).toFixed(precision)}
    ></div>

    <span
        class="range-input-title"
        style:--title-x={`${titleOffsetX}px`}
        style:--title-reveal={pointerOffsetX !== null ? 1 : 0}
        {@attach resizable({
            onresize: handleResizeTitle,
        })}
    >
        {@render children({ hoverValue: min + hoverProgress * (max - min) })}
    </span>
</range-input>
