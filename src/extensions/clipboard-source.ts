import { addListener } from '../utils/dom.js';
import { createExtension } from './common/createExtension.js';

export interface ClipboardSourceOptions {
    /** Receives ClipboardEvent can then determine if it should be handled. Defaults to `() => true` */
    shouldHandlePaste: (e: ClipboardEvent) => boolean;

    /** Set to true to temporarily prevent adding of files */
    preventAddEntries?: boolean;
}

export const ClipboardSource = createExtension({
    name: 'ClipboardSource',
    type: 'source',
    props: {
        shouldHandlePaste: () => true,
        preventAddEntries: undefined,
    } as ClipboardSourceOptions,
    factory: ({ props, didSetProps }, { insertEntries, setExtensionState }) => {
        let removePasteListener: () => void;

        /** Converts pasted entries into FilePondEntries and adds them to the list */
        function handlePaste(e: ClipboardEvent) {
            const { shouldHandlePaste, preventAddEntries } = props;

            // currently not allowed to add entries
            if (preventAddEntries) {
                return;
            }

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
        }

        didSetProps(() => {
            // remove existing listener
            removePasteListener?.();

            // start listening for paste event
            removePasteListener = addListener(document.documentElement, 'paste', handlePaste);

            // set source type
            setExtensionState({
                source: {
                    type: 'paste',
                },
            });
        });

        return {
            destroy: () => {
                removePasteListener?.();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ClipboardSource: ClipboardSourceOptions;
    }
    interface DefineFilePondOptions {
        ClipboardSource?: ClipboardSourceOptions;
    }
}
