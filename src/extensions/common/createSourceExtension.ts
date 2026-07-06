import type { EntryTreeOn } from '../../core/entryTree.js';
import type { ExtensionManagerOn } from '../../core/extensionManager.js';
import type { EntrySource, ExtensionContext, ExtensionOptions } from '../../types/index.js';
import { addListener, getAsElement, setAttributes } from '../../utils/dom.js';
import { passthrough } from '../../utils/placeholder.js';
import { pubsub } from '../../utils/pubsub.js';
import { isFunction } from '../../utils/test.js';
import { createExtension, type Extension } from './createExtension.js';

interface SourceExtensionEvents {
    dialogOpen: HTMLElement;
    dialogClosed: HTMLElement;
}

export type SourceExtensionOn = <EventName extends keyof SourceExtensionEvents>(
    event: EventName,
    callback: (detail: SourceExtensionEvents[EventName]) => void
) => () => void;

type SourceExtensionResolvedOptions = SourceExtensionOptions & {
    /** Name to use for getting input element value */
    inputAttributes: {
        name: string;
    };
};

type SourceExtensionResolvedProps<Props extends object = SourceExtensionOptions> =
    SourceExtensionResolvedOptions & Required<Props>;

interface SourceExtensionState<Props extends object = SourceExtensionOptions> extends Omit<
    ExtensionOptions,
    'props' | 'didSetProps'
> {
    props: SourceExtensionResolvedProps<Props>;
    didSetProps: (cb: (props: SourceExtensionResolvedProps<Props>) => void) => void;
}

type SourceFactory<Props extends object = SourceExtensionOptions> = (
    instance: SourceExtensionState<Props>,
    api: ExtensionContext & {
        setExtensionSourceState: (newSourceState: { [key: string]: any }) => void;
        on: EntryTreeOn & ExtensionManagerOn & SourceExtensionOn;
    }
) => SourceExtensionFunctions;

export type SourceExtensionCreateSourceElementFunction = () => HTMLElement;
export type SourceExtensionDestroyFunction = () => void;

interface SourceExtensionFunctions {
    createSourceElement: SourceExtensionCreateSourceElementFunction;
    destroy?: SourceExtensionDestroyFunction;
}

export interface SourceExtensionOptions {
    /** Where to add new files, defaults to index `0` */
    insertIndex?: number;

    /** Label to use for source button, defaults to `undefined` */
    sourceLabel?: string;

    /** Icon to use for source button, defaults to `undefined` */
    sourceIcon?: string;

    /** Icon to use for source button when source in error state, defaults to `undefined` */
    sourceIconError?: string;

    /** The type of source */
    sourceType?: string;

    /** The element to add */
    sourceElement?: HTMLElement;

    /** Name to use for getting input element value */
    inputAttributes?: {
        [key: string]: string | boolean | number;
    };

    /** Hook into submit */
    beforeInsertSource: (options: { src: any }) => EntrySource | false | undefined | null;
}

export interface CreateSourceExtensionOptions<Props extends object = SourceExtensionOptions> {
    /** The name of the extension */
    name: string;

    /** The default properties available to this extension */
    props: Props & Partial<SourceExtensionOptions>;

    /** The factory function that runs when the extension is created */
    factory: SourceFactory<Props>;
}

export function createSourceExtension<Props extends object = SourceExtensionOptions>(
    options: CreateSourceExtensionOptions<Props>
): Extension {
    const { name: extensionName, props: sourceProps, factory: sourceFactory } = options;

    return createExtension({
        name: extensionName,
        type: 'source',
        props: {
            // by default insert to top of list
            insertIndex: 0,

            // source label and icon locale keys to use in sourcelist
            sourceIcon: undefined,
            sourceIconError: undefined,
            sourceLabel: undefined,
            sourceType: 'select',

            // default input name to use
            inputAttributes: {
                name: 'value',
                required: true,
                autofocus: '',
                autocomplete: 'off',
            },

            // overwrite with custom props
            ...sourceProps,
        },
        factory: (state, pond) => {
            const { pub, on } = pubsub();

            const { didSetProps, props } = state as SourceExtensionState<Props>;

            const { setExtensionState, getExtensionState, insertEntries } = pond;

            const { createSourceElement, destroy } = sourceFactory(
                state as SourceExtensionState<Props>,
                {
                    ...pond,
                    setExtensionSourceState: (newSourceState: any) => {
                        const currenSourceState = getExtensionState()?.source;
                        pond.setExtensionState({
                            source: {
                                ...currenSourceState,
                                ...newSourceState,
                            },
                        });
                    },
                    // @ts-ignore listen for events
                    on: (event, cb) => {
                        // handle dialog events
                        if (event.startsWith('dialog')) {
                            return on(event, cb);
                        }

                        // @ts-ignore
                        return pond.on(event, cb);
                    },
                }
            );

            // current element state
            let currentButtonElement: HTMLButtonElement;
            let currentSourceInput: HTMLElement;
            let currentDialog: HTMLDialogElement | HTMLElement | null;
            let unsubSubmitListener: (() => void) | null;

            // set button
            didSetProps(({ sourceIcon: icon, sourceLabel: label, sourceType: type }) => {
                // This enables the source button and requests using the icon and label in assets
                setExtensionState({
                    // is adds source button
                    source: {
                        type,
                        label,
                        icon,
                        onopen: handleOpen,
                        onopened: handleOpened,
                        onclosed: handleClosed,
                    },
                });
            });

            function handleSubmit(e: SubmitEvent & { target: HTMLFormElement }) {
                const { inputAttributes, insertIndex, beforeInsertSource } = props;
                const { target: form } = e;

                // get form data
                const fd = form ? new FormData(form) : null;
                if (!fd) {
                    // don't submit the form
                    e.preventDefault();
                    throw new Error('No form reference');
                }

                // get form field value
                const inputSrc = fd.get(inputAttributes.name) as EntrySource;
                if (!inputSrc) {
                    // don't submit the form
                    e.preventDefault();
                    throw new Error(`No value for input with name "${inputAttributes.name}"`);
                }

                // allow dev to manipulate result
                const src = isFunction(beforeInsertSource)
                    ? beforeInsertSource({ src: inputSrc })
                    : inputSrc;
                if (!src) {
                    e.preventDefault();
                    return;
                }

                // add the entry at default insert index
                insertEntries({ src }, insertIndex);
            }

            function handleOpen(dialog: HTMLDialogElement) {
                const { inputAttributes } = props;

                // remember dialog target or use current target if defined
                currentDialog = dialog;

                // create element
                currentSourceInput = currentSourceInput || createSourceElement();

                // set default attributes
                setAttributes(currentSourceInput, inputAttributes);

                // create interface
                currentDialog.append(currentSourceInput);

                // when the element was appended
                pub('dialogOpen', dialog);

                // handle form submit so we can add data
                unsubSubmitListener = addListener(currentDialog, 'submit', handleSubmit);
            }

            function handleOpened(dialog: HTMLDialogElement) {
                // when the element was appended
                pub('dialogOpened', dialog);
            }

            function handleClosed() {
                // right before dialog is cleaned up
                pub('dialogClosed', currentDialog);

                // clean up submit listener
                unsubSubmitListener?.();
                unsubSubmitListener = null;

                // we've got the value, let's reset the form
                currentDialog?.querySelector('form')?.reset();

                // remove dialog contents
                currentSourceInput.remove();

                // reset target
                currentDialog = null;
            }

            return {
                destroy() {
                    // clean up children
                    destroy?.();

                    // clean up local
                    unsubSubmitListener?.();
                },
            };
        },
    });
}
