<script lang="ts">
    import { Spring } from 'svelte/motion';
    import { createAnimationModeObserver } from '../common/animationPreference.svelte.js';
    import { NodeList } from '../components/NodeList/index.js';
    import type { FilePondSourceListOptions } from './index.js';
    import { withResources } from '../common/string.js';
    import { Button } from '../components/Button/index.js';
    import { ElementPane } from '../components/ElementPane/index.js';
    import { measurable } from '../attachments/measurable.js';
    import type { Bounds } from '../../utils/bounds.js';
    import { rectContainsPoint, rectFromBounds, type Rect } from '../../utils/rect.js';
    import { vectorCreate } from '../../utils/vector.js';
    import { supportsDisplayTransition } from '../../utils/support.js';
    import { noop, passthrough } from '../../utils/placeholder.js';
    import { SpringElement } from '../components/SpringElement/index.js';
    import { addListener, dispatchCustomEvent } from '../../utils/dom.js';
    import { onDestroy } from 'svelte';

    let {
        disabled = false,
        animations = 'auto',
        springDefaults,
        sources = [],
        assets = {},
        locale = {},
        propResourceMap = {
            title: 'locale',
            label: 'locale',
            icon: 'assets',
        },
        template,
        beforeRenderNode = passthrough,
    }: FilePondSourceListOptions = $props();

    // update animation preference when changes
    const AnimationModeObserver = createAnimationModeObserver();
    const enableAnimations = $derived(AnimationModeObserver.current);
    $effect(() => {
        AnimationModeObserver.setPreference(animations);
    });

    // root element
    let rootRef = $state.raw<HTMLDivElement>();
    $effect(() => {
        if (!rootRef) {
            return;
        }
        dispatchCustomEvent(rootRef, 'sourceschange', {
            detail: sources.length,
        });
    });

    // dialog reference
    let dialogRef = $state.raw<HTMLDialogElement>();
    let dialogContentRef = $state.raw<HTMLDivElement>();
    let dialogVisible = $state(false);

    // dialog close button
    const closeButton = $derived(
        withResources({ icon: 'close', label: 'close' }, propResourceMap, { locale, assets })
    );
    const cancelButton = $derived(
        withResources({ label: 'cancel' }, propResourceMap, { locale, assets })
    );
    const importButton = $derived(
        withResources({ label: 'import' }, propResourceMap, { locale, assets })
    );

    // when a button is clicked we copy the button label to the dialog title
    let title: string = $state.raw('');
    function handleDialogCommand(e: CommandEvent) {
        if (e.command === 'show-modal') {
            handleShowDialog(e);
        }
    }

    function handleDialogToggle(e: Event) {
        if (!dialogRef?.open) {
            handleHideDialog(e);
        }
    }

    function handleShowDialog(e: CommandEvent) {
        // sync title with source
        title = e?.source?.textContent.trim() || '';

        // we do this so the dialog control springs are reset (for example when previously a bigger dialog was opened it would cause the controls to move from those positions towards the new which looks weird)
        // wrap in request animation frame so the animation lines up correctly, otherwise sometimes the elements flicker into view
        // requestAnimationFrame(() => {
        //     dialogVisible = true;
        // });
    }

    function handleHideDialog(e: Event) {
        if (!supportsDisplayTransition()) {
            resetRects();
        }
    }

    function handleDialogTap(e: MouseEvent & { currentTarget: HTMLDialogElement }) {
        const dialogTarget = e.currentTarget;

        if (e.target !== dialogTarget || !dialogRect) {
            return;
        }

        if (rectContainsPoint(dialogRect, vectorCreate(e.clientX, e.clientY))) {
            return;
        }

        dialogTarget.close();
    }

    function handleDialogTransitionEnd(e: TransitionEvent) {
        if (e.propertyName !== 'display' || dialogRef?.open) {
            return;
        }

        // now fully hidden so we can safely reset stored rectangles so they're not used in next dialog animation
        resetRects();
    }

    function resetRects() {
        dialogRect = null;
        dialogRectSpring.set(null, { instant: true });

        contentRect = null;
        contentRectSpring.set(null, { instant: true });

        dialogVisible = false;
    }

    let dialogRect = $state<Rect | null>(null);
    let dialogRectSpring = new Spring<Rect | null>(null);
    let dialogHeaderFooterOpacity = $state(0);

    $effect(() => {
        if (!dialogRect) {
            return;
        }

        dialogRectSpring.set(dialogRect, { instant: !enableAnimations });
    });

    $effect(() => {
        Object.assign(dialogRectSpring, springDefaults);
    });

    function handleMeasure(bounds: Bounds) {
        if (!dialogRef?.open || !dialogContentRef?.children.length) {
            return;
        }

        const margin = 10;

        const rect = rectFromBounds(bounds);
        dialogRect = {
            x: rect.x + margin,
            y: rect.y + margin,
            width: rect.width - margin * 2,
            height: rect.height - margin * 2,
        };

        requestAnimationFrame(() => {
            dialogRect = rect;
            dialogVisible = true;
        });
    }

    /** Content clipping */
    let contentRect = $state<Rect | null>(null);
    let contentRectSpring = new Spring<Rect | null>(null);

    $effect(() => {
        if (!contentRect) {
            return;
        }

        contentRectSpring.set(contentRect, { instant: !enableAnimations });
    });

    $effect(() => {
        Object.assign(contentRectSpring, springDefaults);
    });

    const dialogContentClipPathStyle = $derived.by(() => {
        if (!contentRect || !contentRectSpring.current) {
            return '0px';
        }

        const { x, y, width, height } = contentRect;
        const { x: xS, y: yS, width: widthS, height: heightS } = contentRectSpring.current;

        const t = yS - y;
        const r = x + width - (xS + widthS);
        const b = y + height - (yS + heightS);
        const l = xS - x;

        return `${t}px ${r}px ${b}px ${l}px`;
    });

    function handleMeasureContent(bounds: Bounds) {
        if (!dialogRef?.open || !dialogContentRef?.children.length) {
            return;
        }

        contentRect = rectFromBounds(bounds);
    }

    /** Adding content */
    function handleAppendContent(...args: HTMLElement[]) {
        // move to dialog content element
        dialogContentRef?.append(...args);

        // automatically focus first autofocusable element
        const focusableElement: HTMLInputElement | HTMLButtonElement | null | undefined =
            dialogContentRef?.querySelector('[autofocus]');
        focusableElement?.focus();

        // automatically link up any custom close buttons
        dialogContentRef?.querySelectorAll('button[command=close]').forEach((element) => {
            (element as HTMLButtonElement).commandForElement = dialogRef as Element;
        });
    }

    // set up dialog
    $effect(() => {
        if (!dialogRef) {
            return;
        }

        dialogRef.append = handleAppendContent;

        // typescript throws an error when we set this using oncommand
        const unsubCommandListener = addListener(dialogRef, 'command', handleDialogCommand);
        return () => {
            unsubCommandListener();
        };
    });

    const animateDialogSprings = $derived(enableAnimations && dialogVisible);

    /** Source buttons */
    const sourceListContext = $derived({
        disabled,
        dialog: dialogRef,
        resources: {
            locale,
            assets,
        },
        propResourceMap,
        enableAnimations,
        springDefaults,
    });

    onDestroy(() => {
        AnimationModeObserver.destroy();
    });
</script>

<div class="root" bind:this={rootRef}>
    {#if sources.length}
        <dialog
            part="dialog"
            bind:this={dialogRef}
            closedby="closerequest"
            ontransitionend={supportsDisplayTransition() ? handleDialogTransitionEnd : noop}
            onclick={handleDialogTap}
            ontoggle={handleDialogToggle}
            style:--dialog-content-clip-path={dialogContentClipPathStyle}
            {@attach measurable({
                onmeasure: handleMeasure,
            })}
            data-visible={dialogVisible ? '' : undefined}
        >
            <form method="dialog" part="dialog-form">
                <div part="dialog-header">
                    <SpringElement
                        enableAnimations={animateDialogSprings}
                        class="dialog-title-spring"
                        {springDefaults}
                    >
                        <p part="dialog-title">{title}</p>
                    </SpringElement>
                    <SpringElement
                        class="dialog-button-close-spring"
                        enableAnimations={animateDialogSprings}
                        {springDefaults}
                    >
                        <Button
                            {...closeButton}
                            part="dialog-button-close"
                            command="close"
                            commandfor={dialogRef}
                        />
                    </SpringElement>
                </div>

                <div
                    part="dialog-content"
                    bind:this={dialogContentRef}
                    {@attach measurable({
                        onmeasure: handleMeasureContent,
                    })}
                ></div>

                <div part="dialog-footer">
                    <SpringElement
                        class="dialog-button-cancel-spring"
                        enableAnimations={animateDialogSprings}
                        {springDefaults}
                    >
                        <Button
                            {...cancelButton}
                            part="dialog-button-cancel"
                            commandfor={dialogRef}
                            command="close"
                        />
                    </SpringElement>
                    <SpringElement
                        class="dialog-button-import-spring"
                        enableAnimations={animateDialogSprings}
                        {springDefaults}
                    >
                        <Button {...importButton} part="dialog-button-import" type="submit" />
                    </SpringElement>
                </div>
            </form>

            {#if dialogRectSpring.current}
                <element-pane-wrapper
                    style:left={dialogRectSpring.target
                        ? `${-dialogRectSpring.target.x}px`
                        : undefined}
                    style:top={dialogRectSpring.target
                        ? `${-dialogRectSpring.target.y}px`
                        : undefined}
                    style:translate={dialogRectSpring.current
                        ? `${dialogRectSpring.current.x}px ${dialogRectSpring.current.y}px`
                        : undefined}
                >
                    <ElementPane
                        width={dialogRectSpring.current.width}
                        height={dialogRectSpring.current.height}
                    />
                </element-pane-wrapper>
            {/if}
        </dialog>

        <NodeList
            beforeRenderNode={(node, context, sharedContext) =>
                beforeRenderNode(node, context, sharedContext)}
            nodes={template}
            context={{ items: sources }}
            sharedContext={sourceListContext}
        />
    {/if}
</div>
