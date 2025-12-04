import type { Bounds } from '../../utils/bounds.js';
import {
    boundsCreate,
    boundsEqual,
    boundsUpdate,
    boundsUpdateWithBounds,
} from '../../utils/bounds.js';
import { noop } from '../../utils/placeholder.js';

// Margin around viewport we use when determining if an item is in view
export const VIEWPORT_MARGIN = 100;

const nodeCallbacks = new Map();

/** WindowVisibilityObserver Tests if the window is visible, stops draw loop if it's not */
let windowVisibilityObserver: { visible: boolean } | null = null;
function createWindowVisibilityObserver() {
    function isVisible() {
        return !document.hidden;
    }

    windowVisibilityObserver = {
        visible: isVisible(),
    };

    function handleVisibilityChange() {
        if (windowVisibilityObserver) {
            windowVisibilityObserver.visible = isVisible();
        }
        if (isVisible()) {
            start();
        } else {
            stop();
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    handleVisibilityChange();
}

/**
 * IntersectionObserver to measure first element position, this is a lot faster than requesting it
 * manually
 */
let intersectionObserver: {
    visible: boolean;
    observe: (target: Element) => void;
    unobserve: (target: Element) => void;
} | null = null;
function createIntersectionObserver() {
    const intersectionObserverOptions = {
        // viewport
        root: null,
        // we're interested in elements near the viewport
        // rootMargin: `0px 0px 0px 0px`,
        rootMargin: `${VIEWPORT_MARGIN}px 0px 0px ${VIEWPORT_MARGIN}px`,
        // if one pixel is visible we detect it
        threshold: 1,
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const r = entry.boundingClientRect;

            const node = entry.target;

            // we're probably moving this node (for example when dropping an item and the placeholder moves around) and it just temporarily has no dimensions (it'll regain those before the frame is done, not 100% sure how that works), so let's ignore this update. This prevents items from flickering in and out of view
            if (
                nodeVisibility.has(node) &&
                !entry.isIntersecting &&
                r.x === 0 &&
                r.y === 0 &&
                r.width === 0 &&
                r.height === 0
            ) {
                return;
            }

            // Update node visibility (if isIntersecting -> node isVisible)
            nodeVisibility.set(node, entry.isIntersecting);

            // Check if all nodes are invisible, if so, stop draw loop, else start draw loop
            const someVisible = Array.from(nodeVisibility.values()).some(Boolean);
            if (intersectionObserver) {
                intersectionObserver.visible = someVisible;
            }
            if (someVisible) {
                start();
            } else {
                stop();
            }

            // already measured this node
            if (nodeBounds.has(node)) {
                return;
            }

            // We use InteractionObserver to measure the first position of the node
            updateNodeBounds(node, r.top, r.right, r.bottom, r.left);

            // Keep watching this node in requestAnimationFrame loop
            elements.push(node);

            // Start drawloop
            if (someVisible) {
                start();
            }
        });
    }, intersectionObserverOptions);

    intersectionObserver = {
        unobserve: (node) => {
            observer.unobserve(node);
        },
        observe: (node) => {
            observer.observe(node);
        },
        visible: false,
    };
}

// to compare rectangles
const boundsTest = boundsCreate();

// Stores all nodes and their current rectangles
const nodeBounds = new Map();
const nodeVisibility = new Map();

/** Updates the bounds property */
const updateNodeBounds = (
    node: Element,
    top: number,
    right: number,
    bottom: number,
    left: number
) => {
    // could've been deregistered before this call
    if (!nodeCallbacks.has(node)) {
        return;
    }

    // no bounds yet
    if (!nodeBounds.has(node)) {
        nodeBounds.set(node, boundsCreate());
    }

    // Get current node bounds
    const bounds = nodeBounds.get(node);

    // Update test bounds so we can compare new bounds (saves us from creating another object)
    boundsUpdate(boundsTest, top, right, bottom, left);

    // So we don't trigger a measure event if the rectangle wasn't changed
    if (boundsEqual(bounds, boundsTest)) {
        return;
    }

    // Update existing bounds with new bounds
    boundsUpdateWithBounds(bounds, boundsTest);

    // new bounds
    nodeCallbacks.get(node)(bounds);

    // return new bounds
    return bounds;
};

const measureClientRect = (node: Element) => {
    const clientRect = node.getBoundingClientRect();
    updateNodeBounds(node, clientRect.top, clientRect.right, clientRect.bottom, clientRect.left);
};

/** Holds all the elements to measure using requestAnimationFrame */
const elements: Element[] = [];

/** Measure loop */
let frame: number | null = null;
function tick() {
    // measure visible rectangles
    elements
        // remove invisible items
        // .filter((element) => nodeVisibility.get(element))
        // measure rectangles
        .forEach(measureClientRect);

    // wait for next frame
    frame = requestAnimationFrame(tick);
}

// Start measuring on next frame, we set up a single measure loop, the loop will check if there's still elements that need to be measured, else it will stop running
function start() {
    // Can't start
    if (!windowVisibilityObserver?.visible || !intersectionObserver?.visible) {
        return;
    }

    // Already started
    if (frame !== null) {
        return;
    }

    // Let's start
    frame = requestAnimationFrame(tick);
}

// Stops measuring elements
function stop() {
    if (frame === null) {
        return;
    }
    cancelAnimationFrame(frame);
    frame = null;
}

/** Measure the position and size of an html element. */
export function measurable(
    options: { disabled?: boolean; onmeasure?: (bounds: Bounds) => void } = {}
): { (element: HTMLElement): () => void } {
    const { disabled, onmeasure = noop } = options;

    return (node) => {
        // stop here
        if (disabled) {
            return () => undefined;
        }

        // Create single intersection observer
        if (!intersectionObserver) {
            createIntersectionObserver();
        }

        // Create single window visibility observer
        if (!windowVisibilityObserver) {
            createWindowVisibilityObserver();
        }

        // register node
        nodeCallbacks.set(node, onmeasure);

        // Start observing this node, will get also get its initial position
        intersectionObserver?.observe(node);

        return () => {
            // remove element
            const index = elements.indexOf(node);

            // it's possible the node didn't make it into the elements list
            if (index >= 0) {
                elements.splice(index, 1);
            }

            // stop observing
            intersectionObserver?.unobserve(node);
            nodeVisibility.delete(node);
            nodeBounds.delete(node);
            nodeCallbacks.delete(node);

            // stop measure loop if ran out of elements to measure
            if (!elements.length) {
                stop();
            }
        };
    };
}
