import { stringReplaceVariables } from '../elements/common/string.js';
import type { Locale } from '../types/index.js';
import { getAsElement } from '../utils/dom.js';
import { upperCaseFirstLetter } from '../utils/string.js';
import { isString } from '../utils/test.js';
import { createExtension } from './common/createExtension.js';

export const SourceDescriptionView = createExtension({
    name: 'SourceDescriptionView',
    type: 'view',
    props: {
        // uses the locale object for translations
        locale: undefined,

        // maxFiles is used to determine plurality in the label
        maxFiles: undefined,

        // allowed keys, we can extend this list if we want to build more complex labels, this filters out for example the "paste" action
        allowedSourceActions: ['browse', 'drop', 'select'],
    },
    factory: ({ props, didSetProps }, { on }) => {
        let currentElement: HTMLElement;
        let currentSources: string[] = [];

        didSetProps(({ element: elementOrQuerySelector }) => {
            // exit
            if (!elementOrQuerySelector) {
                return;
            }

            // get element reference
            currentElement = getAsElement(elementOrQuerySelector) as HTMLInputElement;

            // set origins
            syncDescription();
        });

        function getDescriptionKey(origins: string[]) {
            return `description${origins.sort().map(upperCaseFirstLetter).join('')}`;
        }

        function syncDescription() {
            const { locale, maxFiles, allowedSourceActions } = props;

            if (!currentElement || !currentSources.length) {
                return;
            }

            const descriptionLocaleKey = getDescriptionKey(
                currentSources.filter((source) => allowedSourceActions.includes(source))
            );

            const descriptionLocaleDate = {
                maxFilesUnit: 'unitFiles',
                maxFiles: maxFiles,
            };

            const label = locale
                ? stringReplaceVariables(
                      locale[descriptionLocaleKey],
                      descriptionLocaleDate,
                      locale
                  ) || ''
                : descriptionLocaleKey;

            // set visual label
            currentElement.innerHTML = label
                .replaceAll('[', '<button type="button" data-browse>')
                .replaceAll(']', '</button>');
        }

        function handleUpdateExtensionStates(detail: { [key: string]: any }) {
            // loop over extension and create source list
            currentSources = Array.from(
                new Set(
                    Object.values(detail)
                        .filter(
                            (extensionState) =>
                                extensionState?.source && isString(extensionState?.source?.type)
                        )
                        .map((extensionState) => extensionState?.source?.type) as string[]
                )
            );

            // no element defined yet
            if (!currentElement) {
                return;
            }

            //
            syncDescription();
        }

        const unsubUpdateExtensionState = on('updateExtensionState', handleUpdateExtensionStates);

        return {
            destroy() {
                unsubUpdateExtensionState?.();
            },
        };
    },
});
