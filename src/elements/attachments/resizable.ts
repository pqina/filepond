import { noop } from '../../utils/placeholder.js';
import {
    type Size,
    sizeCreate,
    sizeEqual,
    sizeUpdate,
    sizeUpdateWithSize,
} from '../../utils/size.js';

// to compare rectangles
const sizeTest = sizeCreate();

// Stores all nodes and their current sizes
const nodeSizes = new Map();

// Stores onresize callbacks
const nodeCallbacks = new Map();

/** Updates the node.rect property */
const updateNodeSize = (node: Element, width: number, height: number) => {
    if (!nodeSizes.has(node)) {
        nodeSizes.set(node, sizeCreate());
    }

    // Get current rect
    const size = nodeSizes.get(node);

    // Update rect test so we can compare new rect
    sizeUpdate(sizeTest, width, height);

    // So we don't trigger a measure event if the rectangle wasn't changed
    if (sizeEqual(size, sizeTest)) {
        return;
    }

    // Update existing rect with new rect
    sizeUpdateWithSize(size, sizeTest);

    // Run callback
    nodeCallbacks.get(node)(size);
    // node.dispatchEvent(new CustomEvent('resize', { detail: size }));
};

// Total observed elements so we know when we can unload resizeObserver
let resizeObserverObservedNodes = 0;
let resizeObserver: ResizeObserver;
function createResizeObserver() {
    resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            const node = entry.target;

            // Get content client rect
            const { width, height } = entry.contentRect;

            // update rect
            updateNodeSize(node, width, height);
        });
    });
}

/** Measure the size of an html element. */
export function resizable(options: { onresize?: (size: Size) => void } = {}): {
    (element: HTMLElement): () => void;
} {
    const { onresize = noop } = options;
    return (node) => {
        // We only create one resizeObserver, it will observe all registered elements
        if (!resizeObserver) {
            createResizeObserver();
        }

        // register node
        nodeCallbacks.set(node, onresize);

        // Start observing this node
        resizeObserver.observe(node);

        // Count total observed nodes so we can disconnect observer when we reach 0
        resizeObserverObservedNodes++;

        return () => {
            // Stop observing this node
            resizeObserver.unobserve(node);

            // Remove node callback
            nodeCallbacks.delete(node);

            // Test if all nodes have been removed, if so, remove resizeObserver
            resizeObserverObservedNodes--;
            if (resizeObserverObservedNodes === 0) {
                resizeObserver.disconnect();
                // @ts-ignore
                resizeObserver = null;
            }
        };
    };
}
