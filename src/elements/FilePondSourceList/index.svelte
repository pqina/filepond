<script lang="ts">
    import type { FilePondSourceListOptions } from './index.js';
    import type { Bounds } from '../../utils/bounds.js';
    import { Spring } from 'svelte/motion';
    import { NodeList } from '../components/NodeList/index.js';
    import { stringReplaceVariables, withResources } from '../common/string.js';
    import { Button } from '../components/Button/index.js';
    import { ElementPane } from '../components/ElementPane/index.js';
    import { measurable } from '../attachments/measurable.js';
    import { rectContainsPoint, rectFromBounds, type Rect } from '../../utils/rect.js';
    import { vectorCreate } from '../../utils/vector.js';
    import { supportsDisplayTransition } from '../../utils/support.js';
    import { noop, passthrough } from '../../utils/placeholder.js';
    import { SpringElement } from '../components/SpringElement/index.js';
    import { addListener, dispatchCustomEvent } from '../../utils/dom.js';
    import { onDestroy } from 'svelte';
    import type { NodeData, TemplateNode } from '../common/nodeTree.js';
    import { createMotionStateObserver, shouldReduceMotion } from '../common/motionState.svelte.js';

    let {
        disabled = false,
        springOptions,
        reducedMotionPreference,
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

    // update motion preference
    const motionStateObserver = createMotionStateObserver();
    const reduceMotion = $derived(
        shouldReduceMotion(motionStateObserver.current, reducedMotionPreference)
    );

    let dialogContentNodes = $state(<{ nodes: TemplateNode[]; data: NodeData }>{});

    let dialogImportCount = $state(0);

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
    const importButton = $derived({
        label: stringReplaceVariables(locale.import, { importCount: dialogImportCount }, locale),
    });

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

    $effect(() => {
        if (!dialogRect) {
            return;
        }

        dialogRectSpring.set(dialogRect, { instant: reduceMotion });
    });

    $effect(() => {
        Object.assign(dialogRectSpring, springOptions);
    });

    function handleMeasureDialog(bounds: Bounds) {
        if (!dialogRef?.open || !dialogContentRef?.children.length) {
            return;
        }

        const rect = rectFromBounds(bounds);
        if (dialogVisible) {
            dialogRect = rect;
            return;
        }

        const margin = 10;

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

        contentRectSpring.set(contentRect, { instant: reduceMotion });
    });

    $effect(() => {
        Object.assign(contentRectSpring, springOptions);
    });

    const dialogContentClipPathStyle = $derived.by(() => {
        if (!contentRect || !contentRectSpring.current) {
            return undefined;
        }

        const { x, y, width, height } = contentRect;
        const { x: xS, y: yS, width: widthS, height: heightS } = contentRectSpring.current;

        const t = yS - y;
        const r = x + width - (xS + widthS);
        const b = y + height - (yS + heightS);
        const l = xS - x;

        if (t === 0 && r === 0 && b === 0 && l === 0) {
            return undefined;
        }

        return `${t}px ${r}px ${b}px ${l}px`;
    });

    function handleMeasureContent(bounds: Bounds) {
        if (!dialogRef?.open || !dialogContentRef?.children.length) {
            return;
        }

        contentRect = rectFromBounds(bounds);
    }

    function prepareDialogContent() {
        // automatically focus first autofocusable element
        const focusableElement: HTMLInputElement | HTMLButtonElement | null | undefined =
            dialogContentRef?.querySelector('[autofocus]');
        focusableElement?.focus();

        // automatically link up any custom close buttons
        dialogContentRef?.querySelectorAll('button[command=close]').forEach((element) => {
            (element as HTMLButtonElement).commandForElement = dialogRef as Element;
        });
    }

    function setDialogContentTemplate(nodes: TemplateNode[], data: NodeData) {
        dialogContentNodes = {
            data,
            nodes,
        };
    }

    function setDialogImportButtonCount(count: number) {
        dialogImportCount = count;
    }

    // set up dialog
    $effect(() => {
        if (!dialogRef) {
            return;
        }

        // typescript throws an error when we set this using oncommand
        const unsubCommandListener = addListener(dialogRef, 'command', handleDialogCommand);
        return () => {
            unsubCommandListener();
        };
    });

    const preventSpringMotion = $derived(reduceMotion || !dialogVisible);

    const dialogContentObserver = new MutationObserver((entries) => {
        for (const entry of entries) {
            const [addedNode] = entry.addedNodes;
            if (!addedNode || addedNode.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }
            prepareDialogContent();
        }
    });

    $effect(() => {
        if (!dialogContentRef) {
            return;
        }

        dialogContentObserver.observe(dialogContentRef, {
            childList: true,
        });

        return () => {
            dialogContentObserver.disconnect();
        };
    });

    onDestroy(() => {
        motionStateObserver.destroy();
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
            data-visible={dialogVisible ? '' : undefined}
            {@attach measurable({
                onmeasure: handleMeasureDialog,
            })}
        >
            <form method="dialog" part="dialog-form">
                <div part="dialog-header">
                    <SpringElement
                        reduceMotion={preventSpringMotion}
                        class="dialog-title-spring"
                        {springOptions}
                    >
                        <p part="dialog-title">{title}</p>
                    </SpringElement>
                    <SpringElement
                        class="dialog-button-close-spring"
                        reduceMotion={preventSpringMotion}
                        {springOptions}
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
                >
                    <!-- nodes={dialogContentTemplate} -->
                    <!-- data={{
                        // TODO: pass select items count here or use "change" event and read out total selected items?
                    }} -->
                    <NodeList
                        {reduceMotion}
                        {springOptions}
                        {...dialogContentNodes}
                        context={{
                            resources: {
                                locale,
                                assets,
                            },
                            propResourceMap,
                        }}
                        beforeRenderNode={(node, data, context) =>
                            beforeRenderNode(node, data, context)}
                        beforeSetProps={(props) => {
                            return {
                                ...props,

                                // local props potentially needed by children
                                reduceMotion,
                                springOptions,
                            };
                        }}
                    />
                </div>

                <div part="dialog-footer">
                    <SpringElement
                        class="dialog-button-cancel-spring"
                        reduceMotion={preventSpringMotion}
                        {springOptions}
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
                        reduceMotion={preventSpringMotion}
                        {springOptions}
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
            {reduceMotion}
            {springOptions}
            nodes={template}
            data={{ items: sources }}
            context={{
                disabled,
                dialog: dialogRef,
                setDialogContentTemplate,
                setDialogImportButtonCount,
                resources: {
                    locale,
                    assets,
                },
                propResourceMap,
            }}
            beforeRenderNode={(node, data, context) => beforeRenderNode(node, data, context)}
        />
    {/if}
</div>
