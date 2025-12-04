import type { Vector } from '../../utils/vector.js';

import { dispatchCustomEvent } from '../../utils/dom.js';
import { addListener } from '../../utils/dom.js';
import { debounce } from '../../utils/debounce.js';
import { getUniqueId } from '../../utils/string.js';
import { vectorCreate, vectorLengthSquared } from '../../utils/vector.js';
import { isElement } from '../../utils/test.js';
import { noop } from '../../utils/placeholder.js';

export interface DragEventDetail {
    id: string;
    element: HTMLElement;
    translation: Vector;
    offset: Vector;
    startPosition: Vector;
    viewPosition: Vector;
    vector: Vector;
}

interface DragAreaOptions {
    disabled?: boolean;
    grabTimeout?: number;
    grabIgnoreMoveDistance?: number;
    itemSelector?: string;
    ongrabitemattempt?: (obj: DragEventDetail) => void;
    ongrabitemcancel?: (obj: DragEventDetail) => void;
    ongrabitem?: (obj: DragEventDetail) => void;
    ondragitemcancel?: (obj: DragEventDetail) => void;
    ondragitem?: (obj: DragEventDetail) => void;
    ondropitem?: (obj: DragEventDetail) => void;
}

export function dragarea(options: DragAreaOptions = {}): (element: HTMLElement) => void {
    // options
    const {
        disabled = false,
        grabTimeout = 300,
        grabIgnoreMoveDistance = 5,
        itemSelector = 'li',
    } = options;

    return (element) => {
        // do nothing
        if (disabled) {
            return;
        }

        // unsubs
        let pointerMoveUnsub: (() => void) | void;
        let pointerUpUnsub: (() => void) | void;
        let pointerCancelUnsub: (() => void) | void;
        let touchMoveUnsub: (() => void) | void;

        // holds timeout for when we consider something a grab action
        let grabAttemptTimeout: ReturnType<typeof setTimeout>;

        // target element
        let id: string | undefined;
        let target: Element | HTMLElement | null | undefined;
        let startPosition: Vector | undefined;
        let viewPosition: Vector | undefined;
        let translation: Vector | undefined;
        let vector: Vector | undefined;
        let offset: Vector | undefined;

        /** Prevents scrolling while dragging on iOS */
        const preventScroll = (e: TouchEvent) => {
            e.preventDefault();
        };

        /** Resets the drag state when cancelled or dropped */
        const reset = () => {
            target = undefined;
            vector = undefined;
            startPosition = undefined;
            viewPosition = undefined;
            translation = undefined;

            // cancel grab timer
            clearTimeout(grabAttemptTimeout);

            // prevent drag
            pointerMoveUnsub = pointerMoveUnsub && pointerMoveUnsub();

            // unsub from pointer up, need new pointer down to start grab action
            pointerUpUnsub = pointerUpUnsub && pointerUpUnsub();

            // unsub from cancel
            pointerCancelUnsub = pointerCancelUnsub && pointerCancelUnsub();

            // restore scroll on ios
            touchMoveUnsub = touchMoveUnsub && touchMoveUnsub();
        };

        /** Update the drag state based on passed pointer event */
        const update = (e: PointerEvent) => {
            viewPosition = vectorCreate(e.clientX, e.clientY);

            // just to make TS happy
            if (!startPosition || !translation) {
                return;
            }

            const newTranslation = vectorCreate(
                viewPosition.x - startPosition.x,
                viewPosition.y - startPosition.y
            );

            vector = vectorCreate(
                newTranslation.x - translation.x,
                newTranslation.y - translation.y
            );

            translation = newTranslation;
        };

        /** Dispatch events on main element */
        const dispatchEvent = (type: string) => {
            const detail = {
                id,
                element: target,
                translation: { ...translation },
                offset: { ...offset },
                startPosition: { ...startPosition },
                viewPosition: { ...viewPosition },
                vector: { ...vector },
            };

            // @ts-ignore call handler (if defined)
            const cb = options[`on${type}`] ?? noop;
            if (cb) {
                cb(detail);
            }

            // dispatch as event
            dispatchCustomEvent(element, type, {
                detail,
            });
        };

        /** Gets closest draggable target */
        function getDraggableTarget(e: PointerEvent): Element | null {
            return (e.target as HTMLElement)?.closest(itemSelector);
        }

        /** Checks if can grab target, doesn't grab input elements and buttons */
        function canGrabTarget(e: PointerEvent) {
            // get path to target
            const { target } = e;

            // target should be an element
            if (!isElement(target)) {
                return false;
            }

            // can't grab elements outside of action root
            if (!element.contains(target)) {
                return false;
            }

            // test if can grab the target element
            const path = e.composedPath();
            const node = path.shift() as HTMLElement;
            if (/input|select|textarea|button/i.test(node.nodeName)) {
                return false;
            }

            // yes we can
            return true;
        }

        /** Handle grabbing elements */
        const handleGrabAttempt = (e: PointerEvent) => {
            // not primary mouse button
            if (e.button !== 0) {
                return;
            }

            // can't drag when pressing on (for example) button
            if (!canGrabTarget(e)) {
                return;
            }

            // not draggable target
            target = getDraggableTarget(e);
            if (!target) {
                return;
            }

            // get grab attempt origin from top left of document
            startPosition = vectorCreate(e.clientX, e.clientY);

            // determine element center point
            const targetRect = target.getBoundingClientRect();
            offset = vectorCreate(startPosition.x - targetRect.x, startPosition.y - targetRect.y);

            // start translation
            translation = vectorCreate();

            // update drag state for first time
            update(e);

            // testing grab
            dispatchEvent('grabitemattempt');

            // if pointer up in this phase we cancel the grab
            pointerUpUnsub = addListener(document.documentElement, 'pointerup', handleGrabCancel);

            // if pointer move in this phase we cancel the grab
            pointerMoveUnsub = addListener(
                document.documentElement,
                'pointermove',
                handleGrabCancel
            );

            // will consider a drag attempt if no pointer-up within x ms
            clearTimeout(grabAttemptTimeout);
            grabAttemptTimeout = setTimeout(() => {
                handleGrab();
            }, grabTimeout);
        };

        /** Cancel grab interaction */
        const handleGrabCancel = (e: PointerEvent) => {
            update(e);

            // if pointermove, detect if moved
            if (
                e.type === 'pointermove' &&
                translation &&
                vectorLengthSquared(translation) < grabIgnoreMoveDistance * grabIgnoreMoveDistance
            ) {
                return;
            }

            // cancelled
            pointerUpUnsub && pointerUpUnsub();
            pointerMoveUnsub && pointerMoveUnsub();

            // cancel
            dispatchEvent('grabitemcancel');

            // clean up!
            reset();
        };

        /** Handle grabbing elements */
        const handleGrab = () => {
            // grab can no longer be cancelled
            pointerUpUnsub && pointerUpUnsub();
            pointerUpUnsub = addListener(document.documentElement, 'pointerup', handleDrop);

            // listen for move events
            pointerMoveUnsub && pointerMoveUnsub();
            pointerMoveUnsub = addListener(document.documentElement, 'pointermove', handleDrag);

            // prevent scroll on ios
            touchMoveUnsub && touchMoveUnsub();
            touchMoveUnsub = addListener(document.documentElement, 'touchmove', preventScroll, {
                passive: false,
            });

            // handles cancel event
            pointerCancelUnsub = addListener(
                document.documentElement,
                'pointercancel',
                handleDragCancel
            );

            // get unique id for this drag operation
            id = getUniqueId();

            // now dragging
            dispatchEvent('grabitem');
        };

        /** Handle cancelling of drag */
        const handleDragCancel = (e: PointerEvent) => {
            e.preventDefault();

            // make sure drag state is updated
            update(e);

            // dropped
            dispatchEvent('dragitemcancel');

            // clean up!
            reset();
        };

        /** Handle dragging elements */
        const handleDrag = debounce(
            (e: PointerEvent) => {
                // update current position
                update(e);

                // now dragging
                dispatchEvent('dragitem');
            },
            {
                beforeDebounce: (e: PointerEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                },

                // can't push forward events
                runLast: false,
            }
        );

        /** Handle drop element, or cancel grab action */
        const handleDrop = (e: PointerEvent) => {
            e.preventDefault();

            // make sure drag state is updated
            update(e);

            // dropped
            dispatchEvent('dropitem');

            // clean up!
            reset();
        };

        // listen to events
        const pointerUnsub = addListener(element, 'pointerdown', handleGrabAttempt);

        // unlisten when destroyed
        return () => {
            pointerUnsub();
        };
    };
}
