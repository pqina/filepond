import type { FilePondEntry } from '../types/index.js';
import { getAsElement } from '../utils/dom.js';
import { isFileEntry } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';
import { debounce } from '../utils/debounce.js';
import { warn } from '../common/console.js';

export interface TextInputStoreOptions {
    /** An HTML Element or a QueryString selector */
    element?: HTMLInputElement | string;
}

export const TextInputStore = createExtension(
    'TextInputStore',
    {
        element: undefined,
    } as TextInputStoreOptions,
    ({ props, didSetProps }, { on }) => {
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

        // when an entry is updated we check if it's a Blob, if so we queue our Blob to File task, else we ignore
        const unsubUpdateEntry = on('updateEntries', debounce(handleUpdateEntries));

        return {
            destroy: () => {
                unsubUpdateEntry();
            },
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        TextInputStore: TextInputStoreOptions;
    }
}
