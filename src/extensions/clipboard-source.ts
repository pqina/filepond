import { addListener } from '../utils/dom.js';
import { createExtension } from './common/createExtension.js';

export interface ClipboardSourceOptions {
    /** Receives ClipboardEvent can then determine if it should be handled. Defaults to `() => true` */
    shouldHandlePaste: (e: ClipboardEvent) => boolean;
}

export const ClipboardSource = createExtension({
    name: 'ClipboardSource',
    type: 'source',
    props: {
        shouldHandlePaste: () => true,
    } as ClipboardSourceOptions,
    factory: ({ didSetProps }, pond) => {
        // shortcuts to filepond internal methods
        const { insertEntries } = pond;

        let removePasteListener: () => void;

        didSetProps(({ shouldHandlePaste }: ClipboardSourceOptions) => {
            /** Converts pasted entries into FilePondEntries and adds them to the list */
            const handlePaste = (e: ClipboardEvent) => {
                // allow filtering out this paste event
                if (!e.clipboardData || !shouldHandlePaste(e)) {
                    return;
                }

                // check if this paste action contains files
                const { items, files } = e.clipboardData;
                if ((!files || !files.length) && ![...items].some((item) => item.kind === 'file')) {
                    return;
                }

                // if we handle paste, we block other scripts from handling it
                e.preventDefault();
                e.stopPropagation();

                // load the files
                insertEntries({
                    src: e.clipboardData,
                    origin: 'clipboard',
                } as any);
            };

            // remove existing listener
            if (removePasteListener) {
                removePasteListener();
            }

            // start listening for paste event
            removePasteListener = addListener(document.documentElement, 'paste', handlePaste);
        });

        return {
            destroy: () => {
                if (removePasteListener) {
                    removePasteListener();
                }
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ClipboardSource: ClipboardSourceOptions;
    }
    interface defineFilePondOptions {
        ClipboardSource?: ClipboardSourceOptions;
    }
}
