<script lang="ts">
    import { Spring } from 'svelte/motion';
    import { clamp } from '../../../utils/math.js';
    import { isNumber, isSafari } from '../../../utils/test.js';
    import { getUniqueId } from '../../../utils/string.js';

    export const ProgressIndicatorShape: {
        [key: string]: 'line' | 'circle' | 'rectangle';
    } = {
        Line: 'line',
        Circle: 'circle',
        Rectangle: 'rectangle',
    };

    interface ProgressIndicatorOptions {
        /** The indicator value */
        value: number;

        /** Class name to set on the element */
        class?: string;

        /** Defaults to 1 */
        max?: number;

        /** Defaults to 'Loading' */
        label?: string;

        /** Defaults to 'normal' */
        direction?: 'normal' | 'reverse';

        /** Defaults to 'auto' */
        shape?: 'auto' | 'line' | 'circle' | 'rectangle';

        /** Used to limit the number of decimals, defaults to 3 */
        precision?: number;

        enableAnimations?: boolean;

        oncomplete?: () => void;
        onchange?: (value: number) => void;
    }

    let {
        value,
        class: klass = undefined,
        max = 1,
        label = 'Busy',
        direction = 'normal',
        shape = 'auto',
        oncomplete = undefined,
        onchange = undefined,
        precision = 3,
        enableAnimations = true,
    }: ProgressIndicatorOptions = $props();

    /** Gets the rotation in radians from a transformation matrix */
    function getValuesFromTransformMatrix(cssTransformMatrix: string) {
        return cssTransformMatrix.substring(7).slice(0, -1).split(',');
    }

    /** Gets the rotation in radians from a transformation matrix */
    function getRotationFromTransformMatrix(cssTransformMatrix: string) {
        const values = getValuesFromTransformMatrix(cssTransformMatrix);
        return Math.atan2(parseFloat(values[1]), parseFloat(values[0]));
    }

    /** Gets the translation in pixels from a transformation matrix */
    function getTranslationFromTransformMatrix(cssTransformMatrix: string) {
        const values = getValuesFromTransformMatrix(cssTransformMatrix);
        return parseFloat(values[4]);
    }

    // reference to <progress> element, we need this to optionally set the value attribute
    let progressElement: HTMLElement | undefined = $state.raw(undefined);

    // reference to the active SVG page
    let animatedPath: SVGGeometryElement | undefined = $state.raw(undefined);

    // animation stores
    const progressIndiactorSpringConfig = { stiffness: 0.1, damping: 0.7, precision: 0.001 };
    const easedValue = new Spring(undefined, { precision: 0.01 }) as Spring<number | undefined>;
    const easedOffset = new Spring(0, progressIndiactorSpringConfig) as Spring<number>;

    // to determine if we switched from determinate to indeterminate or vice versa
    let wasDeterminate: boolean | undefined = $state.raw(undefined);

    // used for syncing rotation with animation state
    let spinner: HTMLElement | undefined = $state.raw(undefined);

    // calculate current value
    const flip = $derived(direction === 'reverse' ? -1 : 1);
    const hasValue = $derived(isNumber(value));
    const isDeterminate = $derived(hasValue && value !== Infinity);

    $effect(() => {
        easedValue.set(isDeterminate ? value : 0.5, { instant: !enableAnimations });
    });

    // change event
    $effect(() => {
        if (onchange && isDeterminate) {
            onchange(Math.min(value, easedValue.current as number));
        }
    });

    /** Switch between indeterminate and determinate */
    function transitionToDeterminate(
        spinnerElement: HTMLElement | SVGGeometryElement | undefined,
        indicatorShape: string
    ) {
        if (!spinnerElement) {
            return;
        }

        // current transform matrix (at animation stop time)
        const transformMatrix = getComputedStyle(spinnerElement).getPropertyValue('transform');

        // get offset from matrix so we can animate to the animation end state
        const getOffsetFromTransformMatrix =
            indicatorShape === ProgressIndicatorShape.Circle
                ? getRotationFromTransformMatrix
                : getTranslationFromTransformMatrix;
        const offset = getOffsetFromTransformMatrix(transformMatrix);

        // this syncs the offset with the animation end state
        easedOffset.set(offset, { instant: true });

        // this makes sure the line always spins forward
        let target;
        if (indicatorShape === ProgressIndicatorShape.Circle) {
            target = offset > Math.PI / 2 ? Math.PI * 4 : Math.PI * 2;
        } else {
            target = 0;
        }

        // this animates the offset to the 0 position
        easedOffset.set(target, {
            instant: !enableAnimations,
        });
    }

    function transitionToOffset(path: SVGGeometryElement | undefined) {
        if (!path) {
            return;
        }

        const offset = parseFloat(getComputedStyle(path).getPropertyValue('stroke-dashoffset'));

        // this syncs the offset with the animation end state
        easedOffset.set(offset, { instant: true });

        // this makes sure the line always spins forward
        const target = offset < 0.5 ? -1 : 0;

        // this animates the offset to the 0 position
        easedOffset.set(target, {
            instant: !enableAnimations,
        });
    }

    function calculateRectStrokeCenterOffset(size: number, borderRadius: number) {
        const r = Math.min(borderRadius, size / 2);
        const straight = 4 * (size - 2 * r);
        const arc = 2 * Math.PI * r;
        const perimeter = straight + arc;
        const distance = size / 2 - r;
        return -(distance / perimeter);
    }

    $effect(() => {
        if (isDeterminate) {
            if (wasDeterminate === false) {
                if (computedShape === ProgressIndicatorShape.Rectangle) {
                    transitionToOffset(animatedPath);
                } else {
                    transitionToDeterminate(
                        computedShape === ProgressIndicatorShape.Circle
                            ? (spinner as HTMLElement)
                            : animatedPath,
                        computedShape
                    );
                }
            }
            wasDeterminate = true;
        } else {
            wasDeterminate = false;
        }
    });

    // update progress element value
    const attributeValue = $derived(
        isDeterminate ? clamp(easedValue.current as number, 0, max) : undefined
    ) as number;
    $effect(() => {
        if (!progressElement) {
            return;
        }
        if (isDeterminate) {
            progressElement.setAttribute('value', attributeValue.toFixed(precision));
        } else {
            progressElement.removeAttribute('value');
        }
    });

    $effect(() => {
        oncomplete && maybeDispatchComplete(value, easedValue.current as number);
    });

    /** Calls oncomplete callback when ready */
    function maybeDispatchComplete(currentProgress: number, progressClamped: number) {
        if (currentProgress < 1 || Math.round(progressClamped) < max) {
            return;
        }
        oncomplete?.();
    }

    // we need to know the progress bar width to determine the circumreference which we'll use for the dash array
    let root = $state.raw(undefined);
    const computedStyle: CSSStyleDeclaration = $derived(
        root ? getComputedStyle(root) : undefined
    ) as CSSStyleDeclaration;
    const didComputeStyle = $derived(!!computedStyle);
    const size = $derived(
        didComputeStyle ? parseFloat(computedStyle.getPropertyValue('height')) : undefined
    );
    const borderRadius = $derived(
        didComputeStyle ? parseFloat(computedStyle.getPropertyValue('border-radius')) : undefined
    );
    const strokeWidth = $derived(
        didComputeStyle ? parseFloat(computedStyle.getPropertyValue('--_stroke-width')) : undefined
    );
    const strokeCenterOffset = $derived(
        isNumber(size) && isNumber(borderRadius)
            ? calculateRectStrokeCenterOffset(size, borderRadius)
            : undefined
    );

    const computedShape = $derived.by(() => {
        if (shape !== 'auto') {
            return shape;
        }

        // wait for more data
        if (!isNumber(borderRadius) || !isNumber(size)) {
            return ProgressIndicatorShape.Circle;
        }

        // let's go with rectangle if border radius is visible
        if (borderRadius < size * 0.5) {
            return ProgressIndicatorShape.Rectangle;
        }

        return ProgressIndicatorShape.Circle;
    });

    const maskId = `mask_${getUniqueId()}`;

    // Because Safari doesn't support #mask-id we generate a dataURL
    // https://github.com/mdn/browser-compat-data/issues/26358
    const maskDataURL = $derived(
        isSafari() && size && borderRadius && strokeWidth
            ? `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' fill='black'/><rect width='${size}' height='${size}' rx='${borderRadius}' stroke='white' stroke-width='${strokeWidth * 2}'/></svg>`
            : undefined
    );

    $effect(() => {
        if (spinner && computedShape === ProgressIndicatorShape.Rectangle) {
            spinner.style.mask = maskDataURL
                ? `url("${maskDataURL}") luminance`
                : `url(#${maskId})`;
        }
    });
</script>

{#if hasValue}
    <progress-indicator class={klass} bind:this={root} shape={computedShape}>
        <progress bind:this={progressElement} aria-label={label} {max}></progress>
        <div
            bind:this={spinner}
            style:--_size={size}
            style:--_border-radius={borderRadius}
            style:--_offset={easedOffset.current?.toFixed(precision)}
            style:--_center={strokeCenterOffset}
            style:--_progress={easedValue.current?.toFixed(precision)}
            style:--_flip={flip}
        >
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                {#if computedShape === ProgressIndicatorShape.Line}
                    <rect /><rect bind:this={animatedPath} />
                {:else if size}
                    {#if computedShape === ProgressIndicatorShape.Circle}
                        <g
                            ><circle /><circle
                                pathLength="1"
                                transform={`rotate(-90) translate(-${size})`}
                            /></g
                        >
                    {:else if computedShape === ProgressIndicatorShape.Rectangle}
                        <defs>
                            <mask id={maskId}>
                                <rect width="100%" height="100%" fill="black" />
                                <rect
                                    x="0"
                                    y="0"
                                    width={size}
                                    height={size}
                                    rx={borderRadius}
                                    stroke="white"
                                />
                            </mask>
                        </defs>
                        <g><rect /><rect bind:this={animatedPath} pathLength="1" /></g>
                    {/if}
                {/if}
            </svg>
        </div>
    </progress-indicator>
{/if}
