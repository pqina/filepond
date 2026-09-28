<script lang="ts">
    import { type FilePondEntry, type SpringOptions } from '../../../../types/index.js';
    import { untrack, type Snippet } from 'svelte';
    import type { Vector } from '../../../../utils/vector.js';
    import { type Rect, rectCreate, rectIntersectWithRect } from '../../../../utils/rect.js';
    import { setEntryContext } from '../../contexts/entryContext.js';
    import { SpringElement } from '../../../components/SpringElement/index.js';
    import { toSpaceSeparatedString } from '../../../common/string.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { VIEWPORT_MARGIN } from '../../../attachments/measurable.js';
    import { noop } from '../../../../utils/placeholder.js';
    import { isNumber } from '../../../../utils/test.js';

    interface EntrySpringAnimation {
        opacityFrom?: number;
        opacity?: number;
        opacitySpringOptions?: SpringOptions;
        scaleFrom?: number;
        scale?: number;
        scaleSpringOptions?: SpringOptions;
        translationFrom?: Vector;
        translation?: Vector;
        translationSpringOptions?: SpringOptions;
        onspringcancel?: () => void;
        onspringcomplete?: (spring: { opacity: number; scale: number }) => void;
    }

    interface EntryItemOptions {
        id: string;
        index: number;
        tag?: string;
        part?: string;
        class?: string;
        isDetached?: boolean;
        isRemoving?: boolean;
        isDraggable?: boolean;
        isDragging?: boolean;
        isLastDraggedItem?: boolean;
        translation?: Vector | undefined;
        springAnimation?: any;
        onmeasureitem: (id: string, index: number, rect: Rect) => void;
        entry: FilePondEntry;
        ariaDescribedby: string;
        children: Snippet<[{ id: string; entry: FilePondEntry }]>;
    }

    let {
        id,
        index,
        tag = 'li',
        part,
        class: klass,
        isDetached: isDetachedProp = false,
        isRemoving: isRemovingProp = false,
        isDraggable: isDraggableProp = true,
        isDragging: isDraggingProp = false,
        isLastDraggedItem: isLastDraggedItemProp = false,
        translation,
        onmeasureitem,
        entry: entryProp,
        ariaDescribedby: ariaDescribedbyProp,
        children,
    }: EntryItemOptions = $props();

    // optimise calls, as NodeList spreads option on this component this makes sure it doesn't run too many updates
    const isLastDraggedItem = $derived(isLastDraggedItemProp);
    const isDragging = $derived(isDraggingProp);
    const isDetached = $derived(isDetachedProp);
    const isRemoving = $derived(isRemovingProp);
    const isDraggable = $derived(isDraggableProp);
    const ariaDescribedby = $derived(ariaDescribedbyProp);
    const entry = $derived(entryProp);

    // run entry animations
    const { animatedEntries, entryAnimationProps } = $derived(getAppContext());

    export const EMPTY_ENTRY_ANIMATION = Object.freeze({
        onspringcancel: noop,
        onspringcomplete: noop,
    });

    function getEntryAnimationProps(entry: FilePondEntry): EntrySpringAnimation {
        // is there an animation we need to run for this element
        const { animation, delayed, oncancel, oncomplete } = animatedEntries[entry.id] ?? {};

        if (!entryAnimationProps[animation]) {
            return EMPTY_ENTRY_ANIMATION;
        }

        const {
            scale,
            opacity,
            translation,
            opacityFrom,
            scaleFrom,
            translationFrom,
            translationSpringOptions,
            scaleSpringOptions,
            opacitySpringOptions,
        } = entryAnimationProps[animation];

        // base spring
        const spring: EntrySpringAnimation = {
            scale: undefined,
            opacity: undefined,
            translation: undefined,
            translationSpringOptions,
            scaleSpringOptions,
            opacitySpringOptions,
            onspringcancel() {
                oncancel();
            },
            onspringcomplete({ opacity: currentOpacity, scale: currentScale }) {
                const didCompleteOpacity = isNumber(spring.opacity)
                    ? spring.opacity === currentOpacity
                    : true;

                // we check opacity first, if we're animating to 0 we're done when we've reached it, this makes the UI a bit more snappy
                if (didCompleteOpacity && spring.opacity === 0) {
                    oncomplete();
                    return;
                }

                const didCompleteScale = isNumber(spring.scale)
                    ? spring.scale === currentScale
                    : true;

                if (didCompleteOpacity && didCompleteScale) {
                    oncomplete();
                }
            },
        };

        if (delayed) {
            return Object.assign(spring, {
                opacityFrom,
                scaleFrom,
                translationFrom,
                onspringcomplete: noop,
            });
        }

        return Object.assign(spring, {
            opacityFrom,
            scaleFrom,
            translationFrom,
            scale,
            opacity,
            translation,
        });
    }

    const springAnimation = $derived.by(() => {
        const entryAnimation = getEntryAnimationProps(entry);

        // just idling
        if (entryAnimation === EMPTY_ENTRY_ANIMATION) {
            return;
        }

        untrack(() => {
            translation = translation || entryAnimation.translation;
        });

        const {
            // not interested in these props
            translation: ignoredTranslation,
            onspringcancel: ignoredSpringCancel,

            // capture rest of props
            ...animatedProps
        } = entryAnimation;

        // @ts-ignore
        return animatedProps;
    });

    function handleElementMeasure(rect: Rect) {
        onmeasureitem(id, index, rect);
    }

    // set context so entry list child components can always access the current entry
    setEntryContext({
        get current() {
            return entry;
        },
        get ariaId() {
            return `entry-${entry.id}`;
        },
    });

    // props distributed to subtree so we can use the entry in the subtree
    const childProps = $derived({ id: entry.id, entry });

    // get app context map
    const { locale, reduceMotion, springOptions } = $derived(getAppContext());

    /** Window width used to calculate if element is visible or not */
    let windowWidth = $state.raw() as number;

    /** Window height used to calculate if element is visible or not */
    let windowHeight = $state.raw() as number;

    /**
     * Only if element is this amount outside of viewport do we count it as invisible, this is so
     * shadows are still drawn correctly, same as margin in measurable
     */
    const viewportMargin = VIEWPORT_MARGIN;
    const viewportHasSize = $derived(!!(windowWidth && windowHeight));
    const viewportRect = $derived(
        viewportHasSize
            ? rectCreate(0, -viewportMargin, windowWidth, windowHeight + viewportMargin * 2)
            : undefined
    );

    /** This prevents rendering items that fall outside of the viewport */
    function shouldRenderContent(
        rect: Rect | undefined,
        viewportRect: Rect | undefined,
        isDetached: boolean
    ) {
        // no rectangles so we need to assume the content is visible
        // if the element is detached the rectangle will be positioned absolute (and as it's translated it will fall outside of the viewport) so we need to still render its contents
        if (!rect || !viewportRect || isDetached) {
            return false;
        }

        return rectIntersectWithRect(rect, viewportRect);
    }

    // the current spring rect
    let springElementRect = $state.raw() as Rect;

    function handleElementMeasureRect(rect: Rect) {
        springElementRect = rect;
    }

    const isVirtual = $derived(!shouldRenderContent(springElementRect, viewportRect, isDetached));

    const parts = $derived(
        toSpaceSeparatedString(
            part,
            isVirtual ? 'virtualized' : undefined,
            isDragging ? 'dragging' : undefined
        )
    );

    const dataset = $derived({
        // Makes it possible to drag this item
        draggable: isDraggable ? '' : undefined,

        // Detach so doesn't take up room in list
        detached: isDetached ? '' : undefined,

        // When true will prevent hover effects on elements in subtree
        dragging: isDragging ? '' : undefined,

        // When set to true will increase z-index so renders above other items
        renderAbove: isLastDraggedItem ? '' : undefined,

        // When set to true will decrease z-index so renders below other items
        renderBelow: isRemoving ? '' : undefined,
    });

    // Related to keyboard navigation
    const attrs = $derived(
        isDraggable
            ? {
                  tabindex: 0,
                  role: 'listitem',
                  'aria-roledescription': locale.ariaItemRoleDescription as string,
                  'aria-describedby': ariaDescribedby,
              }
            : {
                  role: 'listitem',
                  'aria-describedby': ariaDescribedby,
              }
    );

    // Retain focus
    function handleRootDefined(element: HTMLElement) {
        if (!isDragging) {
            return;
        }

        element.focus({
            preventScroll: true,

            // @ts-ignore, we hide the focus ring because it looks horrible on mobile devices, when a user drags the item with keyboard interaction it should be clear from the item being lifted that the item has focus.
            focusVisible: false,
        });
    }
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<SpringElement
    {tag}
    part={parts}
    {dataset}
    {attrs}
    class={klass}
    inert={isRemoving}
    {...springAnimation}
    {translation}
    shouldRenderChildren={!isVirtual}
    onroot={handleRootDefined}
    onelementmeasure={handleElementMeasure}
    onmeasureabsoluterect={handleElementMeasureRect}
    {reduceMotion}
    {springOptions}
>
    {@render children(childProps)}
</SpringElement>
