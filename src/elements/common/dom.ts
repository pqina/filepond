import type { Vector } from '../../utils/vector.js';
import type { Bounds } from '../../utils/bounds.js';
import type { Rect } from '../../utils/rect.js';
import { boundsOutsideBounds } from '../../utils/bounds.js';
import { pubsub } from '../../utils/pubsub.js';

/** Search a list of elements around a position within bounds */
export function getClosestElement(
    elements: HTMLElement[],
    position: Vector,
    options: { cacheClientRectangles?: number; searchBounds?: Bounds }
) {
    const { cacheClientRectangles = 250, searchBounds } = options;

    let target;
    let closestDist = Number.MAX_SAFE_INTEGER;

    // we done!
    if (elements.length === 1) {
        return elements[0];
    }

    // so we know how long to cache rects
    let ts = Date.now();

    // let's find the closest element
    for (const element of elements) {
        let clientRect;
        const cachedRect = clientRectCache.get(element);
        if (cachedRect && ts - cachedRect.ts < cacheClientRectangles) {
            clientRect = cachedRect.clientRect;
        } else {
            clientRect = element.getBoundingClientRect();
        }

        // if not within search bounds, skip
        if (searchBounds && boundsOutsideBounds(clientRect, searchBounds)) {
            clientRectCache.set(element, { clientRect, ts });
            continue;
        }

        const pointerDistanceToNode = getDistanceToNodeRect(clientRect, position);
        if (pointerDistanceToNode < closestDist) {
            closestDist = pointerDistanceToNode;
            target = element;
        }
    }

    return target;
}

const clientRectCache = new WeakMap();

function getDistanceToNodeRect(nodeRect: Rect, position: Vector) {
    const dx = Math.max(nodeRect.x - position.x, 0, position.x - (nodeRect.x + nodeRect.width));
    const dy = Math.max(nodeRect.y - position.y, 0, position.y - (nodeRect.y + nodeRect.height));
    return Math.hypot(dx, dy);
}

//
function createSuspensionObserver(): SuspensionObserver {
    const { on, pub } = pubsub();

    return {
        on,
        suspend(node: HTMLElement) {
            node.setAttribute('suspend', '');
            pub('suspend', node);
        },
    };
}

let suspensionObserver: SuspensionObserver;

export interface SuspensionObserver {
    on: (event: string, callback: (detail?: any) => void) => () => void;
    suspend: (node: HTMLElement) => void;
}

export function getSuspensionObserver() {
    if (!suspensionObserver) {
        suspensionObserver = createSuspensionObserver();
    }
    return suspensionObserver;
}
