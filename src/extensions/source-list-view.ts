import type { ExtensionState, FilePondEntry } from '../types/index.js';
import { createExtension } from './common/createExtension.js';
import { addListener } from '../utils/dom.js';
import type {
    FilePondSourceListOptions,
    FilePondSourceListSource,
} from '../elements/FilePondSourceList/index.js';

// the `sources` prop cannot be set directly, it's derived from the loaded extensions
export interface SourceListViewOptions extends Omit<FilePondSourceListOptions, 'sources'> {}

// This is a proxy extension, it facilitates communication between the FilePondSourceList element and the extensions added to FilePond core. It reads the current source extensions, and adds them to the `sources` property which it updates on the target element.
export const SourceListView = createExtension({
    name: 'SourceListView',
    type: 'view',
    props: {
        // what element the extension will set the dynamic source list to
        element: undefined,

        // filters the sources, this is used to hide the browse button when no other sources are present
        filterSources: (sources: { type: string }[]) => {
            if (sources.length === 1 && sources[0].type === 'browse') {
                return [];
            }
            return sources;
        },
    },
    factory: ({ props, didSetProps }, { on }) => {
        let currentSources: FilePondSourceListSource[];
        let currentElement: any;
        let unsubConnectListener: any;

        didSetProps(
            ({ element, ...viewProps }: SourceListViewOptions & { element: HTMLElement }) => {
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
            // set sources
            currentElement.sources = currentSources || [];
        }

        function handleUpdateExtensionStates(detail: { [key: string]: any }) {
            const { filterSources } = props;

            // loop over extension and create source list
            currentSources = Object.values(detail)
                .filter(
                    (extensionState) =>
                        extensionState?.source &&
                        (extensionState?.source.icon || extensionState?.source.label)
                )
                .map((extensionState) => extensionState?.source) as FilePondSourceListSource[];

            // no element defined yet
            if (!currentElement) {
                return;
            }

            // update currentElement sources if it's defined
            currentElement.sources = filterSources(currentSources);
        }

        const unsubUpdateExtensionState = on('updateExtensionState', handleUpdateExtensionStates);

        return {
            destroy() {
                unsubConnectListener?.();
                unsubUpdateExtensionState?.();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        SourceListView: SourceListViewOptions;
    }
    interface DefineFilePondOptions {
        SourceListView?: SourceListViewOptions;
    }
}
