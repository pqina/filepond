import type { FilePondEntry } from '../types/index.js';
import { addListener, getAsElement } from '../utils/dom.js';
import { createExtension } from './common/createExtension.js';
import { noop } from '../utils/placeholder.js';
import { warn } from '../common/console.js';
import { mapTree } from '../utils/tree.js';

export interface FileInputSourceOptions {
    /** An HTMLInputElement or a QueryString selector */
    element?: HTMLInputElement | string;

    /** Should we reset the input every time a `FileList` is added */
    resetFilesOnAdd?: boolean;

    /** Where to add new files, defaults to index `0` */
    insertIndex?: number;
}

export const FileInputSource = createExtension({
    name: 'FileInputSource',
    type: 'source',
    props: {
        element: undefined,
        resetFilesOnAdd: false,
        insertIndex: 0,

        // source label and icon to use
        sourceIcon: 'device',
        sourceLabel: undefined,
    } as FileInputSourceOptions,
    factory: ({ didSetProps, props }, { insertEntries, removeEntries, setExtensionState }) => {
        /* Unsubscribe from input events */
        let removeChangeListener: (() => void) | undefined;
        let currentElement: HTMLInputElement;
        let currentEntries: FilePondEntry[];
        let currentObserver: MutationObserver;

        // handle file input changes
        function handleChange() {
            const { insertIndex, resetFilesOnAdd } = props;

            // if current value, request removal
            if (currentEntries) {
                removeEntries(currentEntries);
            }

            //  Add Origin to entries in list
            const entries = mapTree(Array.from(currentElement.files ?? []), (file: File) => ({
                src: file,
                origin: 'input',
            })) as FilePondEntry[];

            // store entries so we can remove later
            currentEntries = entries;

            // done loading files
            insertEntries(entries, insertIndex > -1 ? insertIndex : undefined);

            // this clears the file input when a file is 'transferred' to filepond
            if (!resetFilesOnAdd) {
                return;
            }

            // reset by assigning empty data transfer filelist
            currentElement.files = new DataTransfer().files;
        }

        function syncExtensionState() {
            const { sourceLabel: label, sourceIcon: icon } = props;

            // we use data-readonly as readonly is not available on file input
            const canBrowse = !currentElement.hasAttribute('data-readonly');

            setExtensionState({
                source: canBrowse
                    ? {
                          type: 'browse',
                          label,
                          icon,
                          onclick: () => {
                              currentElement.click();
                          },
                      }
                    : undefined,
            });
        }

        didSetProps(({ element: elementOrQuerySelector }) => {
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

            if (currentElement !== element) {
                // clean up
                removeChangeListener?.();
                removeChangeListener = undefined;

                // we need to perhaps remove the 'browse' extension whnen the file input is set to readonly (nobrowse mode)
                if (!currentObserver) {
                    currentObserver = new MutationObserver(() => {
                        syncExtensionState();
                    });
                }
                currentObserver.disconnect();
                currentObserver.observe(element, { attributeFilter: ['data-readonly'] });

                // update element
                currentElement = element;
            }

            // start listening for events
            removeChangeListener = currentElement
                ? addListener(currentElement, 'change', handleChange)
                : noop;

            // if already contains file wait one tick
            if (!currentElement.files?.length) {
                Promise.resolve().then(handleChange);
            }

            syncExtensionState();
        });

        return {
            destroy() {
                currentObserver?.disconnect();
                removeChangeListener?.();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        FileInputSource: FileInputSourceOptions;
    }
    interface DefineFilePondOptions {
        FileInputSource?: FileInputSourceOptions;
    }
}
