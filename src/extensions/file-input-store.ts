import type { FilePondEntry } from '../types/index.js';
import { debounce } from '../utils/debounce.js';
import { createExtension } from './common/createExtension.js';
import { getAsElement, setFileInputFilesFromEntries } from '../utils/dom.js';
import { isFileEntry } from '../utils/test.js';
import { warn } from '../common/console.js';

export interface FileInputStoreOptions {
    /** An HTML Element or a QueryString selector */
    element?: HTMLInputElement | string;

    elementUpdateEvent?: string;
}

export const FileInputStore = createExtension({
    name: 'FileInputStore',
    type: 'store',
    props: {
        element: undefined,

        // the event fired on the element when it's updated, defaults to 'update'
        elementUpdateEvent: undefined,
    } as FileInputStoreOptions,
    factory: ({ props, didSetProps }, { on }) => {
        /** The element to store data in */
        let targetElement: HTMLInputElement | null;

        // getters / setters
        didSetProps(({ element: elementOrQueryString }) => {
            // get element reference
            targetElement = getAsElement(elementOrQueryString) as HTMLInputElement;

            // reset
            if (targetElement?.type !== 'file') {
                targetElement = null;
            }

            // warn element not found
            if (elementOrQueryString && (!targetElement || targetElement.type !== 'file')) {
                warn(`FileInputStore: HTMLInputElement not found ${elementOrQueryString}`);
            }
        });

        function handleUpdateEntries(entries: FilePondEntry[]) {
            // no target element defined, let's exit
            if (!targetElement) {
                return;
            }

            // if not all files loaded reset value
            if (!entries.every(isFileEntry)) {
                return;
            }

            // event to fire on input update
            const { elementUpdateEvent } = props;

            // set files list to target element, filter out entries in error state
            setFileInputFilesFromEntries(
                targetElement,

                // @ts-ignore we know these are file entries
                entries.filter((entry) => {
                    if (!entry.extension) {
                        return true;
                    }

                    return !Object.values(entry.extension).some((extension) => {
                        return extension.status?.type === 'error';
                    });
                }),
                {
                    customEventType: elementUpdateEvent,
                }
            );
        }

        // when an entry is updated we check if it's a Blob, if so we queue our Blob to File task, else we ignore
        const unsubUpdateEntry = on('updateEntries', debounce(handleUpdateEntries));

        return {
            destroy: () => {
                unsubUpdateEntry();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        FileInputStore: FileInputStoreOptions;
    }
    interface defineFilePondOptions {
        FileInputStore?: FileInputStoreOptions;
    }
}
