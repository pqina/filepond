import type { Vector } from '../../utils/vector.js';
import type { DragEventDetail } from './dragarea.js';

import { dispatchCustomEvent } from '../../utils/dom.js';
import { addListener } from '../../utils/dom.js';
import { debounce } from '../../utils/debounce.js';
import { getUniqueId } from '../../utils/string.js';
import { vectorCreate } from '../../utils/vector.js';
import { isObjectValuesEqual } from '../../utils/object.js';
import { noop } from '../../utils/placeholder.js';

export interface DropEventDetail extends DragEventDetail {
    dataTransfer: DataTransfer;
}

interface DropAreaOptions {
    disabled?: boolean;
    ondragitem?: (obj: DropEventDetail) => void;
    ondragitemin?: (obj: DropEventDetail) => void;
    ondragitemout?: (obj: DropEventDetail) => void;
    ondropitem?: (obj: DropEventDetail) => void;
}

/** Target element can handle dropping of items */
export function droparea(options: DropAreaOptions = {}): (element: HTMLElement) => () => void {
    const { disabled } = options;

    return (element) => {
        // state
        let dragEnterCounter = 0;
        let id: string | undefined;
        let startPosition: Vector | undefined;
        let viewPosition: Vector | undefined;
        let translation: Vector | undefined;
        let vector: Vector | undefined;
        let previousEvent: { clientX: number; clientY: number; type: string } | undefined;

        /** Resets the state when cancelled or dropped */
        const reset = () => {
            dragEnterCounter = 0;
            startPosition = undefined;
            viewPosition = undefined;
            vector = undefined;
            translation = undefined;
        };

        /** Update the drag state based on passed pointer event */
        const update = (e: DragEvent) => {
            viewPosition = vectorCreate(e.clientX, e.clientY);

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

            previousEvent = {
                clientX: e.clientX,
                clientY: e.clientY,
                type: e.type,
            };
        };

        /** Dispatch events on main element */
        const dispatchEvent = (type: string, dataTransfer?: DataTransfer | null) => {
            if (disabled) {
                return;
            }

            const detail = {
                id,
                element: undefined,
                translation: { ...translation },
                offset: vectorCreate(0, 0),
                startPosition: { ...startPosition },
                viewPosition: { ...viewPosition },
                vector: { ...vector },
                dataTransfer,
            };

            // @ts-ignore call handler (if defined)
            (options[`on${type}`] ?? noop)(detail);

            // dispatch as event
            dispatchCustomEvent(element, type, {
                detail,
            });
        };

        /** Used to handle dragging of files */
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();

            // entered child element, still on drag area, exit
            if (dragEnterCounter++ > 0) {
                return;
            }

            // get unique id for this drag operation
            id = getUniqueId();

            // init translation
            translation = vectorCreate();

            // get grab attempt origin
            startPosition = vectorCreate(e.pageX, e.pageY);

            // update state
            update(e);

            // let others know
            dispatchEvent('dragitemin');
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();

            // left child element, still on drag area, exit
            if (--dragEnterCounter > 0) {
                return;
            }

            // update state
            update(e);

            // let others know
            dispatchEvent('dragitemout');
        };

        const handleDrag = debounce(
            (e: DragEvent) => {
                // don't update if event info is the same as previous event
                if (previousEvent && isObjectValuesEqual(previousEvent, e)) {
                    return;
                }

                // update state
                update(e);

                // let others know
                dispatchEvent('dragitem');
            },
            {
                beforeDebounce: (e: DragEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                },

                // can't push forward events
                runLast: false,
            }
        );

        const handleDrop = (e: DragEvent) => {
            e.preventDefault();

            // make sure drag state is updated
            update(e);

            // let others know
            dispatchEvent('dropitem', e.dataTransfer);

            // make sure everything is ready for next drag operation
            reset();
        };

        // used to easier add events
        const eventRoutes = {
            // enter and leave drop area
            dragenter: handleDragEnter,
            dragleave: handleDragLeave,

            // handle dragover only (drag pageX and pageY is 0 on Firefox)
            dragover: handleDrag,

            // a file was dropped
            drop: handleDrop,
        };

        // listen to events
        const eventSubscriptions = Object.entries(eventRoutes).map(([type, handler]) =>
            addListener(document.documentElement, type, handler)
        );

        // unlisten when destroyed
        return () => {
            eventSubscriptions.forEach((unsub) => unsub());
        };
    };
}
