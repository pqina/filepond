import type { EntryListFunctions, NodeContext, TemplateNode } from '../../types/index.js';
import { withNodeTree, type NodeData } from '../../elements/common/nodeTree.js';

import { isDataTransferEntry, isFileEntry, isNumber, isString } from '../../utils/test.js';
import { bytesToNaturalFileSize } from '../../utils/file.js';
import { fade } from '../../elements/common/transition.js';
import { quadInOut } from 'svelte/easing';
import {
    createButton,
    createDefaultSpringElement,
    getExtensionStatusWithCode,
    hasExtensionWithAction,
    hasExtensionWithStatusCode,
} from '../common/index.js';
import { cache } from '../../utils/cache.js';
import { BooleanInput } from '../../elements/components/BooleanInput/index.js';
import { ElementSkeleton } from '../../elements/components/ElementSkeleton/index.js';
import { FilenameInput } from '../../elements/components/FilenameInput/index.js';
import { EntryActivityIndicator } from '../../elements/FilePondEntryList/components/EntryActivityIndicator/index.js';
import { EntryStatus } from '../../elements/FilePondEntryList/components/EntryStatus/index.js';
import { EntryList } from '../../elements/FilePondEntryList/components/EntryList/index.js';
import { EntryListItem } from '../../elements/FilePondEntryList/components/EntryListItem/index.js';
import { Entry } from '../../elements/FilePondEntryList/components/Entry/index.js';
import { EntryListItemPlaceholder } from '../../elements/FilePondEntryList/components/EntryListItemPlaceholder/index.js';
import { toSpaceSeparatedString } from '../../elements/common/string.js';
import { EMPTY_OBJECT } from '../../utils/object.js';

export function createFilePondEntryList(): TemplateNode[] {
    return [
        {
            key: 'entry-list',
            component: EntryList,
            props: ({ entries }: NodeData) => ({
                part: 'entry-list',
                entries,
            }),
            item: {
                if: {
                    test: ({ isPlaceholder }: NodeData) => isPlaceholder,
                    then: {
                        component: EntryListItemPlaceholder,
                        props: ({ id, index, onmeasureitem }) => ({
                            id,
                            index,
                            part: 'entry-list-item-placeholder',
                            onmeasureitem,
                        }),
                    },
                },
                else: {
                    key: 'entry-list-item',
                    component: EntryListItem,
                    props: ({
                        id,
                        index,
                        entry,
                        ariaId,
                        isDetached,
                        isRemoving,
                        isDraggable,
                        isDragging,
                        isLastDraggedItem,
                        translation,
                        onmeasureitem,
                    }: NodeData) => {
                        // select entry list parameters to pass to entry item
                        return {
                            id,
                            index,
                            part: isDataTransferEntry(entry)
                                ? 'entry-list-item data-transfer-item'
                                : 'entry-list-item file-item',
                            class: 'entry-list-item',
                            entry,
                            isDetached,
                            isRemoving,
                            isDraggable,
                            isDragging,
                            isLastDraggedItem,
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
                legendId: `${ariaId}-name`,
                part: isDataTransferEntry(entry) ? 'entry entry-data-transfer' : 'entry',
            };
        },
        data: ({ id, ariaId, entry }: NodeData = EMPTY_OBJECT) => {
            return {
                id,
                ariaId,
                entry,
            };
        },
        children: [
            createEntryLoadState(),
            {
                if: {
                    test: ({ entry }: NodeData) => isDataTransferEntry(entry),
                    then: createEntryDataTransferInfo(),
                },
                elseif: {
                    test: ({ entry }: NodeData) => isFileEntry(entry),
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
    return createDefaultSpringElement({
        key: 'entry-info',
        props: {
            class: 'entry-info',
            part: 'entry-info',
            subtag: 'element-stack',
            subattrs: {
                layout: 'split',
            },
        },
        children: [createFileLoadInfo(), createFileStoreInfo()],
    });
}

export function createEntryDataTransferInfo() {
    return createDefaultSpringElement({
        key: 'data-transfer-info',
        props: {
            class: 'entry-info',
            part: 'entry-info data-transfer-info',
            subtag: 'element-stack',
            subattrs: {
                layout: 'col',
            },
        },
        // adds { processedFiles, totalFiles } values to dataset
        data: ({ entry }: NodeData = EMPTY_OBJECT) => {
            const status = getExtensionStatusWithCode(entry, 'LOAD_BUSY');
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
    });
}

export function createEntryStatus() {
    return {
        key: 'entry-status',
        component: EntryStatus,
        props: ({ ariaId }: NodeData) => ({
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
        // adds { isWaiting, isFrozen } props to dataset
        data: (data: NodeData = EMPTY_OBJECT) => {
            const { entry } = data;

            const isWaiting = hasExtensionWithStatusCode(entry, [
                'LOAD_QUEUED',
                'LOAD_BUSY',
                'STORE_RESTORE_BUSY',
            ]);

            const isFrozen = hasExtensionWithStatusCode(entry, [
                'LOAD_ERROR',
                'STORE_RESTORE_ERROR',
            ]);

            return {
                name: entry.name,
                size: entry.size,
                isWaiting,
                isFrozen,
            };
        },
        attrs: {
            layout: 'col',
        },
        children: [
            {
                key: 'file-info-main',
                component: ElementSkeleton,
                props: ({ isWaiting, isFrozen }: NodeData) => {
                    return {
                        class: 'entry-info-main',
                        part: 'entry-info-main',
                        isWaiting,
                        isFrozen,
                    };
                },
                children: `{{name}}`,
            },
            {
                key: 'file-info-sub',
                component: ElementSkeleton,

                // adds { size, sizeUnit } props to dataset and retains { isWaiting, isFrozen }
                data: (
                    { size, isWaiting, isFrozen }: NodeData = EMPTY_OBJECT,
                    { byteUnits }: NodeContext = EMPTY_OBJECT
                ) => {
                    if (!isNumber(size)) {
                        return EMPTY_OBJECT;
                    }

                    const naturalFileSize = cache(bytesToNaturalFileSize, [size, { byteUnits }]);

                    const [fileSize, fileSizeUnit] = naturalFileSize.split(' ');

                    return {
                        sizeNatural: fileSize,
                        sizeUnit: `unit${fileSizeUnit}`,
                        isWaiting,
                        isFrozen,
                    };
                },

                props: ({ isWaiting, isFrozen }: NodeData) => {
                    return {
                        class: 'entry-info-sub',
                        part: 'entry-info-sub',
                        isWaiting,
                        isFrozen,
                    };
                },

                children: `{{sizeNatural}} {{sizeUnit}}`,
            },
        ],
    };
}

const createFileStoreMainAttributes = ({ ariaId }: NodeData) => ({
    id: `${ariaId}-store-info`,
    class: 'entry-info-main',
});

export function createFileStoreInfo() {
    return createDefaultSpringElement({
        key: 'file-store-spring',
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
            when: ({ entry }: NodeData) => {
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
                    data: ({ entry }: NodeData = EMPTY_OBJECT) => {
                        // select data for spring
                        const { progress } = getExtensionStatusWithCode(entry, 'STORE_BUSY') ?? {};
                        return {
                            progress,
                        };
                    },
                    spring: ({ progress }: NodeData) => {
                        // note that the spring is initialised with an empty data object {}
                        return {
                            progress: {
                                value: progress === Infinity ? 0 : progress,
                                transform: (v: number) => Math.round(v * 100),
                            },
                        };
                    },
                    attrs: createFileStoreMainAttributes,
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
    });
}

export function createEntryLoadState() {
    return {
        key: 'entry-load-state',
        component: EntryActivityIndicator,
        props: (
            { id, ariaId, entry }: NodeData,
            { updateEntryState, removeEntries }: EntryListFunctions
        ) => ({
            class: 'entry-load-state',
            part: 'entry-load-state',
            buttonPart: 'entry-button',
            states: [
                {
                    codes: ['LOAD_QUEUED', 'LOAD_BUSY', 'STORE_RESTORE_BUSY'],
                    progress: true,
                    button: createButton('button-load-abort', {
                        title: 'abort',
                        icon: 'remove',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => {
                            updateEntryState(id, { abort: true });
                        },
                        ariaDescribedby: `${ariaId}-name`,
                    }),
                },
                {
                    codes: [
                        // `null`: can still remove items without extensions, "dummy files"
                        null,
                        'LOAD_ERROR',
                        'LOAD_COMPLETE',
                        'STORE_RESTORE_COMPLETE',
                        'STORE_RESTORE_ERROR',
                    ],
                    button: createButton('button-entry-remove', {
                        icon: 'remove',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => {
                            removeEntries(id);
                        },
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
        props: ({ id, ariaId, entry }: NodeData, { updateEntryState }: EntryListFunctions) => ({
            class: 'entry-store-state',
            part: 'entry-store-state',
            buttonPart: 'entry-button',
            states: [
                {
                    codes: [
                        'STORE_READY',
                        'STORE_ABORT',
                        'STORE_ERROR',
                        'STORE_RELEASE_COMPLETE',
                        'STORE_RELEASE_ABORT',
                    ],
                    button: createButton('button-store-idle', {
                        icon: 'store',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        styles: createIndicatorButtonTransforms({
                            intro: 'translateY(0.125em)',
                            idle: 'translateY(0)',
                            outro: 'translateY(-0.125em)',
                        }),
                        onclick: () => {
                            updateEntryState(id, {
                                store: true,
                            });
                        },
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
                    codes: ['STORE_RELEASE_BUSY'],
                    progress: {
                        direction: 'reverse',
                    },
                    button: createButton('button-store-busy', {
                        icon: 'abort',
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => {
                            updateEntryState(id, {
                                abort: true,
                            });
                        },
                        ariaDescribedby: `${ariaId}-name`,
                    }),
                },
                {
                    codes: ['STORE_COMPLETE', 'STORE_RESTORE_COMPLETE', 'STORE_RELEASE_ABORT'],
                    button: createButton('button-store-complete', {
                        icon: 'revert',
                        styles: createIndicatorButtonTransforms({
                            intro: 'rotateZ(45deg)',
                            idle: 'rotateZ(0)',
                            outro: 'rotaetZ(-45deg)',
                        }),
                        disabled: hasExtensionWithStatusCode(entry, ['TRANSFORM_BUSY']),
                        onclick: () => {
                            updateEntryState(id, {
                                store: false,
                            });
                        },
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
        props: ({ id, entry }: NodeData, { updateEntryState }: EntryListFunctions) => ({
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
            test: ({ entry }: NodeData) => {
                return isString(entry.name) && hasExtensionWithAction(entry, extensionAction);
            },
            then: {
                key,
                component: FilenameInput,
                props: ({ id, entry }: NodeData, { updateEntryState }: EntryListFunctions) => ({
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
            const existingProps = <(currentData: NodeData) => { [key: string]: any }>node.props;
            node.props = (currentData: NodeData) => {
                const computedProps = existingProps(currentData);
                return {
                    ...computedProps,
                    part: toSpaceSeparatedString(
                        computedProps.part,
                        currentData.entry.state.checked ? 'selected' : undefined
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
