import type { FilePondEntry } from '../types/index.js';
import { getAsElement } from '../utils/dom.js';
import { isFileEntry } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';
import { debounce } from '../utils/debounce.js';
import { warn } from '../common/console.js';

export interface TextInputStoreOptions {
    /** An HTMLInputElement or a QueryString selector */
    element?: HTMLInputElement | string;
}

export const TextInputStore = createExtension({
    name: 'TextInputStore',
    type: 'store',
    props: {
        element: undefined,
    } as TextInputStoreOptions,
    factory: ({ props, didSetProps }, { on }) => {
        // the element to store data in
        let targetElement;

        // getters / setters
        didSetProps(({ element: elementOrQueryString }: TextInputStoreOptions) => {
            // get element reference
            targetElement = getAsElement(elementOrQueryString) as HTMLInputElement;

            // reset
            if (targetElement.type !== 'text') {
                targetElement = undefined;
            }

            // warn element not found
            if (!targetElement || targetElement.type !== 'text') {
                warn(`TextInputStore: HTMLInputElement not found ${elementOrQueryString}`);
            }
        });

        function handleUpdateEntries(entries: FilePondEntry[]) {
            // no target element defined, let's exit
            const { targetElement } = props;
            if (!targetElement) {
                return;
            }

            // if not all files loaded reset value
            if (!entries.every(isFileEntry)) {
                return;
            }

            // set files list to target element, filter out entries in error state
            const filteredEntries = entries.filter((entry) => {
                return !Object.values(entry.extension ?? {}).some((extension) => {
                    return extension.status?.type === 'error';
                });
            });

            // if no entries, we clear the value so input validation errors trigger correctly
            targetElement.value = filteredEntries.length ? JSON.stringify(filteredEntries) : '';
        }

        const unsubUpdateEntries = on('updateEntries', debounce(handleUpdateEntries));

        return {
            destroy: () => {
                unsubUpdateEntries();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        TextInputStore: TextInputStoreOptions;
    }
    interface DefineFilePondOptions {
        TextInputStore?: TextInputStoreOptions;
    }
}
