import { boundsFromRect, type Bounds } from '../../utils/bounds.js';
import { rectCenter } from '../../utils/rect.js';
import { isVectorPointingTowardsPoint, type Vector } from '../../utils/vector.js';
import { getClosestElement } from './getClosestElement.js';

/** Gets the target index for a Drag interaction */
export function getDragTargetIndex(
    element: HTMLElement,
    viewPosition: Vector,
    vector: Vector,
    options: { cacheClientRectangles?: number; searchBounds?: Bounds }
) {
    // no element received
    if (!element) {
        return -1;
    }

    // get target element list
    const elementList = element.closest('ul');
    if (!elementList) {
        return -1;
    }

    // now we need to find the closest element in this list
    const listItems = Array.from(elementList.children) as HTMLElement[];
    const target = getClosestElement(listItems, viewPosition, options);
    const targetIndex = target ? listItems.indexOf(target) : -1;

    // if is moving towards own new position, leave things in place
    const draggedElementRect = element.getBoundingClientRect();
    const draggedElementCenter = rectCenter(draggedElementRect);

    // Note: perhaps could be improved by casting a ray and checking if it intersects with rect
    if (isVectorPointingTowardsPoint(vector, viewPosition, draggedElementCenter)) {
        return listItems.indexOf(element);
    }

    // update state
    return targetIndex;
}

export function getDropTargetIndex(
    root: HTMLElement,
    viewPosition: Vector,
    vector: Vector,
    options: { cacheClientRectangles?: number; searchBounds?: Bounds }
) {
    // get closest element list
    const elementLists = Array.from(root.querySelectorAll('ul'));
    if (!elementLists.length) {
        return -1;
    }

    // there are lists to search through
    const elementList = getClosestElement(elementLists, viewPosition, options);
    if (!elementList) {
        return -1;
    }

    const listItems = Array.from(elementList.children) as HTMLElement[];
    if (!listItems.length) {
        return -1;
    }

    // closest item to drag position
    const closestItem = getClosestElement(listItems, viewPosition, options) as HTMLElement;

    // placeholder info itself
    const placeholderElement = listItems.find((item) => item.dataset.placeholder === '');
    const placeholderIndex = placeholderElement ? listItems.indexOf(placeholderElement) : -1;
    if (!placeholderElement) {
        // find position in list to place placeholder.

        // loop over items and find item
        const closestItemIndex = listItems.indexOf(closestItem);

        // is my position before or after the closestItem
        const closestItemRect = closestItem.getBoundingClientRect();
        const closestItemBounds = boundsFromRect(closestItemRect);
        const closestItemCenter = rectCenter(closestItemRect);

        // is vertical list layout, determine if placeholder pposition is before or afer closest item
        if (listItems.every((item) => item.getBoundingClientRect().x === closestItemRect.x)) {
            if (viewPosition.y > closestItemCenter.y) {
                return closestItemIndex + 1;
            }
            return closestItemIndex;
        }

        // is grid layout and is last item, let's see if we're to the right of the item or below it, if so we place our new item after it
        if (
            closestItemIndex === listItems.length - 1 &&
            (viewPosition.x > closestItemBounds.right || viewPosition.y > closestItemBounds.bottom)
        ) {
            return closestItemIndex + 1;
        }

        // just go with closest item index
        return closestItemIndex;
    }

    // if current placeholder is closest, we'll stick to that
    if (closestItem === placeholderElement) {
        return placeholderIndex;
    }

    // Note: perhaps could be improved by casting a ray and checking if it intersects with rect
    const placeholderElementRect = placeholderElement.getBoundingClientRect();
    const placeholderElementCenter = rectCenter(placeholderElementRect);
    if (isVectorPointingTowardsPoint(vector, viewPosition, placeholderElementCenter)) {
        return placeholderIndex;
    }

    // Note: perhaps could be improved by casting a ray and checking if it intersects with rect
    const closestElementRect = closestItem.getBoundingClientRect();
    const closestElementCenter = rectCenter(closestElementRect);
    if (isVectorPointingTowardsPoint(vector, viewPosition, closestElementCenter)) {
        return listItems.indexOf(closestItem);
    }

    // stick to placeholder index
    return placeholderIndex;
}
