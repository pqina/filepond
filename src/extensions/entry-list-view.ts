import type { FilePondEntry } from '../types/index.js';
import type { FilePondEntryListOptions } from '../elements/FilePondEntryList/types.js';
import { createExtension } from './common/createExtension.js';
import { COMPONENT_PROPS } from '../elements/FilePondEntryList/index.js';
import { addListener } from '../utils/dom.js';

export interface EntryListViewOptions extends FilePondEntryListOptions {}

const props = COMPONENT_PROPS.reduce((res: { [key: string]: any }, key) => {
    res[key] = undefined;
    return res;
}, {});

export const EntryListView = createExtension({
    name: 'EntryListView',
    type: 'view',
    props: {
        // props available on this element
        ...props,

        // element reference
        element: undefined,
    },
    factory: (state, pond) => {
        const { didSetProps } = state;

        const {
            on,
            getEntries,
            setEntries,
            pushTask,
            abortTask,
            insertEntries,
            removeEntries,
            updateEntry,
            getEntryExtensionState,
            setEntryExtensionState,
        } = pond;

        let currentElement: any;
        let unsubConnectListener: any;

        didSetProps(
            ({ element, ...viewProps }: EntryListViewOptions & { element: HTMLElement }) => {
                // can't run without an element reference
                if (!element) {
                    return;
                }

                // remember new element
                currentElement = element;

                // update props on the element
                Object.assign(currentElement, {
                    ...viewProps,
                });

                // reconnect element/app for first time
                connect();

                // setup auto-reconnect if element/app when was disconnected/destroyed
                unsubConnectListener?.();
                unsubConnectListener = addListener(currentElement, 'connected', () => {
                    connect();
                });
            }
        );

        function connect() {
            // set callbacks
            currentElement.setSetEntriesCallback(setEntries);
            currentElement.setInsertEntriesCallback(insertEntries);
            currentElement.setRemoveEntriesCallback(removeEntries);
            currentElement.setUpdateEntryCallback(updateEntry);
            currentElement.setSetEntryExtensionStateCallback(setEntryExtensionState);
            currentElement.setGetEntryExtensionStateCallback(getEntryExtensionState);
            currentElement.setPushTaskCallback(pushTask);
            currentElement.setAbortTaskCallback(abortTask);

            // pass entries to view
            currentElement.onSetEntries(getEntries());
        }

        function handleRemoveEntry(detail: { entry: FilePondEntry; index: number[] }) {
            currentElement?.onRemoveEntry(detail);
        }

        function handleInsertEntry(detail: FilePondEntry) {
            currentElement?.onInsertEntry(detail);
        }

        function handleUpdateEntries(detail: FilePondEntry[]) {
            currentElement?.onSetEntries(detail);
        }

        // link entry updates to view
        const unsubAddEntry = on('insertEntry', handleInsertEntry);
        const unsubRemoveEntry = on('removeEntry', handleRemoveEntry);
        const unsubUpdateEntries = on('updateEntries', handleUpdateEntries);

        return {
            destroy() {
                if (unsubConnectListener) {
                    unsubConnectListener();
                }

                if (unsubUpdateEntries) {
                    unsubUpdateEntries();
                }

                if (unsubAddEntry) {
                    unsubAddEntry();
                }

                if (unsubRemoveEntry) {
                    unsubRemoveEntry();
                }
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        EntryListView: EntryListViewOptions;
    }
    interface DefineFilePondOptions {
        EntryListView?: EntryListViewOptions;
    }
}
