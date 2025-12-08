import type { FilePondEntrySource } from '../types/index.js';
import { createExtension } from './common/createExtension.js';
import { h, addListener, getAsElement } from '../utils/dom.js';

export interface DropboxSourceOptions {
    script?: string;
    appKey?: string;
    target?: string | HTMLElement;
    buttonLabel?: string;
    dropboxOptions?: { [key: string]: any };
}

export const DropboxSource = createExtension(
    'DropboxSource',
    {
        script: 'https://www.dropbox.com/static/api/2/dropins.js',
        appKey: undefined,
        target: undefined,
        buttonLabel: 'Browse Dropbox',
        dropboxOptions: undefined,
    } as DropboxSourceOptions,
    ({ didSetProps }, { insertEntries }) => {
        let s: HTMLScriptElement;

        let unlisten: () => void;

        let browseButtonRef: Element;

        // TODO: fix for multiple didSetProps calls (now keeps adding script)

        didSetProps(({ script, appKey, target, buttonLabel, dropboxOptions }) => {
            /** Dropbox Script ref */
            let Dropbox: any;

            // Embed script
            if (!s) {
                s = h('script', {
                    type: 'text/javascript',
                    src: script,
                    id: 'dropboxjs',
                    'data-app-key': appKey,
                    onload: () => {
                        //@ts-ignore
                        Dropbox = window.Dropbox;
                    },
                }) as HTMLScriptElement;
                document.head.append(s);
            }

            /** Converts Dropbox item to FilePondEntry */
            function mapDropboxItemToFilePondEntry(item: any): FilePondEntrySource {
                return {
                    src: item.link,
                    name: item.name,
                    origin: 'remote',
                };
            }

            // This opens the Dropbox dialog
            function createDropboxDialog(cb: (args: any[]) => void) {
                // we need an aborted bool to prevent the Dropbox dialog from calling the success cb multiple times, this happens when the `Dropbox.choose` factory is called multiple times
                let aborted = false;

                Dropbox.choose({
                    // add custom options
                    ...dropboxOptions,

                    // user submitted dialog selection
                    success: (dropboxFiles: any[]) => {
                        if (aborted) {
                            return;
                        }

                        cb(dropboxFiles.map(mapDropboxItemToFilePondEntry));
                    },

                    // user closed dialog
                    cancel: () => {
                        if (aborted) {
                            return;
                        }
                        cb([]);
                    },

                    // need direct link to download the file
                    linkType: 'direct',
                });

                return {
                    abort: () => (aborted = true),
                };
            }

            // Add browse button
            let activeDialog: {
                abort: () => boolean;
            };
            function handleBrowseButtonClick() {
                // abort current dialog
                if (activeDialog) {
                    activeDialog.abort();
                }

                // open dialog
                activeDialog = createDropboxDialog(insertEntries);
            }

            const browseButton =
                getAsElement(target) ||
                h('button', {
                    textContent: buttonLabel,
                });
            unlisten = addListener(browseButton, 'click', handleBrowseButtonClick);

            !browseButton.parentNode && document.body.append(browseButton);

            // so we can remove the browsebutton
            if (!target) {
                browseButtonRef = browseButton;
            }
        });

        return {
            destroy: () => {
                // clean up browse listener
                unlisten();

                // if no target supplied remove browse button from DOM
                browseButtonRef && browseButtonRef.remove();
            },
        };
    }
);

declare module '../index.js' {
    interface FilePondElement {
        DropboxSource: DropboxSourceOptions;
    }
    interface defineFilePondOptions {
        DropboxSource: DropboxSourceOptions;
    }
}
