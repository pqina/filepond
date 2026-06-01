import { noop } from '../../utils/placeholder.js';
import {
    type Size,
    sizeCreate,
    sizeEqual,
    sizeUpdate,
    sizeUpdateWithSize,
} from '../../utils/size.js';
import { type SuspensionObserver, getSuspensionObserver } from '../common/dom.js';

/**
 * Observe nodes being suspended so we can stop measuring them
 */
let SuspensionObserver: SuspensionObserver;
function createSuspensionObserver() {
    SuspensionObserver = getSuspensionObserver();

    // when a node is suspended we check if it contains a measured element, if so, we stop measuring
    SuspensionObserver.on('suspend', (suspendedNode) => {
        for (const element of nodeCallbacks.values()) {
            if (!suspendedNode.contains(element)) {
                continue;
            }
            nodeSuspended.set(element, true);
        }
    });
}

// to compare rectangles
const sizeTest = sizeCreate();

// Stores all nodes and their current sizes
const nodeSizes = new Map();

// Stores onresize callbacks
const nodeCallbacks = new Map();

// Used to mark nodes as suspended
const nodeSuspended = new Map();

/** Updates the node.rect property */
const updateNodeSize = (node: Element, width: number, height: number) => {
    if (nodeSuspended.has(node)) {
        return;
    }

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

        // We only need one reference to the suspension observer
        if (!SuspensionObserver) {
            createSuspensionObserver();
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

            // Remove suspended node
            nodeSuspended.delete(node);

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
