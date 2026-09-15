import type { EntryTreeOn } from '../../core/entryTree.js';
import type { ExtensionManagerOn } from '../../core/extensionManager.js';
import type { NodeData } from '../../elements/common/nodeTree.js';
import type {
    EntrySource,
    ExtensionContext,
    ExtensionOptions,
    FilePondEntrySource,
    Locale,
    TemplateNode,
} from '../../types/index.js';
import { arrayRemoveFalsy } from '../../utils/array.js';
import { addListener, setAttributes } from '../../utils/dom.js';
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

export type SourceExtensionCreateSourceTemplateFunction = (inputAttributes: {
    [key: string]: string | boolean | number;
}) => TemplateNode[];
export type SourceExtensionDestroyFunction = () => void;

interface SourceExtensionFunctions {
    createSourceTemplate: SourceExtensionCreateSourceTemplateFunction;
    destroy?: SourceExtensionDestroyFunction;
}

export interface SourceExtensionOptions {
    /** Locale to use */
    locale?: Locale;

    /** Is this source disabled */
    disabled?: boolean;

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
    beforeInsertSource?: (src: EntrySource, props: any) => EntrySource | false | undefined | null;
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
            // disabled state
            disabled: undefined,

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
                autofocus: true,
                autocomplete: 'off',
            },

            // overwrite with custom props
            ...sourceProps,
        },
        factory: (state, pond) => {
            const { pub, on } = pubsub();

            const { didSetProps, props } = state as SourceExtensionState<Props>;

            const { setExtensionState, getExtensionState, insertEntries } = pond;

            const { createSourceTemplate, destroy } = sourceFactory(
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
            let currentTemplate: TemplateNode[];
            let unsubSubmitListener: (() => void) | null;
            let unsubChangeListener: (() => void) | null;

            interface DialogContext {
                dialog: HTMLDialogElement;
                setDialogContentTemplate: (template: TemplateNode[], data: NodeData) => void;
                setDialogImportButtonCount: (count: number) => void;
            }

            // set button
            didSetProps(({ sourceIcon: icon, sourceLabel: label, sourceType: type, disabled }) => {
                // This enables the source button and requests using the icon and label in assets
                setExtensionState({
                    // is adds source button
                    source: {
                        type,
                        label,
                        icon,
                        disabled,
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
                const values = fd.getAll(inputAttributes.name) as EntrySource[];
                if (!values.length) {
                    // don't submit the form
                    e.preventDefault();
                    throw new Error(
                        `No values found for input with name "${inputAttributes.name}"`
                    );
                }

                // allow dev to manipulate result
                const sources = arrayRemoveFalsy(
                    values.map((value) => {
                        if (isFunction(beforeInsertSource)) {
                            let updatedValue = beforeInsertSource(value, props);
                            if (!updatedValue) {
                                return;
                            } else {
                                return { src: updatedValue };
                            }
                        }
                        return { src: value };
                    })
                ) as FilePondEntrySource[];

                // no sources returned
                if (!sources.length) {
                    e.preventDefault();
                    return;
                }

                // add the entries at default insert index
                insertEntries(sources, insertIndex);
            }

            function handleOpen({
                dialog,
                setDialogContentTemplate,
                setDialogImportButtonCount,
            }: DialogContext) {
                const { inputAttributes } = props;

                // create element
                currentTemplate = currentTemplate || createSourceTemplate(inputAttributes);

                // use this template as content
                setDialogContentTemplate(currentTemplate, props);

                // when the element was appended
                pub('dialogOpen', dialog);

                // handle form submit so we can add data
                unsubSubmitListener = addListener(dialog, 'submit', handleSubmit);

                // handle form change event so we can update import button counter
                unsubChangeListener = addListener(
                    dialog,
                    'change',
                    (e: Event & { target: HTMLInputElement }) => {
                        const { target } = e;
                        const { name, validity, value } = target;

                        // we're only interested in the output field
                        if (name !== inputAttributes.name) {
                            return;
                        }

                        // 0 selected by default, this hides the counter
                        let count = 0;

                        if (validity.valid) {
                            // @ts-ignore
                            if (value instanceof FormData) {
                                count = value.getAll(name).length;
                            } else {
                                count = 1;
                            }
                        }

                        setDialogImportButtonCount(count);
                    }
                );
            }

            function handleOpened({ dialog }: DialogContext) {
                // when the element was appended
                pub('dialogOpened', dialog);
            }

            function handleClosed({
                dialog,
                setDialogContentTemplate,
                setDialogImportButtonCount,
            }: DialogContext) {
                // right before dialog is cleaned up
                pub('dialogClosed', dialog);

                // clean up listeners
                unsubSubmitListener?.();
                unsubSubmitListener = null;

                unsubChangeListener?.();
                unsubChangeListener = null;

                // we've got the value, let's reset the form
                dialog?.querySelector('form')?.reset();

                // @ts-ignore reset template
                setDialogContentTemplate(null);
                setDialogImportButtonCount(0);
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
