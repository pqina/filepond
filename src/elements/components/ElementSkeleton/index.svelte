<script lang="ts">
    import { onDestroy, type Snippet } from 'svelte';
    import { removeAttributes } from '../../../utils/dom.js';
    import { transitions } from '../../attachments/transitions.js';
    import { getSkeletonInstanceIndex } from './index.js';

    interface SkeletonOptions {
        /** Class to set on the element */
        class?: string;

        /**
         * Let's the skeleton know that loading is done, if no content yet, we reveal empty
         * container
         */
        isWaiting?: boolean;

        /** Let's the skeleton know that an error occured, we freeze the animation */
        isFrozen?: boolean;

        /** Skeleton children */
        children: Snippet;
    }

    let {
        class: klass = undefined,
        isWaiting = true,
        isFrozen = false,
        children,
    }: SkeletonOptions = $props();

    // this offsets the animation so you get a "wave" effect when more skeleton loaders are visible
    const offset = getSkeletonInstanceIndex();

    // reference to root node
    let root = $state.raw() as HTMLElement;

    // should render skeleton animation
    let shouldRender = $state(true);

    // current state
    let loadingState = $state('active');

    // we observe added content of the skeleton element so we a mutation is made we know we're done
    const observer = new MutationObserver(([mutation]) => {
        // we modified the node tree, let's check if children were rendered
        if (hasRenderedChildren(root)) {
            // we're now ready
            loadingState = 'ready';

            // stop observing
            observer.disconnect();
        }
    });

    let didInit = false;
    $effect(() => {
        if (didInit) {
            return;
        }

        // Content instantly rendered?
        if (hasRenderedChildren(root)) {
            shouldRender = false;
            loadingState = 'ready';
        }

        // No content rendered yet, let's observe root and wait for its
        else {
            observer.observe(root, {
                childList: true,
            });
        }

        // don't run this again
        didInit = true;
    });

    $effect(() => {
        // empty and not waiting for content
        if (!isWaiting && !isFrozen) {
            shouldRender = false;
            loadingState = 'ready';
        }

        // switch to error state
        if (isFrozen) {
            loadingState = 'frozen';
        }
    });

    // tests if element has loaded children
    function hasRenderedChildren(element: HTMLElement) {
        const relevantNodes = Array.from(element.childNodes).filter((node) => {
            // keep text nodes
            if (node.nodeType === 3) {
                // @ts-ignore
                return node.textContent.length > 0;
            }

            // keep nodes that aren't the skeleton pane
            if (node.nodeType === 1 && node.nodeName !== 'SKELETON-PANE') {
                return true;
            }

            return false;
        });
        return relevantNodes.length > 0;
    }

    // update root with current loading state
    const loadingStates = ['ready', 'active', 'frozen'];
    $effect(() => {
        removeAttributes(root, loadingStates);
        root.setAttribute(loadingState, '');
    });

    // automatically remove skeleton panel when done loading
    let didCompleteOutro = $state(false);

    onDestroy(() => {
        observer.disconnect();
    });
</script>

<element-skeleton bind:this={root} style:--skeleton-offset={offset} class={klass}
    >{@render children()}{#if shouldRender && !didCompleteOutro}<skeleton-pane
            {@attach transitions({
                opacity: {
                    end: (value) => {
                        if (value !== '0') {
                            return;
                        }
                        didCompleteOutro = true;
                    },
                },
            })}
        ></skeleton-pane>{/if}</element-skeleton
>
