import type { FilePondEntry, FilePondFileEntry } from '../types/index.js';
import { addListener, getAsElement } from '../utils/dom.js';
import { createExtension } from './common/createExtension.js';
import { noop } from '../utils/placeholder.js';
import { warn } from '../common/console.js';
import { mapTree } from '../utils/tree.js';

export interface FileInputSourceOptions {
    /** An HTML Element or a QueryString selector */
    element?: HTMLInputElement | string;

    resetFilesOnAdd?: boolean;

    insertIndex?: number;
}

export const FileInputSource = createExtension(
    'FileInputSource',
    { element: undefined, resetFilesOnAdd: false, insertIndex: 0 } as FileInputSourceOptions,
    ({ didSetProps }, pond) => {
        const { insertEntries, removeEntries } = pond;

        /* Unsubscribe from input events */
        let removeChangeListener: (() => void) | undefined;

        didSetProps(({ element: elementOrQuerySelector, resetFilesOnAdd, insertIndex }) => {
            // exit
            if (!elementOrQuerySelector) {
                return;
            }

            // get element reference
            const element = getAsElement(elementOrQuerySelector) as HTMLInputElement;

            // test if element supplied
            if (!element) {
                warn(`FileInputSource: HTMLInputElement not found ${elementOrQuerySelector}`);
            }

            // already listening, clean up
            if (removeChangeListener) {
                removeChangeListener();
                removeChangeListener = undefined;
            }

            /** So we can request to remove when new value is assigned */
            let currentEntries: FilePondEntry[];

            // handle file input changes
            function handleChange() {
                // if current value, request removal
                if (currentEntries) {
                    removeEntries(currentEntries);
                }

                //  Add Origin to entries in list
                const entries = mapTree(Array.from(element.files ?? []), (file: File) => ({
                    src: file,
                    origin: 'input',
                })) as FilePondFileEntry[];

                // store entries so we can remove later
                currentEntries = entries;

                // done loading files
                insertEntries(entries, insertIndex > -1 ? insertIndex : undefined);

                // this clears the file input when a file is 'transferred' to filepond
                if (!resetFilesOnAdd) {
                    return;
                }

                // reset by assigning empty data transfer filelist
                element.files = new DataTransfer().files;
            }

            // start listening for events
            removeChangeListener = element ? addListener(element, 'change', handleChange) : noop;

            // if already contains file wait one tick
            if (element && element.files?.length) {
                Promise.resolve().then(handleChange);
            }
        });

        return {
            destroy() {
                if (removeChangeListener) {
                    removeChangeListener();
                }
            },
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        FileInputSource: FileInputSourceOptions;
    }
    interface defineFilePondOptions {
        FileInputSource: FileInputSourceOptions;
    }
}
