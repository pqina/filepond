<script lang="ts">
    interface EntryListOptions {
        entries: FilePondEntry[];
        part?: string;
        children: Snippet<
            [
                {
                    entry: FilePondEntry;
                    isPlaceholder: boolean;
                    isDetached: boolean;
                    isRemoving: boolean;
                    isDraggable: boolean;
                    isDragging: boolean;
                    isLastDraggedItem: boolean;
                    springAnimation: EntrySpringAnimation;
                    translation: Vector;
                    onmeasureitem: (rect: Rect) => void;
                },
            ]
        >;
    }

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

    import { type Snippet } from 'svelte';
    import { type FilePondEntry, type SpringOptions } from '../../../../types/index.js';
    import { type Size, sizeFromRect } from '../../../../utils/size.js';
    import { type Rect } from '../../../../utils/rect.js';
    import { SvelteMap } from 'svelte/reactivity';
    import { vectorAdd, vectorCreate, type Vector } from '../../../../utils/vector.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { getDragContext } from '../../contexts/dragContext.js';
    import { getDropContext } from '../../contexts/dropContext.js';
    import { isNumber } from '../../../../utils/test.js';
    import { noop } from '../../../../utils/placeholder.js';

    let { entries, part, children: item }: EntryListOptions = $props();

    // app context
    const appContext = getAppContext();
    const animatedEntries = $derived(appContext.animatedEntries);
    const { updateEntryPlaceholderRect, entryAnimationProps } = getAppContext();

    // current drag state
    const dragContext = getDragContext();
    const dragState = $derived(dragContext.current);

    // current drop state
    const dropContext = getDropContext();
    const dropState = $derived(dropContext.current);

    // We use this so when we stop dragging we can still set a higher z-index to the last dragged item, this makes sure that when it animates into place it's still positioned on top of the other elements
    let lastDraggedItemId = $state.raw();
    $effect(() => {
        // not dragging
        if (!dragState) {
            return;
        }

        // no entry found with drag index
        const entry = entries[dragState.index];
        if (!entry) {
            return;
        }

        // update last dragged item with current item being dragged
        lastDraggedItemId = entry.id;
    });

    function isRetainedEntry(id: string) {
        return appContext.retainedEntries.find(({ entry }) => entry.id === id);
    }

    // We store all rectangles so we can know where elements are when a drag operation starts
    const elementRects: SvelteMap<string, { index: number; rect: Rect }> = $state(new SvelteMap());

    /** Stores all element rects so we can calculate new element positions when they're dragged */
    function updateElementRects(id: string, index: number, rect: Rect) {
        elementRects.set(id, { index, rect });
    }

    // We use this to calculate the correct drag offset
    let elementDragStartRect: Rect | undefined = $state.raw(undefined);
    $effect(() => {
        // not dragging, reset start rect
        if (!dragState) {
            elementDragStartRect = undefined;
            return;
        }

        // don't update while we have a start rect
        if (elementDragStartRect) {
            return;
        }

        // started dragging, let's find the start rect
        const entry = entries[dragState.index];
        if (!entry) {
            return;
        }

        // get rect
        const { rect } = elementRects.get(entry.id) ?? {};
        if (!rect) {
            return;
        }

        // copy rect
        elementDragStartRect = { ...rect };
    });

    function getEntryTranslation(
        initialRect: Rect,
        currentRect: Rect,
        dragOffset: Vector,
        dragTranslation: Vector
    ): Vector {
        // offset within element
        const sizeOffset = vectorCreate(
            initialRect.width > 0
                ? (dragOffset.x / initialRect.width) *
                      ((elementDragStartRect as Rect).width - currentRect.width)
                : 0,
            initialRect.height > 0
                ? (dragOffset.y / initialRect.height) * (initialRect.height - currentRect.height)
                : 0
        );

        // Adjust element position
        return vectorCreate(
            dragTranslation.x + (initialRect.x - currentRect.x) + sizeOffset.x,
            dragTranslation.y + (initialRect.y - currentRect.y) + sizeOffset.y
        );
    }

    function getEntryAnimationProps(
        entry: FilePondEntry,
        animationPropsConfig: any
    ): EntrySpringAnimation {
        // is there an animation we need to run for this element
        const { animation, delayed, oncancel, oncomplete } = animatedEntries[entry.id] ?? {};

        if (!animationPropsConfig[animation]) {
            return {
                onspringcancel: noop,
                onspringcomplete: noop,
            };
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
        } = animationPropsConfig[animation];

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

    /** Retains the last drag translation so we can use it when shattering items */
    let lastDragTranslation: Vector | null = null;

    // compute entry visual locations
    const computedList: { entries: any[]; detachedItemSize: Size | null } = $derived.by(() => {
        /**
         * Size of currently detached item, we need this to make sure it keeps its size when being positioned absolute
         */
        let detachedItemSize = null;

        const res = entries.map((entry, index) => {
            const id = entry.id;
            const isDragging = index === dragState?.index;
            const isRemoving = !!isRetainedEntry(id);
            const isPlaceholder = dragState?.id === id;
            const isLastDraggedItem = lastDraggedItemId === id;
            const didDissolve = isRemoving && dropState?.remove && id === dropState?.id;
            const isDetached = (isDragging && dragState?.outside) || didDissolve;

            // get stored index and rect for this entry
            let { rect: elementRect } = elementRects.get(id) ?? {};

            const hasElementRect = elementRect !== undefined;
            const hasElementStartRect = elementDragStartRect !== undefined;

            // if we have a rect and are dragging this item calculate element translation
            let dragTranslation: Vector | undefined = undefined;
            if (isDragging && !isPlaceholder && hasElementRect && hasElementStartRect) {
                // busy with, elementRect changes when dragging
                dragTranslation = getEntryTranslation(
                    elementDragStartRect as Rect,
                    elementRect,
                    dragState.offset,
                    dragState.translation
                );

                // adjust for parent offset
                dragTranslation = vectorAdd(dragTranslation, dragState.parentTranslation);

                // we retain last translation so dissolving element stays in place
                lastDragTranslation = { ...dragTranslation };
            }

            // is dissolving so fix translation
            else if (didDissolve && lastDragTranslation) {
                dragTranslation = { ...lastDragTranslation };
            }

            // we need to know the size of the item so we can keep it the same size when it's detached, additionally this allows us to pad the end of the list so it doesn't affect the scroll of the parent
            if (isDetached) {
                detachedItemSize = sizeFromRect(elementRect as Rect);
            }

            // get animation if visible
            const {
                translation = dragTranslation,

                // filter out
                onspringcancel,

                // capture rest of props
                ...springAnimation
            } = getEntryAnimationProps(entry, entryAnimationProps) ?? {};

            return {
                id,
                entry,
                isPlaceholder,
                isRemoving,
                isDetached,
                isDragging,
                isLastDraggedItem,
                springAnimation,
                translation,
                onmeasureitem(rect?: Rect) {
                    if (isPlaceholder) {
                        updateEntryPlaceholderRect(rect);
                    } else if (rect) {
                        updateElementRects(id, index, rect);
                    }
                },
            };
        });

        return {
            entries: res,
            detachedItemSize,
        };
    });

    // to get item gap
    let root: HTMLElement | undefined = $state.raw(undefined);
    const isDragging = $derived(dragState?.index);
    const computedStyle: CSSStyleDeclaration = $derived(
        root && isDragging ? getComputedStyle(root) : undefined
    ) as CSSStyleDeclaration;
    const didComputeStyle = $derived(!!computedStyle);
    const itemGap = $derived(
        didComputeStyle ? parseFloat(computedStyle.getPropertyValue('gap')) : 0
    );
</script>

{#if computedList.entries.length}
    <ul
        bind:this={root}
        class="entry-list"
        {part}
        style:--_detached-entry-spacing={computedList.detachedItemSize
            ? `${computedList.detachedItemSize?.height + itemGap}px`
            : null}
        style:--_detached-entry-width={computedList.detachedItemSize
            ? `${computedList.detachedItemSize?.width}px`
            : null}
        style:--_detached-entry-height={computedList.detachedItemSize
            ? `${computedList.detachedItemSize?.height}px`
            : null}
    >
        {#each computedList.entries as { id, isPlaceholder, isDetached, isRemoving, isDragging, isLastDraggedItem, springAnimation, translation, onmeasureitem, entry } (id)}
            {@render item({
                isDraggable: true,
                isPlaceholder,
                isDetached,
                isRemoving,
                isDragging,
                isLastDraggedItem,
                springAnimation,
                translation,
                onmeasureitem,
                entry,
            })}
        {/each}
    </ul>
{/if}
