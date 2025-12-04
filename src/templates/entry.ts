import type { EntryListFunctions, TemplateNode } from '../types/index.js';
import type { NodeContext } from '../elements/common/nodeTree.js';

import {
    Entry,
    EntryList,
    EntryStatus,
    EntryActivityIndicator,
    useEntryContext,
} from '../elements/FilePondEntryList/components/index.js';

import {
    BooleanInput,
    ElementSkeleton,
    FilenameInput,
    SpringElement,
} from '../elements/components/index.js';
import { isDataTransferEntry, isFileEntry, isNumber, isString } from '../utils/test.js';
import { bytesToNaturalFileSize } from '../utils/file.js';
import { fade } from '../elements/common/transition.js';
import { quadInOut } from 'svelte/easing';
import {
    getExtensionStatusWithCode,
    hasExtensionWithAction,
    hasExtensionWithStatusCode,
} from './helpers.js';
import { cache } from '../utils/cache.js';

export interface EntryListTemplateOptions {
    debug?: boolean;
}

export interface EntryTemplateOptions {
    debug?: boolean;
}

export function createFilePondEntry(options?: EntryTemplateOptions): TemplateNode {
    return {
        key: 'entry',
        component: Entry,
        props: ({ entry }) => {
            return {
                part: 'entry',
                class: isDataTransferEntry(entry) ? 'entry-data-transfer' : undefined,
            };
        },
        children: [
            createEntryLoadState(),
            {
                if: {
                    test: ({ entry }: NodeContext) => isDataTransferEntry(entry),
                    then: createEntryDataTransferInfo(),
                },
                elseif: {
                    test: ({ entry }: NodeContext) => isFileEntry(entry),
                    then: createEntryInfo(),
                },
            },
            createEntryStoreState(),
            createEntryStatus(options),
        ],
    };
}

export function createEntryInfoBlock(
    key: string,
    statusCodes: string[],
    { main, sub }: { main: TemplateNode | string; sub: TemplateNode | string }
): TemplateNode {
    return {
        if: {
            test: ({ entry }) => {
                return hasExtensionWithStatusCode(entry, statusCodes);
            },
            then: {
                key,
                tag: 'element-stack',
                attrs: {
                    layout: 'col',
                },
                children: [
                    isString(main)
                        ? {
                              key: `${key}-main`,
                              tag: 'div',
                              attrs: {
                                  class: 'entry-info-main',
                              },
                              children: main,
                          }
                        : main,
                    {
                        key: `${key}-sub`,
                        tag: 'div',
                        attrs: {
                            class: 'entry-info-sub',
                        },
                        children: sub,
                    },
                ],
            },
        },
    };
}

export function createEntryInfo() {
    return {
        key: 'entry-info',
        component: SpringElement,
        props: {
            class: 'entry-info',
            part: 'entry-info',
            subtag: 'element-stack',
            subattrs: {
                layout: 'split',
            },
        },
        children: [createFileLoadInfo(), createFileStoreInfo()],
    };
}

export function createEntryDataTransferInfo() {
    return {
        key: 'datatransfer-info',
        component: SpringElement,
        props: {
            class: 'entry-info',
            subtag: 'element-stack',
            subattrs: {
                layout: 'col',
            },
        },
        context: ({ entry }: NodeContext) => {
            const status = getExtensionStatusWithCode(entry, 'LOAD_BUSY');

            // adds { processed, total } object to scope
            return {
                processedFiles: status?.values?.processed,
                totalFiles: status?.values?.total,
            };
        },
        children: [
            {
                key: 'datatransfer-info-main',
                tag: 'div',
                attrs: {
                    class: 'entry-info-main',
                },
                children: 'loadDataTranserProgress',
            },
            {
                key: 'datatransfer-info-sub',
                tag: 'div',
                attrs: {
                    class: 'entry-info-sub',
                },
                children: 'loadDataTranserInfo',
            },
        ],
    };
}

export function createEntryStatus(options?: EntryTemplateOptions) {
    const { debug } = options ?? {};
    return {
        key: 'entry-status',
        component: EntryStatus,
        props: {
            part: 'entry-status',
            class: 'entry-status',
            debug,
        },
    };
}

export function createFileLoadInfo() {
    return {
        key: 'file-info',
        tag: 'element-stack',
        attrs: {
            layout: 'col',
        },
        context: ({ entry }: NodeContext) => {
            const isWaiting = hasExtensionWithStatusCode(entry, [
                'LOAD_QUEUED',
                'LOAD_BUSY',
                'RESTORE_BUSY',
            ]);

            const isFrozen = hasExtensionWithStatusCode(entry, ['LOAD_ERROR', 'RESTORE_ERROR']);

            return {
                isWaiting,
                isFrozen,
            };
        },
        children: [
            {
                key: 'file-info-main',
                component: ElementSkeleton,
                props: ({ isWaiting, isFrozen }: NodeContext) => {
                    return {
                        class: 'entry-info-main',
                        isWaiting,
                        isFrozen,
                    };
                },
                children: `{{entry.name}}`,
            },
            {
                key: 'file-info-sub',
                component: ElementSkeleton,
                props: ({ isWaiting, isFrozen }: NodeContext) => ({
                    class: 'entry-info-sub',
                    isWaiting,
                    isFrozen,
                }),
                context: ({ entry }: NodeContext) => {
                    return {
                        naturalSize: isNumber(entry.size)
                            ? // bytesToNaturalFileSize(entry.size)
                              cache(bytesToNaturalFileSize, [entry.size])
                            : null,
                    };
                },
                children: `{{naturalSize}}`,
            },
        ],
    };
}

export function createFileStoreInfo() {
    return {
        key: 'file-store-spring',
        component: SpringElement,
        props: {
            subtag: 'element-stack',
            subattrs: {
                layout: 'pile',
            },
        },
        transition: {
            fn: fade,
            duration: 150,
            easing: quadInOut,
            when: ({ entry }: NodeContext) => {
                return hasExtensionWithStatusCode(entry, [
                    'STORE_QUEUED',
                    'STORE_BUSY',
                    'STORE_COMPLETE',
                ]);
            },
        },
        children: [
            createEntryInfoBlock('file-store-queued-info', ['STORE_QUEUED'], {
                main: 'storeStorageQueued',
                sub: 'assistAbort',
            }),
            createEntryInfoBlock('file-store-busy-info', ['STORE_BUSY'], {
                sub: 'assistAbort',
                main: {
                    key: 'file-store-busy-info-main',
                    tag: 'div',
                    attrs: {
                        class: 'entry-info-main',
                    },
                    spring: ({ entry }: NodeContext) => {
                        const { progress } = getExtensionStatusWithCode(entry, 'STORE_BUSY') ?? {};

                        return {
                            progress: {
                                // the current value
                                value: progress === Infinity ? 0 : progress,
                                transform: (v: number) => Math.round(v * 100),
                            },
                        };
                    },
                    children: 'storeStorageProgress',
                },
            }),
            createEntryInfoBlock('file-store-complete-info', ['STORE_COMPLETE'], {
                main: 'storeStorageComplete',
                sub: 'assistUndo',
            }),
        ],
    };
}

export function createEntryLoadState() {
    return {
        key: 'entry-load-state',
        component: EntryActivityIndicator,
        props: (
            { id, entry }: NodeContext,
            { updateEntryState, removeEntries }: EntryListFunctions
        ) => ({
            class: 'entry-load-state',
            part: 'entry-load-state',
            buttonPart: 'entry-button',
            disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
            states: [
                {
                    codes: ['LOAD_QUEUED', 'LOAD_BUSY', 'RESTORE_BUSY'],
                    progress: true,
                    button: {
                        title: 'abort',
                        icon: 'remove',
                        onclick: () => updateEntryState(id, { abort: true }),
                    },
                },
                {
                    codes: [
                        // `null`: can still remove items without extensions, "dummy files"
                        null,
                        'LOAD_ERROR',
                        'LOAD_COMPLETE',
                        'RESTORE_COMPLETE',
                        'RESTORE_ERROR',
                    ],
                    button: {
                        icon: 'remove',
                        onclick: () => removeEntries(id),
                    },
                },
            ],
        }),
    };
}

export function createEntryStoreState() {
    return {
        key: 'entry-store-state',
        component: EntryActivityIndicator,
        props: ({ id, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
            class: 'entry-store-state',
            part: 'entry-store-state',
            buttonPart: 'entry-button',
            disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
            states: [
                {
                    codes: [
                        'STORE_READY',
                        'STORE_ABORT',
                        'STORE_ERROR',
                        'RELEASE_COMPLETE',
                        'RELEASE_ABORT',
                    ],
                    button: {
                        icon: 'store',
                        transforms: {
                            intro: 'translateY(0.125em)',
                            idle: 'translateY(0)',
                            outro: 'translateY(-0.125em)',
                        },
                        onclick: () =>
                            updateEntryState(id, {
                                store: true,
                            }),
                    },
                },
                {
                    codes: ['STORE_QUEUED', 'STORE_BUSY'],
                    progress: true,
                    button: {
                        icon: 'abort',
                        onclick: () =>
                            updateEntryState(id, {
                                abort: true,
                            }),
                    },
                },
                {
                    codes: ['RELEASE_BUSY'],
                    progress: {
                        direction: 'reverse',
                    },
                    button: {
                        icon: 'abort',
                        onclick: () =>
                            updateEntryState(id, {
                                abort: true,
                            }),
                    },
                },
                {
                    codes: ['STORE_COMPLETE', 'RESTORE_COMPLETE', 'RELEASE_ABORT'],
                    button: {
                        icon: 'revert',
                        transforms: {
                            intro: 'rotateZ(45deg)',
                            idle: 'rotateZ(0)',
                            outro: 'rotaetZ(-45deg)',
                        },
                        onclick: () =>
                            updateEntryState(id, {
                                store: false,
                            }),
                    },
                },
            ],
        }),
    };
}

export function createFilePondEntryList(options?: EntryListTemplateOptions): TemplateNode[] {
    return [
        {
            key: 'entry-list',
            component: EntryList,
            props: ({ entries }: NodeContext) => ({
                part: 'list',
                itemPart: 'list-item',
                itemPlaceholderPart: 'list-item-placeholder',
                entries,
            }),
            item: {
                key: 'entry-context',
                component: useEntryContext,
                props: ({ entry }: NodeContext) => ({
                    // pass entry list parameters as a prop to entry context
                    entry,
                }),
                children: createFilePondEntry(options),
            },
        },
    ];
}

interface EntryCheckboxOptions {
    /** Key of the component */
    key?: string;

    /** Key of the state on the entry that is toggled */
    stateKey?: string;
}

export function createEntryCheckbox(options?: EntryCheckboxOptions): TemplateNode {
    const { key = 'entry-checkable', stateKey = 'checked' } = options ?? {};
    return {
        key,
        component: BooleanInput,
        props: ({ id, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
            class: key,
            icon: 'check',
            label: 'Select',
            labelIsImplicit: true,
            checked: entry.state[stateKey],
            onchange: (checked: boolean) => {
                updateEntryState(id, {
                    [stateKey]: checked,
                });
            },
        }),
    };
}

export interface FileRenameInputOptions {
    /** Key of the component */
    key?: string;

    /** Extension action key, defaults to `"renameFile"` */
    extensionAction?: string;
}

export function createFileRenameInput(options?: FileRenameInputOptions): TemplateNode {
    const { key = 'file-rename', extensionAction = 'renameFile' } = options ?? {};
    return {
        if: {
            test: ({ entry }: NodeContext) => {
                return isString(entry.name) && hasExtensionWithAction(entry, extensionAction);
            },
            then: {
                key,
                component: FilenameInput,
                props: ({ id, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
                    disabled: hasExtensionWithStatusCode(entry, ['STORE_QUEUED', 'STORE_BUSY']),
                    value: entry.name,
                    onconfirm: (value: string) => {
                        updateEntryState(id, {
                            [extensionAction]: value,
                        });
                    },
                }),
            },
        },
        else: {
            key,
            tag: 'span',
            children: `{{entry.name}}`,
        },
    };
}
