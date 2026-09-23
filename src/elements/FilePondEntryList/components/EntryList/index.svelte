<script lang="ts">
    interface EntryListOptions {
        entries: FilePondEntry[];
        part?: string;
        enableDrag?: boolean;
        children: Snippet<
            [
                {
                    id: string;
                    index: number;
                    ariaId: string;
                    entry: FilePondEntry;
                    isPlaceholder: boolean;
                    isDetached: boolean;
                    isRemoving: boolean;
                    isDraggable: boolean;
                    isDragging: boolean;
                    isLastDraggedItem: boolean;
                    translation: Vector | null | undefined;
                    onmeasureitem: (id: string, index: number, rect: Rect) => void;
                },
            ]
        >;
    }

    import { type Snippet } from 'svelte';
    import { type FilePondEntry, type SpringOptions } from '../../../../types/index.js';
    import { type Size, sizeFromRect } from '../../../../utils/size.js';
    import { type Rect } from '../../../../utils/rect.js';
    import { SvelteMap } from 'svelte/reactivity';
    import { vectorAdd, vectorCreate, vectorEqual, type Vector } from '../../../../utils/vector.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { getDragContext } from '../../contexts/dragContext.js';
    import { getDropContext } from '../../contexts/dropContext.js';
    import { getUniqueId } from '../../../../utils/string.js';

    let { entries, part: partProp, children: item }: EntryListOptions = $props();

    // this prevents multiple updates when props are spread
    const part = $derived(partProp);

    // app context
    const appContext = getAppContext();
    const locale = $derived(appContext.locale);
    const enableDrag = $derived(appContext.enableDrag);
    const updateEntryPlaceholderRect = $derived(appContext.updateEntryPlaceholderRect);

    // current drag state
    const dragContext = getDragContext();
    const dragState = $derived(dragContext.current);
    const dragStateIndex = $derived(dragState ? dragState.index : -1);
    const dragStateId = $derived(dragState ? dragState.id : null);
    const dragStateIsOutside = $derived(dragState ? dragState.outside : false);
    const hasDragState = $derived(!!dragState);

    // current drop state
    const dropContext = getDropContext();
    const dropState = $derived(dropContext.current);
    const dropStateId = $derived(dropState ? dropState.id : null);
    const dropStateRemove = $derived(dropState ? dropState.remove : null);

    // We use this so when we stop dragging we can still set a higher z-index to the last dragged item, this makes sure that when it animates into place it's still positioned on top of the other elements
    let lastDraggedItemId = $state.raw();
    $effect(() => {
        // not dragging
        if (!hasDragState) {
            return;
        }

        // no entry found with drag index
        const entry = entries[dragStateIndex];
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
        if (!hasDragState) {
            elementDragStartRect = undefined;
            return;
        }

        // don't update while we have a start rect
        if (elementDragStartRect) {
            return;
        }

        // started dragging, let's find the start rect
        const entry = entries[dragStateIndex];
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

    /** Retains the last drag translation so we can use it when shattering items */
    let lastDragTranslation: Vector | null = null;

    const computedDragTranslation = $derived.by(() => {
        const entry = entries.find((_, index) => {
            return dragStateIndex === index;
        });

        if (!entry) {
            return;
        }

        const id = entry.id;
        const isRemoving = !!isRetainedEntry(id);
        const isTranslating = dragState?.translation;
        const isPlaceholder = id === dragStateId;
        const didDissolve = isRemoving && dropStateRemove && id === dropStateId;

        // get stored index and rect for this entry
        let { rect: elementRect } = elementRects.get(id) ?? {};

        const hasElementRect = elementRect !== undefined;
        const hasElementStartRect = elementDragStartRect !== undefined;

        let dragTranslation: Vector | undefined = undefined;
        if (isTranslating && !isPlaceholder && hasElementRect && hasElementStartRect) {
            // busy with, elementRect changes when dragging
            dragTranslation = getEntryTranslation(
                elementDragStartRect as Rect,
                elementRect,
                dragState.offset as Vector,
                dragState.translation as Vector
            );

            // adjust for parent offset
            dragTranslation = vectorAdd(dragTranslation, dragState.parentTranslation as Vector);

            // we retain last translation so dissolving element stays in place
            lastDragTranslation = { ...dragTranslation };
        }

        // is dissolving so fix translation
        else if (didDissolve && lastDragTranslation) {
            dragTranslation = { ...lastDragTranslation };
        }

        return dragTranslation;
    });

    // this holds generated computed list items
    const entryStateCache = new WeakMap();

    // compute entry visual locations
    const computedList: { entries: any[]; detachedItemSize: Size | null } = $derived.by(() => {
        /**
         * Size of currently detached item, we need this to make sure it keeps its size when being positioned absolute
         */
        let detachedItemSize = null;

        const res = entries.map((entry, index) => {
            // id ref
            const id = entry.id;

            // for now always run this
            const isDragging = index === dragStateIndex;
            const isRemoving = !!isRetainedEntry(id);
            const didDissolve = isRemoving && dropStateRemove && id === dropStateId;
            const isDetached = (isDragging && dragStateIsOutside) || didDissolve;

            // determine detached item size
            let { rect: elementRect } = elementRects.get(id) ?? {};
            if (elementRect && isDetached) {
                detachedItemSize = sizeFromRect(<Rect>elementRect);
            }

            // get from cache
            if (entryStateCache.has(entry)) {
                return entryStateCache.get(entry);
            }

            const entryState = {
                id,
                ariaId: `entry-${id}`,
                entry,
            };

            entryStateCache.set(entry, entryState);

            return entryState;

            // update measure callbacks
            // const measureCallback = entryMeasureMap.get(entry);
            // console.log(measureCallback);
            // if (!measureCallback || measureCallback.index !== index) {
            //     entryMeasureMap.set(entry, {
            //         index,
            //         fn: (rect?: Rect) => {
            //             if (entry.id === dragStateId) {
            //                 updateEntryPlaceholderRect(rect);
            //             } else if (rect) {
            //                 updateElementRects(entry.id, index, rect);
            //             }
            //         },
            //     });
            // }

            // const isDragging = index === dragStateIndex;
            // const isTranslating = dragState?.translation;
            // const isRemoving = !!isRetainedEntry(id);
            // const isPlaceholder = id === dragStateId;
            // const isLastDraggedItem = lastDraggedItemId === id;
            // const didDissolve = isRemoving && dropState?.remove && id === dropState?.id;
            // const isDetached = (isDragging && dragStateIsOutside) || didDissolve;

            // let translation;

            // get stored index and rect for this entry
            // let { rect: elementRect } = elementRects.get(id) ?? {};

            // if we have a rect and are dragging this item calculate element translation
            /*
            const hasElementRect = elementRect !== undefined;
            const hasElementStartRect = elementDragStartRect !== undefined;
            let dragTranslation: Vector | undefined = undefined;

            if (
                isDragging &&
                isTranslating &&
                !isPlaceholder &&
                hasElementRect &&
                hasElementStartRect
            ) {
                // busy with, elementRect changes when dragging
                dragTranslation = getEntryTranslation(
                    elementDragStartRect as Rect,
                    elementRect,
                    dragState.offset as Vector,
                    dragState.translation as Vector
                );

                // adjust for parent offset
                dragTranslation = vectorAdd(dragTranslation, dragState.parentTranslation as Vector);

                // we retain last translation so dissolving element stays in place
                lastDragTranslation = { ...dragTranslation };
            }

            // is dissolving so fix translation
            else if (didDissolve && lastDragTranslation) {
                dragTranslation = { ...lastDragTranslation };
            }
             */

            // we need to know the size of the item so we can keep it the same size when it's detached, additionally this allows us to pad the end of the list so it doesn't affect the scroll of the parent
            // if (isDetached) {
            //     detachedItemSize = sizeFromRect(elementRect as Rect);
            // }

            // get animation if visible
            // const animation = getEntryAnimationProps(entry, entryAnimationProps);

            // // let translation = dragTranslation;
            // let springAnimation = EMPTY_SPRING_ANIMATION;
            // if (animation !== EMPTY_SPRING_ANIMATION) {
            //     // translation = animation.translation ?? dragTranslation;
            //     translation = animation.translation;
            //     const {
            //         // filter out
            //         translation: ignoredTranslation,
            //         onspringcancel: ignoredSpringCancel,

            //         // capture rest of props
            //         ...animatedProps
            //     } = animation;
            //     // @ts-ignore
            //     springAnimation = animatedProps;
            // }

            // const res = {
            //     id,
            //     ariaId: `entry-${id}`,
            //     entry,
            //     // isPlaceholder,
            //     // isLastDraggedItem,
            //     // isRemoving,
            //     // isDetached,
            //     // isDragging,
            //     // springAnimation,
            //     // translation,
            //     // onmeasureitem(rect?: Rect) {
            //     //     if (isPlaceholder) {
            //     //         updateEntryPlaceholderRect(rect);
            //     //     } else if (rect) {
            //     //         updateElementRects(id, index, rect);
            //     //     }
            //     // },
            // };

            // entryStateCache.set(entry, res);

            // return res;
        });

        return {
            entries: res,
            detachedItemSize,
        };
    });

    // to get item gap
    let root: HTMLElement | undefined = $state.raw(undefined);
    const isDragInteraction = $derived(dragStateIndex > -1);
    const computedStyle: CSSStyleDeclaration = $derived(
        root && isDragInteraction ? getComputedStyle(root) : undefined
    ) as CSSStyleDeclaration;
    const didComputeStyle = $derived(!!computedStyle);
    const itemGap = $derived(
        didComputeStyle ? parseFloat(computedStyle.getPropertyValue('gap')) : 0
    );

    // aria
    const ariaDragDescriptionId = `aria-drag-description-${getUniqueId()}`;

    // detached entry size (this is a bit hacky, it won't work correctly with a grid of items, we need to calculate this differently, perhaps we need to track container height before moving out of the list)
    const styleDetachedEntrySpacing = $derived(
        computedList.detachedItemSize
            ? `${computedList.detachedItemSize?.height + (computedList.entries.length > 1 ? itemGap : 0)}px`
            : null
    );

    const styleDetachedEntryWidth = $derived(
        computedList.detachedItemSize ? `${computedList.detachedItemSize?.width}px` : null
    );

    const styleDetachedEntryHeight = $derived(
        computedList.detachedItemSize ? `${computedList.detachedItemSize?.height}px` : null
    );

    // handle item measuring
    function handleMeasureItem(id: string, index: number, rect?: Rect) {
        if (id === dragStateId) {
            updateEntryPlaceholderRect(rect);
            return;
        }

        if (rect) {
            updateElementRects(id, index, rect);
            return;
        }

        // clear placeholder rect
        updateEntryPlaceholderRect();
    }
</script>

{#if computedList.entries.length}
    <ul
        bind:this={root}
        role="list"
        class="entry-list"
        style:--_detached-entry-spacing={styleDetachedEntrySpacing}
        style:--_detached-entry-width={styleDetachedEntryWidth}
        style:--_detached-entry-height={styleDetachedEntryHeight}
        aria-describedby={ariaDragDescriptionId}
        {part}
    >
        {#each computedList.entries as { id, ariaId, entry }, index (id)}
            {@const isDragging = index === dragStateIndex}
            {@const isRemoving = !!isRetainedEntry(id)}
            {@const didDissolve = !!(isRemoving && dropStateRemove && id === dropStateId)}
            {@const isDetached = (isDragging && dragStateIsOutside) || didDissolve}
            {@const isLastDraggedItem = lastDraggedItemId === id}
            {@const isPlaceholder = id === dragStateId}

            {@render item({
                // shared
                id,
                index,

                // only used to determine if we should render placeholder
                isPlaceholder,

                // for actual item
                entry,
                ariaId,
                isDraggable: enableDrag,
                isDetached,
                isRemoving,
                isDragging,
                isLastDraggedItem,
                translation: isDragging
                    ? computedDragTranslation
                    : didDissolve
                      ? lastDragTranslation
                      : undefined,
                onmeasureitem: handleMeasureItem,
            })}
        {/each}
    </ul>
    <div id={ariaDragDescriptionId} class="implicit">{locale.ariaDragDescription}</div>
{/if}
