import type { FilePondEntry } from '../types/index.js';
import type { FilePondEntryListOptions } from '../elements/FilePondEntryList/types.js';
import { createExtension } from './common/createExtension.js';
import { addListener } from '../utils/dom.js';
import { COMPONENT_PROPS } from '../elements/FilePondEntryList/index.js';

export interface EntryListViewOptions extends FilePondEntryListOptions {
    /** Set to true to temporarily prevent dropping of files, this will retain the source state on the extension */
    preventAddEntries?: boolean;
}

// This is a proxy extension, it facilitates communication between the FilePondEntryList element and the FilePond core
export const EntryListView = createExtension({
    name: 'EntryListView',
    type: 'view',
    props: {
        // set default props, we need to do this because extension manager uses it to determine if it can propagate props to this extension
        ...COMPONENT_PROPS.reduce((defaults: { [key: string]: any }, key) => {
            defaults[key] = undefined;
            return defaults;
        }, {}),

        // element reference
        element: undefined,

        // this toggles drop on the element
        preventAddEntries: undefined,
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
            setExtensionState,
            getEntryExtensionState,
            setEntryExtensionState,
        } = pond;

        let currentElement: any;
        let unsubConnectListener: any;

        didSetProps(
            ({
                element,
                preventAddEntries,
                ...viewProps
            }: EntryListViewOptions & { element: HTMLElement }) => {
                // can't run without an element reference
                if (!element) {
                    return;
                }

                // remember new element
                currentElement = element;

                // update props on the element
                const { drop } = viewProps;
                Object.assign(currentElement, {
                    ...viewProps,
                    drop: drop && !preventAddEntries,
                });

                // reconnect element/app for first time
                connect();

                // setup auto-reconnect if element/app when was disconnected/destroyed
                unsubConnectListener?.();
                unsubConnectListener = addListener(currentElement, 'connected', () => {
                    connect();
                });

                // toggle drop capability if available
                setExtensionState({
                    source: drop
                        ? {
                              type: 'drop',
                          }
                        : undefined,
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
                unsubConnectListener?.();
                unsubUpdateEntries?.();
                unsubAddEntry?.();
                unsubRemoveEntry?.();
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
