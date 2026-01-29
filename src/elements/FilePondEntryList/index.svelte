<script lang="ts">
    import type { FilePondEntry, FilePondEntrySource, Vector } from '../../types/index.js';
    import type { DragEventDetail } from '../attachments/dragarea.js';
    import type { DropEventDetail } from '../attachments/droparea.js';
    import type {
        DragInteraction,
        AnimatedEntry,
        AppCallbacks,
        DragState,
        DropState,
    } from './index.js';
    import type { TemplateNode } from '../common/nodeTree.js';
    import type { Needle, FilePondEntryListOptions } from '../../types/index.js';
    import { type Bounds } from '../../utils/bounds.js';

    import { untrack } from 'svelte';
    import { dragarea } from '../attachments/dragarea.js';
    import { droparea } from '../attachments/droparea.js';
    import { arrayInsertAtIndex, arrayMove } from '../../utils/array.js';
    import {
        ORIGIN,
        vectorAdd,
        vectorCreate,
        vectorEqual,
        vectorSubtract,
    } from '../../utils/vector.js';
    import {
        type Rect,
        rectCenter,
        rectContainsPoint,
        rectFromBounds,
        rectPad,
    } from '../../utils/rect.js';
    import { noop, passthrough } from '../../utils/placeholder.js';
    import { measurable } from '../attachments/measurable.js';
    import { setBooleanAttribute } from '../../utils/dom.js';
    import {
        computeAnimationPreference,
        getGlobalPreventAnimations,
        getShouldReduceMotion,
    } from '../common/animationPreference.svelte.js';
    import { setAppContext } from './contexts/appContext.js';
    import { setDragContext } from './contexts/dragContext.js';
    import { setDropContext } from './contexts/dropContext.js';
    import { getUniqueId } from '../../utils/string.js';
    import { dispatchCustomEvent } from '../../utils/dom.js';
    import { setSpringElementTreeContext } from './contexts/springElementTreeContext.js';
    import { sizeFromRect, type Size } from '../../utils/size.js';
    import { isNumber } from '../../utils/test.js';

    import { NodeList } from '../components/NodeList/index.js';
    import { hasOwnProp } from '../../utils/object.js';
    import { getDragTargetIndex, getDropTargetIndex } from '../common/dragDrop.js';

    let {
        disabled = false,
        beforeAssignTemplate = passthrough,
        beforeRenderNode = passthrough,
        assets = {},
        locale = {},
        propResourceMap = {
            title: 'locale',
            label: 'locale',
            icon: 'assets',
        },
        drag = true,
        dragDetachMargin = 40,
        dragSafetyMargin = 80,
        drop = true,
        dropRoot,
        dropPadding = 20,
        animations = 'auto',
        entryAnimationOriginMap = {},
        entryAnimationProps = {},
        entryAnimationStaggerInterval = 50,
        springDefaults,
    }: FilePondEntryListOptions = $props();

    // we update the template like this as when we set it via $props() Svelte creates a proxy which makes it difficult to update the template via beforeAssignTemplate
    let template: TemplateNode[] = $state.raw([]);
    export function setTemplate(newTemplate: TemplateNode[]) {
        template = newTemplate;
    }

    // update animation preference when changes
    const globalPreventState = getGlobalPreventAnimations();
    const reduceMotionState = getShouldReduceMotion();
    const enableAnimations = $derived(
        computeAnimationPreference(animations, globalPreventState, reduceMotionState)
    );

    // the maximum animations that can run
    const MAX_ANIMATIONS = 50;

    // root rect (used by spring root)
    let currentRect: Rect = $state() as Rect;
    let currentRectCenter: Vector = $state() as Vector;
    let currentSize: Size = $state() as Size;

    /** Entries that are currently rendered */
    let currentEntries: FilePondEntry[] = $state.raw([]);

    /** Entries that are being removed */
    let retainedEntries: { index: number; entry: FilePondEntry }[] = $state.raw([]);

    // A map of entries that are receiving special animations (for when removed, added, etc)
    let animatedEntries: {
        [id: string]: AnimatedEntry;
    } = $state.raw({});

    /** Width of current window */
    let windowWidth: number = $state(0);

    /** Height of current window */
    let windowHeight: number = $state(0);

    const windowBounds: Bounds = $derived({
        top: 0,
        right: windowWidth,
        bottom: windowHeight,
        left: 0,
    });

    /** Use object for callbacks so we can pass references to appcontext */
    const callback: AppCallbacks = $state({
        setEntries: onSetEntries,
        insertEntries: noop,
        removeEntries: noop,
        updateEntry: noop,
        setEntryExtensionState: noop,
        getEntryExtensionState: () => ({}),
        pushTask: noop,
        abortTask: noop,
    });

    /** Set the callback to use when the view updates entries */
    export function setSetEntriesCallback(cb: (entries: FilePondEntry[]) => void) {
        callback.setEntries = cb;
    }

    /** Set the callback to use when user wants to remove entry */
    export function setInsertEntriesCallback(
        cb: (entry: FilePondEntrySource | FilePondEntrySource[], index?: number | number[]) => void
    ) {
        callback.insertEntries = cb;
    }

    /** Set the callback to use when user wants to remove entry */
    export function setRemoveEntriesCallback(
        cb: (
            ...needles: Needle[]
        ) =>
            | ({ entry: FilePondEntry; index: number[] } | void)[]
            | { entry: FilePondEntry; index: number[] }
            | void
    ) {
        callback.removeEntries = cb;
    }

    /** Set the callback to use for updating entry state */
    export function setUpdateEntryCallback(cb: (needle: Needle, ...props: any[]) => void) {
        callback.updateEntry = cb;
    }

    /** Set the callback to use to get the current entry state */
    export function setGetEntryExtensionStateCallback(
        cb: (entry: FilePondEntry) => { [key: string]: any }
    ) {
        callback.getEntryExtensionState = cb;
    }

    /** Set the callback to use to update the entry status */
    export function setSetEntryExtensionStateCallback(
        cb: (entry: FilePondEntry, props: { [key: string]: any }) => void
    ) {
        callback.setEntryExtensionState = cb;
    }

    export function setPushTaskCallback(cb: (id: string, fn: Function) => void) {
        callback.pushTask = cb;
    }

    export function setAbortTaskCallback(cb: (id: string, fn: Function) => void) {
        callback.abortTask = cb;
    }

    /** Set the current entries to render */
    export function onSetEntries(entries: FilePondEntry[]) {
        // invalid entries object
        if (!entries) {
            return;
        }

        // update live entries
        currentEntries = entries;
    }

    /** Called when an entry is added, used to animate in new entries */
    export function onInsertEntry(entry: FilePondEntry) {
        const animation = entryAnimationOriginMap[entry.origin];

        // instantly insert api entries
        if (!animation) {
            return;
        }

        // animate!
        animateEntry(entry, animation, {
            stagger: entryAnimationStaggerInterval,
        });
    }

    /** Called when an entry is removed */
    export function onRemoveEntry({ entry, index }: { entry: FilePondEntry; index: number[] }) {
        if (index[0] === -1) {
            return;
        }

        // hold on to this entry
        retainEntry(entry, index[0]);

        // start animating this entry, remove it when done
        animateEntry(entry, 'fall', {
            stagger: entryAnimationStaggerInterval,
            oncomplete: () => {
                waitForSpringElementAnimationFrame(() => {
                    releaseEntryById(entry.id);
                });
            },
        });
    }

    /**
     * This is just a wrapper for the setTimeout hack used to sync dom manipulation with
     * measure/spring requestAnimationFrame loop
     */
    function waitForSpringElementAnimationFrame(cb: () => void) {
        // TODO: fix this timeout, without it the item animation jumps to then end frame before starting
        setTimeout(() => {
            cb();
        }, 0);
    }

    /** Called when the drop placeholder position is updated */
    function updateEntryPlaceholderRect(rect?: Rect) {
        if (!root) {
            return;
        }

        dispatchCustomEvent(root, 'updateplaceholder', {
            detail: rect,
        });
    }

    /** The entry we want to retain, this keeps the entry in view even if it's not in the model */
    function retainEntry(entry: FilePondEntry, index: number) {
        retainedEntries = [
            ...retainedEntries,
            {
                index,
                entry,
            },
        ];
    }

    /** Removes the entry from the retained entries array */
    function releaseEntryById(id: string) {
        retainedEntries = retainedEntries.filter(({ entry }) => entry.id !== id);
    }

    // this is used to set the "empty" state on the parent element, when empty it doesn't render, this makes the main drop panel animate more nicely when last element is removed
    const activeEntries = $derived(Math.max(retainedEntries.length, currentEntries.length));
    $effect(() => {
        dispatchCustomEvent(root, 'updateentries', {
            detail: activeEntries,
        });
    });

    /** Track staggered animations */
    const staggeredAnimations: { [animation: string]: number } = {};

    function animateEntry(
        entry: FilePondEntry,
        animation: string,
        options?: { stagger?: number; oncomplete?: () => void; retain?: boolean }
    ) {
        // need entry to do anything
        if (!entry) {
            return;
        }

        const { stagger, oncomplete, retain = false } = options ?? {};

        // don't run animations, this means animation completes instantly
        if (!enableAnimations) {
            if (oncomplete) {
                oncomplete();
            }
            return;
        }

        // already animating, exit
        if (animatedEntries[entry.id]?.animation === animation) {
            return;
        }

        // too many animations
        if (Object.keys(animatedEntries).length > MAX_ANIMATIONS) {
            if (oncomplete) {
                oncomplete();
            }
            return;
        }

        // track if oncomplete was called, so we don't call it multiple times
        let didCancel = false;
        let didComplete = false;

        // calculate the delay for a staggered animation
        let staggerTimeout = 0;
        const isStaggered = isNumber(stagger);
        if (isStaggered) {
            const lastStaggerDate = staggeredAnimations[animation] || 0;
            const now = Date.now();

            if (lastStaggerDate + stagger > now) {
                const offset = now - lastStaggerDate;
                staggerTimeout = stagger - offset;
            }

            // update last date for this animation
            staggeredAnimations[animation] = now + staggerTimeout;
        }

        // the id we'll use for the staggered animation
        let staggeredAnimationTimeout: ReturnType<typeof setTimeout>;

        const animationProps = {
            entry,
            animation,
            oncancel: () => {
                if (didCancel || !staggeredAnimationTimeout) {
                    return;
                }

                didCancel = true;

                clearTimeout(staggeredAnimationTimeout);

                untrack(() => {
                    removeEntryAnimation(entry, animation);
                });

                // ready!
                if (oncomplete) {
                    oncomplete();
                }
            },
            oncomplete: () => {
                if (didComplete) {
                    return;
                }

                // called
                didComplete = true;

                // remove animation
                if (!retain) {
                    untrack(() => {
                        removeEntryAnimation(entry, animation);
                    });
                }

                // ready!
                if (oncomplete) {
                    oncomplete();
                }
            },
        };

        // update entries object
        animatedEntries = {
            ...animatedEntries,
            [entry.id]: { ...animationProps, delayed: staggerTimeout > 0 },
        };

        // wait to run this animation
        if (staggerTimeout > 0) {
            staggeredAnimationTimeout = setTimeout(() => {
                // update entries object
                animatedEntries = {
                    ...animatedEntries,
                    [entry.id]: {
                        ...animationProps,
                        delayed: false,
                    },
                };
            }, staggerTimeout);
        }
    }

    function getEntryByAnimation(animation: string): FilePondEntry | null {
        for (const entryAnimation of Object.values(animatedEntries)) {
            if (animation === entryAnimation.animation) {
                return entryAnimation.entry;
            }
        }
        return null;
    }

    /** Remove entry with animation */
    function removeEntryAnimation(entry: FilePondEntry, animation: string) {
        if (animatedEntries[entry.id]?.animation !== animation) {
            return;
        }

        delete animatedEntries[entry.id];
        animatedEntries = {
            ...animatedEntries,
        };
    }

    /* Application context */
    setAppContext({
        get enableAnimations() {
            return enableAnimations;
        },
        get locale() {
            return locale;
        },
        get assets() {
            return assets;
        },
        get resources() {
            return {
                locale,
                assets,
            };
        },
        get springDefaults() {
            return springDefaults;
        },
        get propResourceMap() {
            return propResourceMap;
        },
        get retainedEntries() {
            return retainedEntries;
        },
        get animatedEntries() {
            return animatedEntries;
        },
        get entryAnimationProps() {
            return entryAnimationProps;
        },

        // so others can know of the placeholder rectangle location
        updateEntryPlaceholderRect: updateEntryPlaceholderRect,

        // copy over AppCallbacks to AppContext
        ...Object.keys(callback).reduce((res: AppCallbacks, fnKey: any) => {
            // @ts-ignore
            res[fnKey] = (...args: any[]) => {
                // @ts-ignore
                return callback[fnKey](...args);
            };

            return res;
        }, {} as AppCallbacks),
    });

    //#endregion

    // #region Drag n' drop

    // We use this rect to determine if a file drop operation is close enough to this FilePond instance
    let dropRootRect: Rect = $state.raw() as Rect;

    /** Called when drop element rect updates */
    function handleMeasureDropRoot(bounds: Bounds) {
        dropRootRect = rectFromBounds(bounds);
    }

    // reference to files droparea element
    let root: HTMLElement = $state() as HTMLElement;

    // contains drag interaction info, used to derive $dragState
    let dragInteraction: DragInteraction | undefined = $state.raw();

    // determine if can drop, and if so, what the drop padding and safety margin is
    const acceptsDrop = $derived(drop);
    const dropRootElement = $derived(dropRoot ?? root);

    // for dragging items outside of the drop root to remove them
    let dropState: DropState | undefined = $state.raw();

    $effect(() => {
        // no drag state or can safely drag items out of the list
        if (!dragInteraction || dragSafetyMargin === Infinity) {
            return;
        }

        // test if we're dragging inside or outside of the drop area
        const { viewPosition } = dragInteraction;
        const interactionRect = rectPad(
            untrack(() => dropRootRect),
            dragSafetyMargin
        );

        if (rectContainsPoint(interactionRect, viewPosition)) {
            // we're inside the drop area, if we're running a timer, let's reset it
            if (dropState) {
                dropState = undefined;
            }
        } else if (!dropState) {
            // we're outside the drop area, let's set up drop state
            dropState = {
                remove: true,
            };
        }
    });

    // calculate root scroll offset
    let rootDragOffsetRect: Rect;
    let previousRootDragTranslation: Vector;
    let rootDragVelocity: Vector;
    let rootDragTranslation: Vector = $state.raw(ORIGIN);
    $effect(() => {
        // no rect yet
        if (!currentRect) {
            rootDragTranslation = ORIGIN;
            return;
        }

        // no longer dragging or not dragging
        if (!dragInteraction) {
            rootDragOffsetRect = { ...currentRect };
            rootDragTranslation = ORIGIN;
            rootDragVelocity = ORIGIN;
            return;
        }

        const translation = rootDragOffsetRect
            ? vectorCreate(
                  rootDragOffsetRect.x - currentRect.x,
                  rootDragOffsetRect.y - currentRect.y
              )
            : ORIGIN;

        // no change
        if (previousRootDragTranslation && vectorEqual(translation, previousRootDragTranslation)) {
            rootDragVelocity = ORIGIN;
            return;
        }

        if (previousRootDragTranslation) {
            rootDragVelocity = vectorSubtract(translation, previousRootDragTranslation);
        }

        // remember for next round
        previousRootDragTranslation = { ...translation };

        waitForSpringElementAnimationFrame(() => {
            rootDragTranslation = translation;
        });
    });

    let lastDragIndex = -1;
    let dragState: DragState | undefined = $state.raw();
    $effect(() => {
        // we need current root rect to determine relative scroll offset
        if (!dragInteraction) {
            dragState = undefined;
            return;
        }

        // calculate drag state
        const { id, element, offset, translation, vector, viewPosition } = dragInteraction;

        // test if is drop operation is close enough to FilePond
        if (!element && acceptsDrop && dropPadding < Infinity) {
            const interactionRect = rectPad(
                untrack(() => dropRootRect),
                dropPadding
            );
            if (!rectContainsPoint(interactionRect, viewPosition)) {
                dragState = undefined;
                return;
            }
        }

        // is outside of filepond drop area
        const outside = !rectContainsPoint(
            rectPad(
                untrack(() => dropRootRect),
                dragDetachMargin
            ),
            viewPosition
        );

        // get drag target index
        const isTranslatingParent = rootDragTranslation.x !== 0 || rootDragTranslation.y !== 0;
        const sharedInteractionOptions = {
            searchBounds: windowBounds,
            cacheClientRectangles: isTranslatingParent ? 0 : 250,
        };

        const sharedInteractionVector = vectorAdd(rootDragVelocity, vector);

        const targetIndex = outside
            ? lastDragIndex
            : element
              ? getDragTargetIndex(
                    element,
                    viewPosition,
                    sharedInteractionVector,
                    sharedInteractionOptions
                )
              : getDropTargetIndex(
                    root,
                    viewPosition,
                    sharedInteractionVector,
                    sharedInteractionOptions
                );

        // no moving needed when not dragging an element or no target
        if (element && targetIndex > -1) {
            const elementList = element.closest('ul') as HTMLUListElement;
            const currentIndex = Array.from(elementList.children).indexOf(element);

            // no moving needed
            if (currentIndex !== targetIndex) {
                // not interested in rerunning this $effect if currentEntries updates
                untrack(() => {
                    callback.setEntries(arrayMove([...currentEntries], currentIndex, targetIndex));
                });
            }
        }

        // we need to remember the drag index for when we move outside the list and we no longer want to update it but do want to remember the index of the element we've dragged outside
        lastDragIndex = targetIndex;

        // new dragState
        dragState = {
            id,
            index: targetIndex,
            element,
            offset,
            translation,
            parentTranslation: rootDragTranslation,
            outside,
        };
    });

    const dragStateId = $derived(dragState ? dragState.id : undefined);
    const dragStateIndex = $derived(dragState ? dragState.index : undefined);
    const dragStateElement = $derived(dragState ? dragState.element : undefined);

    const isAddingEntries = $derived(
        !!(dragState && !dragStateElement && dragStateIndex !== undefined)
    );

    $effect(() => {
        if (!dragStateElement) {
            const entry = getEntryByAnimation('lift');
            if (entry) {
                animateEntry(entry, 'release');
            }
            return;
        }

        if (!isNumber(dragStateIndex)) {
            return;
        }

        const entry = currentEntries[dragStateIndex];
        if (dropState?.remove) {
            animateEntry(entry, 'disolve', { retain: true });
            return;
        }

        animateEntry(entry, 'lift', { retain: true });
    });

    /** Handles item being grabbed */
    function handleGrabItem(detail: DragEventDetail) {
        dispatchCustomEvent(root, 'dragentrystart');
        dragInteraction = detail;
    }

    /** Handles grab action being cancelled */
    function handleGrabItemCancel(_: DragEventDetail) {}

    /** Handles item being dragged */
    function handleDragItem(detail: DragEventDetail) {
        dispatchCustomEvent(root, 'dragentry');
        dragInteraction = detail;
    }

    /** Handles an item coming from outside of the window being dragged into the droparea */
    function handleDragItemIn(detail: DropEventDetail) {
        dragInteraction = detail;
    }

    /** Handles an item coming from outside of the window being dragged out of the droparea */
    function handleDragItemOut(_: DropEventDetail) {
        dragInteraction = undefined;
    }

    /** Handles item being dropped */
    function handleDropItem(e: DropEventDetail | DragEventDetail) {
        dispatchCustomEvent(root, 'dragentryend');

        // no valid drag interaction
        if (!dragState) {
            return;
        }

        // get drop index and drop action before we reset dragstate
        const { index } = dragState as { index: number };

        // done dragging
        dragInteraction = undefined;

        // if is transferring data
        if (hasOwnProp(e, 'dataTransfer')) {
            const dataTransfer = (e as DropEventDetail).dataTransfer;

            // can't handle non-files
            if (!dataTransfer.types.includes('Files')) {
                return;
            }

            // add data transfer
            callback.insertEntries(
                {
                    id: getUniqueId(),
                    src: dataTransfer,
                    origin: 'drop',
                },
                index
            );
            return;
        }

        // no files transferred, might've dragged an item out of the files list
        if (dropState?.remove) {
            const id = currentEntries[index].id;

            // set dropstate so we know this entry was dropped
            dropState = {
                ...dropState,
                id,
            };

            // remove the entry, this queues animation
            callback.removeEntries(id);
            return;
        }
    }

    //#endregion

    // #region File tree visualisation

    // calculate entries to render based on alive and dead entries
    const computedEntries = $derived.by(() => {
        let entriesToMerge = currentEntries;

        // need to add new entry for drop interaction
        if (isAddingEntries) {
            // creates a new array with the placeholder inserted
            entriesToMerge = arrayInsertAtIndex(
                // array to insert the placeholder into
                [...currentEntries],

                // where to add placeholder
                dragStateIndex as number,

                // item placeholder when dropping a new file
                { id: dragStateId } as FilePondEntrySource
            ) as FilePondEntry[];
        }

        // no retained entries to merge
        if (!retainedEntries.length) {
            return entriesToMerge;
        }

        // we have to merge retained entries
        let resultingEntries = [...entriesToMerge];
        retainedEntries.forEach(({ entry, index }) => {
            resultingEntries = arrayInsertAtIndex(resultingEntries, index, entry);
        });

        return resultingEntries;
    });

    // #endregion

    setDragContext({
        get current() {
            return dragState;
        },
    });

    setDropContext({
        get current() {
            return dropState;
        },
    });

    // measure drop root
    $effect(() => {
        // no new drop root defined, so exit
        if (!dropRootElement) {
            return;
        }

        // setup measure logic
        const measurableDestroyDropRoot = measurable({
            onmeasure: handleMeasureDropRoot,
        })(dropRootElement);

        // clean up
        return () => {
            measurableDestroyDropRoot();
        };
    });

    // copy "disable" state to root attribute
    $effect(() => {
        setBooleanAttribute(root, 'data-disabled', disabled);
    });

    const entryListAPI = $derived({
        insertEntries: callback.insertEntries,
        removeEntries: callback.removeEntries,
        updateEntry: callback.updateEntry,
        updateEntryState: (id: Needle, state: { [key: string]: any }) => {
            callback.updateEntry(id, { state });
        },
    });

    // this updates the spring root so when the root position changes on the screen (for example when an element above it is removed, the SpringElements don't animate towards the new position)
    function handleMeasureRoot(bounds: Bounds) {
        currentRect = rectFromBounds(bounds);
        currentRectCenter = rectCenter(currentRect);
        currentSize = sizeFromRect(currentRect);
    }

    setSpringElementTreeContext({
        parent: null,

        get isReady() {
            return true;
        },

        get currentRect() {
            return currentRect;
        },

        get currentRectCenter() {
            return currentRectCenter;
        },

        get targetSize() {
            return currentSize;
        },

        get currentSize() {
            return currentSize;
        },

        get currentScale() {
            return 1;
        },

        childSpringCount: 0,
        childSpringReadyCount: 0,
    });

    /** Disable context menu while dragging */
    function handleContextMenu(e: Event) {
        if (!dragInteraction) {
            return;
        }
        e.preventDefault();
    }
</script>

<svelte:window
    bind:innerWidth={windowWidth}
    bind:innerHeight={windowHeight}
    oncontextmenu={handleContextMenu}
/>

<div
    class="root"
    bind:this={root}
    {@attach measurable({
        onmeasure: handleMeasureRoot,
    })}
    {@attach dragarea({
        disabled: !drag || disabled,
        grabTimeout: 100,
        itemSelector: '[data-draggable]',
        ongrabitem: handleGrabItem,
        ongrabitemcancel: handleGrabItemCancel,
        ondragitem: handleDragItem,
        ondropitem: handleDropItem,
    })}
    {@attach droparea({
        disabled: !drop || disabled,
        ondragitem: handleDragItem,
        ondragitemin: handleDragItemIn,
        ondragitemout: handleDragItemOut,
        ondropitem: handleDropItem,
    })}
>
    <NodeList
        nodes={beforeAssignTemplate(template)}
        context={{ entries: computedEntries }}
        sharedContext={entryListAPI}
        beforeRenderNode={(node, context, sharedContext) =>
            beforeRenderNode(node, context, sharedContext)}
        beforeSetProps={(props) => ({ ...props, enableAnimations, springDefaults })}
    />
</div>
