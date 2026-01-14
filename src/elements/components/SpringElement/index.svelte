<script lang="ts">
    import type { Vector } from '../../../utils/vector.js';
    import type { Rect } from '../../../utils/rect.js';
    import type { Bounds } from '../../../utils/bounds.js';
    import type { Size } from '../../../utils/size.js';
    import type { SpringElementContext } from '../../FilePondEntryList/contexts/springElementTreeContext.js';
    import type { Snippet } from 'svelte';
    import type { SpringOptions } from '../../../types/index.js';

    interface SpringElementOptions {
        /** Defaults to 'div' */
        tag?: string;

        /** Defaults to 'div' */
        subtag?: string;

        /** Part to assign to root element */
        part?: string;

        /** Defaults to {} */
        attrs?: { [key: string]: string | boolean | number | undefined };

        /** Defaults to {} */
        subattrs?: { [key: string]: string | boolean | number | undefined };

        /** Defaults to {} */
        dataset?: { [key: string]: string | boolean | number | undefined };

        /** Defaults to {} */
        styles?: { [key: string]: string | number };

        /** Class to use on outer element */
        class?: string;

        /** Class to use on inner element */
        subclass?: string;

        /** Element translation */
        translation?: Vector;
        /** Element translation origin */
        translationFrom?: Vector;
        /** Element origin scalar */
        scaleFrom?: number;
        /** Element scalar */
        scale?: number;
        /** Element origin opacity */
        opacityFrom?: number;
        /** Element opacity */
        opacity?: number;

        /** Set to `true` if can't be interacted with */
        inert?: boolean | null;

        springDefaults?: SpringOptions;
        scaleSpringOptions?: SpringOptions;
        opacitySpringOptions?: SpringOptions;
        translationSpringOptions?: SpringOptions;

        /** Called on element measure */
        onelementmeasure?: (rect: Rect) => void;

        /** Called on root element measure */
        onmeasure?: (bounds: Bounds) => void;

        /** Called when spring animation ends */
        onspringcomplete?: (state: { opacity: number; scale: number }) => void;

        /** Called when children render state changes */
        onchangerendercontent?: (shouldRenderContent: boolean) => void;

        /** Called before rendering content */
        shouldRenderContent?: (rect: Rect) => boolean;

        /** Spring element children */
        children: Snippet<
            [
                {
                    currentSize: Size;
                    targetRect: Rect;
                    clientRect: Rect | null;
                    visualRect: Rect | null;
                },
            ]
        >;
    }

    import { onDestroy, untrack } from 'svelte';
    import {
        vectorCreate,
        vectorEqual,
        vectorFromRect,
        vectorInvert,
    } from '../../../utils/vector.js';
    import { sizeEqual, sizeFromRect } from '../../../utils/size.js';
    import {
        rectCenter,
        rectCreate,
        rectEqual,
        rectFromBounds,
        rectScale,
    } from '../../../utils/rect.js';
    import { isFunction, isNumber } from '../../../utils/test.js';
    import { Spring } from 'svelte/motion';
    import { updateDataset, updateStyles } from '../../../utils/dom.js';
    import { measurable } from '../../attachments/measurable.js';
    import { getAppContext } from '../../FilePondEntryList/contexts/appContext.js';
    import {
        getSpringElementTreeContext,
        hasSpringElementTreeContext,
        setSpringElementTreeContext,
    } from '../../FilePondEntryList/contexts/springElementTreeContext.js';
    import { noop } from '../../../utils/placeholder.js';
    import { gate } from '../../common/store.svelte.js';
    import { roundPrecision } from '../../../utils/math.js';

    let {
        springDefaults = undefined,

        tag = 'div',
        part = undefined,
        class: klass = undefined,
        attrs = undefined,
        subtag = 'div',
        subclass = undefined,
        subattrs = undefined,
        dataset = undefined,
        styles = undefined,
        inert = null,

        scaleSpringOptions = undefined,
        scaleFrom = undefined,
        scale = undefined,

        opacitySpringOptions = undefined,
        opacityFrom = undefined,
        opacity = undefined,

        translation = vectorCreate(),
        translationFrom = undefined,
        translationSpringOptions = undefined,

        onelementmeasure = undefined,
        onmeasure = undefined,
        onspringcomplete = noop,
        onchangerendercontent = undefined,
        shouldRenderContent = undefined,
        children,
    }: SpringElementOptions = $props();

    /** Should we animate items */
    const { enableAnimations } = $derived(getAppContext());

    /** Spring configuration */
    const appContext = getAppContext();
    const currentSpringOptions = $derived(springDefaults ?? appContext?.springDefaults ?? {});
    const springedPosition = new Spring(undefined) as Spring<Vector | undefined>;
    // svelte-ignore state_referenced_locally
    const springedScale = new Spring(scale || 1);
    // svelte-ignore state_referenced_locally
    const springedOpacity = new Spring(opacity || 1);

    const computedTranslationSpringOptions = gate(
        (prev: any, curr: any) => prev !== curr,
        () => translationSpringOptions
    ) as { current: SpringOptions };

    const computedScaleSpringOptions = gate(
        (prev: any, curr: any) => prev !== curr,
        () => scaleSpringOptions
    ) as { current: SpringOptions };

    const computedOpacitySpringOptions = gate(
        (prev: any, curr: any) => prev !== curr,
        () => opacitySpringOptions
    ) as { current: SpringOptions };

    $effect(() => {
        Object.assign(springedPosition, {
            ...currentSpringOptions,
            ...computedTranslationSpringOptions.current,
            precision: 0.0001,
        });
    });

    $effect(() => {
        Object.assign(springedScale, {
            ...currentSpringOptions,
            ...computedScaleSpringOptions.current,
            precision: 0.0001,
        });
    });

    $effect(() => {
        Object.assign(springedOpacity, {
            ...currentSpringOptions,
            ...computedOpacitySpringOptions.current,
            precision: 0.01,
        });
    });

    /** Set to false when an element is right aligned */
    let shouldAnimatePositionUpdate = $state(true);

    /** Root element absolute rectangle (relative to the document root) */
    let rootAbsoluteRect: Rect | null = $state.raw(null);
    let rootAbsoluteRectPrev: Rect | null = null;
    let shouldRenderChildrenPrev: boolean = true;

    const shouldRenderChildren = $derived.by(() => {
        if (!shouldRenderContent) {
            return true;
        }

        if (
            rootAbsoluteRect &&
            rootAbsoluteRectPrev &&
            rectEqual(rootAbsoluteRect, rootAbsoluteRectPrev)
        ) {
            return shouldRenderChildrenPrev;
        }

        rootAbsoluteRectPrev = { ...rootAbsoluteRect } as Rect;
        shouldRenderChildrenPrev = !!(rootAbsoluteRect && shouldRenderContent(rootAbsoluteRect));

        return shouldRenderChildrenPrev;
    });

    $effect(() => {
        onchangerendercontent?.(shouldRenderChildren);
    });

    /** Visual element absolute rectangle */
    let visualAbsoluteRect: Rect | null = $state.raw(null);

    let visualAbsoluteRectCenter: Vector | null = $state.raw(null);

    /** The root element rectangle relative to the parent */
    let rootRelativeRect = $state.raw() as Rect;

    const position = $derived(rootRelativeRect ? vectorFromRect(rootRelativeRect) : undefined);
    const size = $derived(rootRelativeRect ? sizeFromRect(rootRelativeRect) : undefined);

    /** @ts-ignore Automatically calculate spring animations for size state */
    const springedSize = new Spring(undefined) as Spring<Size>;

    $effect(() => {
        Object.assign(springedSize, currentSpringOptions);
    });

    let sizePrev: Size | null;
    $effect(() => {
        if (!size) {
            return;
        }

        if (size && sizePrev && sizeEqual(sizePrev, size)) {
            return;
        }

        springedSize.set(size, { instant: !enableAnimations });
        sizePrev = { ...size };
    });

    /**
     * The inverted rectangle position so we can place the element in the target location and then
     * transition towards it with transform
     */
    let positionPrev: Vector | null;
    let currentRelativePosition: Vector | null;
    const relativePosition = $derived.by(() => {
        if (!position) {
            return;
        }

        // no change
        if (positionPrev && position && vectorEqual(positionPrev, position)) {
            return currentRelativePosition;
        }

        // update!
        positionPrev = { ...position };
        currentRelativePosition = vectorInvert(position);
        return currentRelativePosition;
    });

    /** Is true when spring is ready to be used in calculations */
    let isReady = $state(false);

    /**
     * Current translation, this makes sure updates to translation only happen when x or y was
     * changed
     */
    const updatedTranslation = $derived(translation);
    // #region Spring Element tree, we observe child elements, when all child spring elements ready we start measuring our div slot, this prevents unwanted element origin positions

    function removeSpringElement(ctx: SpringElementContext) {
        if (!ctx.parent) {
            return;
        }

        // no longer in parent
        ctx.parent.childSpringReadyCount--;
        ctx.parent.childSpringCount--;
    }

    let childSpringCount = $state(0);
    let childSpringReadyCount = $state(0);

    /** Create spring element context for this spring instance */
    const springElementContextDefaults: SpringElementContext = {
        get isReady() {
            return isReady;
        },

        get currentRect() {
            return visualAbsoluteRect;
        },

        get currentRectCenter() {
            return visualAbsoluteRectCenter;
        },

        get targetSize() {
            return size;
        },

        get currentSize() {
            return springedSize.current;
        },

        get currentScale() {
            return (
                springedScale.current *
                (springElementContext.parent ? springElementContext.parent.currentScale : 1)
            );
        },

        get childSpringCount() {
            return childSpringCount;
        },

        set childSpringCount(value) {
            childSpringCount = value;
        },

        get childSpringReadyCount() {
            return childSpringReadyCount;
        },

        set childSpringReadyCount(value) {
            childSpringReadyCount = value;
        },

        parent: null,
    };

    // initialise tree context
    if (!hasSpringElementTreeContext()) {
        // root of the spring tree
        const springElementContext = springElementContextDefaults;
        setSpringElementTreeContext(springElementContext);
    } else {
        // get parent reference
        const springElementParentContext = getSpringElementTreeContext();

        // create our node
        const springElementContext = Object.assign(springElementContextDefaults, {
            parent: springElementParentContext,
        });

        // need to reference child
        springElementParentContext.childSpringCount++;

        // set our node
        setSpringElementTreeContext(springElementContext);
    }

    // now we have a tree
    const springElementContext = getSpringElementTreeContext();

    //#endregion

    //#region spring updaters

    /** Updates spring config to disable animation */
    const springUpdateConfig = $derived({
        instant: !enableAnimations,
    });

    // this animates the element to new positions
    function dispatchSpringEnd() {
        onspringcomplete({ opacity: springedOpacity.current, scale: springedScale.current });
    }

    // position adjusted with translation
    let translatedPositionPrev: null | Vector;
    const translatedPosition = $derived.by(() => {
        if (!shouldRenderChildren || !position) {
            return;
        }

        const computedPosition = vectorCreate(
            position.x + updatedTranslation.x,
            position.y + updatedTranslation.y
        );

        if (translatedPositionPrev && vectorEqual(translatedPositionPrev, computedPosition)) {
            return translatedPositionPrev;
        }

        translatedPositionPrev = computedPosition;
        return computedPosition;
    });

    // animated translation
    let currentTranslationFrom: Vector;
    $effect(() => {
        if (!translatedPosition) {
            return;
        }

        if (
            translationFrom &&
            (!currentTranslationFrom || !vectorEqual(translationFrom, currentTranslationFrom))
        ) {
            springedPosition.set(
                vectorCreate(
                    translatedPosition.x + translationFrom.x,
                    translatedPosition.y + translationFrom.y
                ),
                { instant: true }
            );

            // only apply once
            currentTranslationFrom = { ...translationFrom };
        }

        if (springedPosition.current && vectorEqual(springedPosition.current, translatedPosition)) {
            // no change
            return;
        }

        springedPosition.set(translatedPosition, {
            instant: springUpdateConfig.instant || !shouldAnimatePositionUpdate,
        });
    });

    // svelte-ignore state_referenced_locally
    if (isNumber(scale) && scale === springedScale.current && scale !== 1) {
        dispatchSpringEnd();
    }

    let currentScaleFrom: number;
    $effect(() => {
        if (!shouldRenderChildren) {
            return;
        }

        // set scale from if defined
        if (isNumber(scaleFrom) && scaleFrom !== currentScaleFrom) {
            springedScale.set(scaleFrom, { instant: true });

            // only apply once
            currentScaleFrom = scaleFrom;
        }

        // don't update if no change
        if (!isNumber(scale) || springedScale.target === scale) {
            return;
        }

        springedScale
            .set(scale, springUpdateConfig)
            .then(() => {
                untrack(() => {
                    dispatchSpringEnd();
                });
            })
            .catch(noop);
    });

    // svelte-ignore state_referenced_locally
    if (isNumber(opacity) && opacity === springedOpacity.current && opacity !== 1) {
        dispatchSpringEnd();
    }

    // the opacity of the element
    let currentOpacityFrom: number;
    $effect(() => {
        if (!shouldRenderChildren) {
            return;
        }

        // set opacity from if defined
        if (isNumber(opacityFrom) && opacityFrom !== currentOpacityFrom) {
            springedOpacity.set(opacityFrom, { instant: true });

            // only apply once
            currentOpacityFrom = opacityFrom;
        }

        // don't update if no change
        if (!isNumber(opacity) || springedOpacity.target === opacity) {
            return;
        }

        springedOpacity
            .set(opacity, springUpdateConfig)
            .then(() => {
                untrack(() => {
                    dispatchSpringEnd();
                });
            })
            .catch(noop);
    });

    //#endregion

    // we need to know if a parent rectangle has been defined, else we wait with adding elements until it is
    const parentAbsoluteRect = $derived.by(() => {
        const currentRect = springElementContext.parent?.currentRect;
        if (!currentRect) {
            return rectCreate();
        }
        return currentRect;
    }) as Rect;

    let hasParentCalculatedRect = $derived(!!parentAbsoluteRect);

    const hasChildSprings = $derived(springElementContext.childSpringCount > 0);

    // we need to wait till current rectangle is defined, when it is, we mark the element as ready so parents can start measuring
    const didComputeVisualRect = $derived(!!visualAbsoluteRect || !hasChildSprings);
    $effect(() => {
        // don't run if no rect or already ready
        if (!didComputeVisualRect) {
            return;
        }

        // already ready, can't be more ready
        if (isReady) {
            return;
        }

        // i'm ready
        isReady = true;

        if (!springElementContext.parent) {
            return;
        }

        // update ready count
        springElementContext.parent.childSpringReadyCount++;
    });

    /**
     * Wait until child elements have been have computed their visual rectangles, then compute own
     * rectangle
     */
    let canMeasure = $state(false);
    $effect(() => {
        if (canMeasure) {
            return;
        }

        canMeasure =
            springElementContext.childSpringCount === springElementContext.childSpringReadyCount;
    });

    const parentScale = $derived(
        springElementContext.parent ? springElementContext.parent.currentScale : 1
    );

    /** Sync rectangle */
    function handleMeasure(bounds: Bounds) {
        // bounds to rect
        const measuredRect = rectFromBounds(bounds);

        // ignore zero width rectangles
        if (measuredRect.width <= 0 || measuredRect.height <= 0) {
            return;
        }

        // bubble
        if (isReady && onmeasure) {
            onmeasure(bounds);
        }

        // need to scale measured rectangle from center point of parent rectangle before creating the relative rectangle
        const parentAbsoluteCenter =
            springElementContext.parent?.currentRectCenter || vectorCreate();
        rootAbsoluteRect = rectScale(measuredRect, 1 / parentScale, parentAbsoluteCenter);

        // create a relative rectangle so we translate in relative context
        const updatedRootRelativeRect = rectCreate(
            rootAbsoluteRect.x - parentAbsoluteRect.x,
            rootAbsoluteRect.y - parentAbsoluteRect.y,
            rootAbsoluteRect.width,
            rootAbsoluteRect.height
        );

        // probably don't need that much precision
        updatedRootRelativeRect.x = roundPrecision(updatedRootRelativeRect.x, 5);
        updatedRootRelativeRect.y = roundPrecision(updatedRootRelativeRect.y, 5);
        updatedRootRelativeRect.width = roundPrecision(updatedRootRelativeRect.width, 5);
        updatedRootRelativeRect.height = roundPrecision(updatedRootRelativeRect.height, 5);

        // this handles position animation of right aligned elements
        if (rootRelativeRect) {
            const previousWidth = rootRelativeRect.width;
            const currentWidth = updatedRootRelativeRect.width;
            const widthDist = Math.abs(previousWidth - currentWidth);

            const previousRight = rootRelativeRect.x + rootRelativeRect.width;
            const measuredRight = updatedRootRelativeRect.x + updatedRootRelativeRect.width;
            const rightDist = Math.abs(previousRight - measuredRight);

            shouldAnimatePositionUpdate = !(rightDist < 0.0001 && widthDist > 0.0001);
        }

        // make sure we only update on changes
        if (rootRelativeRect && rectEqual(rootRelativeRect, updatedRootRelativeRect)) {
            return;
        }

        // update my rectangle
        rootRelativeRect = { ...updatedRootRelativeRect };

        // did measure element
        if (isFunction(onelementmeasure)) {
            onelementmeasure({ ...rootRelativeRect });
        }
    }

    /** Sync context rectangle */
    function handleMeasureContext(bounds: Bounds) {
        const measuredRect = rectFromBounds(bounds);

        // scale context rectangle according to current scalar
        visualAbsoluteRect = rectScale(measuredRect, 1 / springElementContext.currentScale);

        // need center for other calculations
        visualAbsoluteRectCenter = rectCenter(visualAbsoluteRect);
    }

    //#region calculate styles

    const isTransforming = $derived.by(() => {
        if (
            !shouldRenderChildren ||
            !relativePosition ||
            !springedPosition.current ||
            !springedSize.current
        ) {
            return false;
        }

        return (
            // not yet at target position
            springedPosition.current.x + relativePosition.x !== 0 ||
            springedPosition.current.y + relativePosition.y !== 0 ||
            // not yet at taget size
            springedSize.current.width !== (size as Size).width ||
            springedSize.current.height !== (size as Size).height ||
            // not yet at target scale
            springedScale.current !== 1
        );
    });

    // if is not visible set visibility to hidden, if is visible and we're transforming apply transform
    const shouldStyle = $derived(isTransforming);
    const stylePosition = $derived(shouldStyle ? 'relative' : null);
    const styleLeft = $derived(shouldStyle ? `${(relativePosition as Vector).x}px` : null);
    const styleTop = $derived(shouldStyle ? `${(relativePosition as Vector).y}px` : null);
    const styleTransformOrigin = $derived(shouldStyle ? 'center' : null);
    const styleOpacity = $derived(
        isNumber(springedOpacity.current) && springedOpacity.current < 1
            ? springedOpacity.current
            : null
    );

    // so we can animate position (transform-origin is center so scale animates nicely)
    const styleTransform = $derived(
        shouldStyle
            ? `translate3d(${springedPosition.current?.x}px,${springedPosition.current?.y}px,0)scale(${springedScale.current})`
            : null
    );

    // we retain the size for when the item is virtualized
    let virtualSize: Size | undefined = $state.raw();
    $effect(() => {
        if (!shouldRenderChildren || !rootAbsoluteRect) {
            // sometimes the visual absolute rect has already been calculated, if so we'll use that
            if (visualAbsoluteRect) {
                virtualSize = sizeFromRect(visualAbsoluteRect);
            }
            return;
        }

        virtualSize = sizeFromRect(rootAbsoluteRect);
    });

    /** Rootelement reference */
    let root: HTMLElement = $state.raw() as HTMLElement;
    $effect(() => {
        if (!root || !shouldRenderChildren || !dataset) {
            return;
        }
        updateDataset(root, dataset);
    });

    $effect(() => {
        if (!root || !shouldRenderChildren || !styles) {
            return;
        }
        updateStyles(root, styles);
    });

    //#endregion
    onDestroy(() => {
        removeSpringElement(springElementContext);
    });
</script>

<!-- If there's a parent rectangle we wait until it's set, it's important the parent rectangle is added first for the rectangles and measurements to all correctly update in order -->
{#if hasParentCalculatedRect}
    <svelte:element
        this={tag}
        bind:this={root}
        class={klass}
        {part}
        style:contain={'layout'}
        style:height={shouldRenderChildren ? undefined : `${virtualSize?.height}px`}
        style:opacity={shouldRenderChildren ? undefined : opacityFrom}
        {...attrs}
        {inert}
        {@attach measurable({
            disabled: !canMeasure,
            onmeasure: handleMeasure,
        })}
    >
        {#if shouldRenderChildren}
            <svelte:element
                this={subtag}
                class={subclass}
                style:position={stylePosition}
                style:left={styleLeft}
                style:top={styleTop}
                style:transformOrigin={styleTransformOrigin}
                style:transform={styleTransform}
                style:opacity={styleOpacity}
                style:height={'100%'}
                style:max-height={'inherit'}
                {...subattrs}
                {@attach measurable({ onmeasure: handleMeasureContext })}
            >
                {@render children({
                    currentSize: springedSize.current,
                    targetRect: rootRelativeRect,
                    clientRect: visualAbsoluteRect,
                    //@ts-ignore
                    visualRect:
                        // TODO: this is probably incorrect, the visual rect isn't always available, and the springed size isn't scaled to parent
                        visualAbsoluteRect !== null
                            ? {
                                  ...visualAbsoluteRect,
                                  ...springedSize.current,
                              }
                            : {
                                  ...springedSize.current,
                              },
                })}
            </svelte:element>
        {/if}
    </svelte:element>
{/if}
