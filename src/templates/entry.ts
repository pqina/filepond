import type { EntryListFunctions, TemplateNode } from '../types/index.js';
import { withNodeTree, type NodeContext } from '../elements/common/nodeTree.js';

import { isDataTransferEntry, isFileEntry, isNumber, isString } from '../utils/test.js';
import { bytesToNaturalFileSize } from '../utils/file.js';
import { fade } from '../elements/common/transition.js';
import { quadInOut } from 'svelte/easing';
import {
    createButton,
    getExtensionStatusWithCode,
    hasExtensionWithAction,
    hasExtensionWithStatusCode,
} from './helpers.js';
import { cache } from '../utils/cache.js';
import { BooleanInput } from '../elements/components/BooleanInput/index.js';
import { ElementSkeleton } from '../elements/components/ElementSkeleton/index.js';
import { FilenameInput } from '../elements/components/FilenameInput/index.js';
import { SpringElement } from '../elements/components/SpringElement/index.js';
import { EntryActivityIndicator } from '../elements/FilePondEntryList/components/EntryActivityIndicator/index.js';
import { EntryStatus } from '../elements/FilePondEntryList/components/EntryStatus/index.js';
import { EntryList } from '../elements/FilePondEntryList/components/EntryList/index.js';
import { EntryListItem } from '../elements/FilePondEntryList/components/EntryListItem/index.js';
import { Entry } from '../elements/FilePondEntryList/components/Entry/index.js';
import { EntryListItemPlaceholder } from '../elements/FilePondEntryList/components/EntryListItemPlaceholder/index.js';
import { toSpaceSeparatedString } from '../elements/common/string.js';

export function createFilePondEntryList(): TemplateNode[] {
    return [
        {
            key: 'entry-list',
            component: EntryList,
            props: ({ entries }: NodeContext) => ({
                part: 'list',
                entries,
            }),
            item: {
                if: {
                    test: ({ isPlaceholder }: NodeContext) => isPlaceholder,
                    then: {
                        component: EntryListItemPlaceholder,
                        props: ({ onmeasureitem }) => ({
                            part: 'entry-list-item-placeholder',
                            onmeasureitem,
                        }),
                    },
                },
                else: {
                    key: 'entry-list-item',
                    component: EntryListItem,
                    props: ({
                        entry,
                        ariaId,
                        spring,
                        isDetached,
                        isRemoving,
                        isDraggable,
                        isDragging,
                        isLastDraggedItem,
                        translation,
                        springAnimation,
                        onmeasureitem,
                    }: NodeContext) => {
                        // select entry list parameters to pass to entry item
                        return {
                            part: isDataTransferEntry(entry)
                                ? 'entry-list-item data-transfer-item'
                                : 'entry-list-item file-item',
                            class: 'entry-list-item',
                            entry,
                            spring,
                            isDetached,
                            isRemoving,
                            isDraggable,
                            isDragging,
                            isLastDraggedItem,
                            springAnimation,
                            translation,
                            onmeasureitem,
                            ariaDescribedby: toSpaceSeparatedString(
                                `${ariaId}-status`,
                                `${ariaId}-store-info`
                            ),
                        };
                    },
                    children: createFilePondEntry(),
                },
            },
        },
    ];
}

export function createFilePondEntry(): TemplateNode {
    return {
        key: 'entry',
        component: Entry,
        props: ({ entry, ariaId }) => {
            return {
                nameId: `${ariaId}-name`,
                part: isDataTransferEntry(entry) ? 'entry entry-data-transfer' : 'entry',
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
            createEntryStatus(),
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
        key: 'data-transfer-info',
        component: SpringElement,
        props: {
            class: 'entry-info',
            part: 'entry-info data-transfer-info',
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
                key: 'data-transfer-info-main',
                tag: 'div',
                attrs: {
                    class: 'entry-info-main',
                },
                children: 'loadDataTransferProgress',
            },
            {
                key: 'data-transfer-info-sub',
                tag: 'div',
                attrs: {
                    class: 'entry-info-sub',
                },
                children: 'loadDataTransferInfo',
            },
        ],
    };
}

export function createEntryStatus() {
    return {
        key: 'entry-status',
        component: EntryStatus,
        props: ({ ariaId }: NodeContext) => ({
            part: 'entry-status',
            class: 'entry-status',
            id: `${ariaId}-status`,
        }),
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
                        part: 'entry-info-main',
                        isWaiting,
                        isFrozen,
                    };
                },
                children: `{{entry.name}}`,
            },
            {
                key: 'file-info-sub',
                component: ElementSkeleton,
                props: ({ isWaiting, isFrozen }: NodeContext) => {
                    return {
                        class: 'entry-info-sub',
                        part: 'entry-info-sub',
                        isWaiting,
                        isFrozen,
                    };
                },
                context: ({ entry, byteUnits }: NodeContext) => {
                    if (!isNumber(entry.size)) {
                        return {};
                    }

                    const naturalFileSize = cache(bytesToNaturalFileSize, [
                        entry.size,
                        { byteUnits },
                    ]);

                    const [fileSize, fileSizeUnit] = naturalFileSize.split(' ');

                    return {
                        size: fileSize,
                        sizeUnit: `unit${fileSizeUnit}`,
                    };
                },
                children: `{{size}} {{sizeUnit}}`,
            },
        ],
    };
}

const createFileStoreMainAttributes = ({ ariaId }: NodeContext) => ({
    id: `${ariaId}-store-info`,
    class: 'entry-info-main',
});

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
                main: {
                    key: 'file-store-queued-info-main',
                    tag: 'div',
                    attrs: createFileStoreMainAttributes,
                    children: 'storeStorageQueued',
                },
                sub: 'assistAbort',
            }),
            createEntryInfoBlock('file-store-busy-info', ['STORE_BUSY'], {
                sub: 'assistAbort',
                main: {
                    key: 'file-store-busy-info-main',
                    tag: 'div',
                    attrs: createFileStoreMainAttributes,
                    spring: ({ entry }: NodeContext) => {
                        const { progress } = getExtensionStatusWithCode(entry, 'STORE_BUSY') ?? {};
                        return {
                            progress: {
                                value: progress === Infinity ? 0 : progress,
                                transform: (v: number) => Math.round(v * 100),
                            },
                        };
                    },
                    children: 'storeStorageProgress',
                },
            }),
            createEntryInfoBlock('file-store-complete-info', ['STORE_COMPLETE'], {
                main: {
                    key: 'file-store-complete-info-main',
                    tag: 'div',
                    attrs: createFileStoreMainAttributes,
                    children: 'storeStorageComplete',
                },
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
            { id, ariaId, entry }: NodeContext,
            { updateEntryState, removeEntries }: EntryListFunctions
        ) => ({
            class: 'entry-load-state',
            part: 'entry-load-state',
            buttonPart: 'entry-button',
            states: [
                {
                    codes: ['LOAD_QUEUED', 'LOAD_BUSY', 'RESTORE_BUSY'],
                    progress: true,
                    button: createButton('button-load-abort', {
                        title: 'abort',
                        icon: 'remove',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => updateEntryState(id, { abort: true }),
                        ariaDescribedby: `${ariaId}-name`,
                    }),
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
                    button: createButton('button-entry-remove', {
                        icon: 'remove',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => removeEntries(id),
                        ariaDescribedby: toSpaceSeparatedString(
                            `${ariaId}-name`,
                            `${ariaId}-status`
                        ),
                    }),
                },
            ],
        }),
    };
}

export function createEntryStoreState() {
    return {
        key: 'entry-store-state',
        component: EntryActivityIndicator,
        props: ({ id, ariaId, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
            class: 'entry-store-state',
            part: 'entry-store-state',
            buttonPart: 'entry-button',
            states: [
                {
                    codes: [
                        'STORE_READY',
                        'STORE_ABORT',
                        'STORE_ERROR',
                        'RELEASE_COMPLETE',
                        'RELEASE_ABORT',
                    ],
                    button: createButton('button-store-idle', {
                        icon: 'store',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        styles: createIndicatorButtonTransforms({
                            intro: 'translateY(0.125em)',
                            idle: 'translateY(0)',
                            outro: 'translateY(-0.125em)',
                        }),
                        onclick: () =>
                            updateEntryState(id, {
                                store: true,
                            }),
                        ariaDescribedby: `${ariaId}-name`,
                    }),
                },
                {
                    codes: ['STORE_QUEUED', 'STORE_BUSY'],
                    progress: true,
                    button: createButton('button-store-busy', {
                        icon: 'abort',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => {
                            updateEntryState(id, {
                                abort: true,
                            });
                        },
                        ariaDescribedby: toSpaceSeparatedString(
                            `${ariaId}-name`,
                            `${ariaId}-store-info`
                        ),
                    }),
                },
                {
                    codes: ['RELEASE_BUSY'],
                    progress: {
                        direction: 'reverse',
                    },
                    button: createButton('button-store-busy', {
                        icon: 'abort',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () =>
                            updateEntryState(id, {
                                abort: true,
                            }),
                        ariaDescribedby: `${ariaId}-name`,
                    }),
                },
                {
                    codes: ['STORE_COMPLETE', 'RESTORE_COMPLETE', 'RELEASE_ABORT'],
                    button: createButton('button-store-complete', {
                        icon: 'revert',
                        styles: createIndicatorButtonTransforms({
                            intro: 'rotateZ(45deg)',
                            idle: 'rotateZ(0)',
                            outro: 'rotaetZ(-45deg)',
                        }),
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () =>
                            updateEntryState(id, {
                                store: false,
                            }),
                        ariaDescribedby: toSpaceSeparatedString(
                            `${ariaId}-name`,
                            `${ariaId}-status`,
                            `${ariaId}-store-info`
                        ),
                    }),
                },
            ],
        }),
    };
}

function createIndicatorButtonTransforms({ intro, idle, outro }: any) {
    const key = '--indicator-button-';
    return {
        [`${key}intro`]: intro,
        [`${key}idle`]: idle,
        [`${key}outro`]: outro,
    };
}

interface EntryCheckboxOptions {
    /** Key of the component */
    key?: string;

    /** Key of the state on the entry that is toggled */
    stateKey?: string;
}

export function createEntryCheckbox(options?: EntryCheckboxOptions): TemplateNode {
    const { key = 'entry-checkbox', stateKey = 'checked' } = options ?? {};
    return {
        key,
        component: BooleanInput,
        props: ({ id, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
            class: key,
            part: key,
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

export function appendEntryCheckbox(template: TemplateNode[]) {
    withNodeTree(template)
        .remove('entry-store-state')
        .replace('entry-load-state', createEntryCheckbox())
        .update('entry-list-item', (node: any) => {
            const existingProps = node.props as (context: NodeContext) => { [key: string]: any };
            node.props = (context: NodeContext) => {
                const computedProps = existingProps(context);
                return {
                    ...computedProps,
                    part: toSpaceSeparatedString(
                        computedProps.part,
                        context.entry.state.checked ? 'selected' : undefined
                    ),
                };
            };
        });

    return template;
}

export function appendEntryRenameInput(template: TemplateNode[]) {
    withNodeTree(template).update('file-info-main', (node: any) => {
        node.children = createFileRenameInput();
    });

    return template;
}
