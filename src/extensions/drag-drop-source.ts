import type { FilePondEntry } from '../types/index.js';
import { createExtension } from './common/createExtension.js';
import { addListener } from '../utils/dom.js';

export interface DragDropSourceOptions {
    /** Determines if a drag event is handled. Defaults to `() => true` */
    shouldHandleDrop?: (e: DragEvent) => boolean;
}

export const DragDropSource = createExtension(
    'DragDropSource',
    {
        shouldHandleDrop: () => true,
    } as DragDropSourceOptions,
    ({ didSetProps }, { insertEntries }) => {
        let removeDropListener: () => void;

        let removeDragOverListener: () => void;

        didSetProps(({ shouldHandleDrop }) => {
            /** This just needs to be prevent default to be able to handle drop */
            const handleDragOver = (e: DragEvent) => e.preventDefault();

            /** Gets the file tree info from the datatransfer entries */
            const handleDrop = async (e: DragEvent) => {
                // exit if no datatransfer
                if (!e.dataTransfer || !e.target) {
                    return;
                }

                // always ignore when hovering over file input elements
                const targetElement = e.target as HTMLInputElement;
                if (targetElement.type === 'file') {
                    return;
                }

                // allow preventing drop
                if (!shouldHandleDrop(e)) {
                    return;
                }

                // prevent handling of drop by browser
                e.preventDefault();

                // done loading!
                insertEntries({
                    src: e.dataTransfer,
                    origin: 'drop',
                } as FilePondEntry);
            };

            // clean up existing listeners
            if (removeDropListener) {
                removeDropListener();
            }

            if (removeDragOverListener) {
                removeDragOverListener();
            }

            // start listening for drag/drop events on page
            removeDropListener = addListener(document.documentElement, 'drop', handleDrop);
            removeDragOverListener = addListener(
                document.documentElement,
                'dragover',
                handleDragOver
            );
        });

        // expose api
        return {
            destroy: () => {
                removeDropListener && removeDropListener();
                removeDragOverListener && removeDragOverListener();
            },
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        DragDropSource: DragDropSourceOptions;
    }
    interface defineFilePondOptions {
        DragDropSource: DragDropSourceOptions;
    }
}
