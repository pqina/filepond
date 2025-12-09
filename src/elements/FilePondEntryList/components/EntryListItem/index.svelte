<script lang="ts">
    import { type FilePondEntry, type Vector } from '../../../../types/index.js';
    import { type Snippet } from 'svelte';
    import { setEntryContext } from '../../contexts/entryContext.js';
    import { SpringElement } from '../../../components/SpringElement/index.js';
    import { type Rect, rectCreate, rectIntersectWithRect } from '../../../../utils/rect.js';
    import { VIEWPORT_MARGIN } from '../../../attachments/measurable.js';
    import { noop } from '../../../../utils/placeholder.js';
    import { toSpaceSeparatedString } from '../../../common/string.js';

    interface EntryItemOptions {
        tag?: string;
        part?: string;
        class?: string;
        isDetached?: boolean;
        isRemoving?: boolean;
        isDraggable?: boolean;
        isDragging?: boolean;
        isLastDraggedItem?: boolean;
        translation?: Vector;
        springAnimation?: any;
        onmeasureitem: (rect: Rect) => void;
        entry: FilePondEntry;
        children: Snippet<[{ id: string; entry: FilePondEntry }]>;
    }

    let {
        tag = 'li',
        part,
        class: klass,
        isDetached = false,
        isRemoving = false,
        isDraggable = true,
        isDragging = false,
        isLastDraggedItem = false,
        translation,
        springAnimation,
        onmeasureitem,
        entry,
        children,
    }: EntryItemOptions = $props();

    // set context so children can all access current entry
    setEntryContext({
        get current() {
            return entry;
        },
    });

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

    // is a virtual item
    let isVirtual: boolean = $state(false);

    const parts = $derived(
        toSpaceSeparatedString(
            part,
            isVirtual ? 'virtualized' : undefined,
            isDragging ? 'dragged' : undefined
        )
    );

    // toggles
    function handleChangeRenderContent(shouldRenderChildren: boolean) {
        isVirtual = !shouldRenderChildren;
    }

    /** This prevents rendering items that fall outside of the viewport */
    function shouldRenderContent(rect: Rect, isDetached: boolean) {
        // no rectangles so we need to assume the content is visible
        // if the element is detached the rectangle will be positioned absolute (and as it's translated it will fall outside of the viewport) so we need to still render its contents
        if (!rect || !viewportRect || isDetached) {
            return true;
        }

        return rectIntersectWithRect(rect, viewportRect);
    }

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
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<SpringElement
    {tag}
    part={parts}
    {dataset}
    class={klass}
    inert={isRemoving}
    {...springAnimation}
    {translation}
    shouldRenderContent={(rect) => shouldRenderContent(rect, isDetached)}
    onchangerendercontent={handleChangeRenderContent}
    onelementmeasure={onmeasureitem}
>
    {@render children({ id: entry.id, entry })}
</SpringElement>
