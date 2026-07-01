import type {
    ExtensionFactory,
    ExtensionFactoryInsertInstructions,
    ExtensionInsertInstructions,
} from '../../core/extensionManager.ts';
import type { ExtensionType } from '../../extensions/common/createExtension.js';
import type { Extension } from '../../types/index.js';
import { isArray, isFunction, isObject } from '../../utils/test.js';
import { arrayInsertAtIndex } from '../../utils/array.js';
import { warn } from '../../common/console.js';

import { FileInputSource } from '../../extensions/file-input-source.js';
import { DataTransferLoader } from '../../extensions/data-transfer-loader.js';
import { ValueCallbackStore } from '../../extensions/value-callback-store.js';
import { FileExtensionValidator } from '../../extensions/file-extension-validator.js';
import { FileMimeTypeValidator } from '../../extensions/file-mime-type-validator.js';
import { EntryListView } from '../../extensions/entry-list-view.js';
import { SourceListView } from '../../extensions/source-list-view.js';
import { SourceDescriptionView } from '../../extensions/source-description-view.js';
import { hasOwnProp } from '../../utils/object.js';

// extension types in auto sort order
const ExtensionTypes: ExtensionType[] = [
    'source',
    'loader',
    'validator',
    'transform',
    'resource',
    'view',
    'store',
];

function isExtensionType(value: string): value is ExtensionType {
    return ExtensionTypes.includes(value as ExtensionType);
}

const _ExtensionSlots = ExtensionTypes.map((type) => ({ type }));
const [
    _SourceSlot,
    _LoaderSlot,
    _ValidatorSlot,
    _TransformSlot,
    _ResourceSlot,
    _ViewSlot,
    _StoreSlot,
] = _ExtensionSlots;

// Related to managing default extensions
type ExtensionSetItem =
    | ExtensionFactory
    | typeof _SourceSlot
    | typeof _LoaderSlot
    | typeof _ValidatorSlot
    | typeof _TransformSlot
    | typeof _ResourceSlot
    | typeof _ViewSlot
    | typeof _StoreSlot;

function getExtensionFactory(
    extension: ExtensionSetItem | ExtensionFactoryInsertInstructions
): Extension {
    if (isArray(extension)) {
        return extension[0];
    }

    if (isObject(extension) && hasOwnProp(extension, 'insert')) {
        return (extension as ExtensionInsertInstructions).insert;
    }

    return extension as Extension;
}

function getExtensionName(extension: ExtensionSetItem) {
    return getExtensionFactory(extension).name;
}

function getExtensionType(extension: ExtensionSetItem) {
    return getExtensionFactory(extension).type;
}

function getExtensionInsertInstructions(extension: ExtensionFactoryInsertInstructions) {
    if (!isObject(extension)) {
        return undefined;
    }
    const { insert, options, ...instructions } = extension as ExtensionInsertInstructions;
    return instructions;
}
/** Merges a set of extensions with the default FilePond custom element extensions, this makes switching from a default input to a file-pond element as frictionless as possible */
export function createFilePondExtensionSet(
    extensions: ExtensionFactory[] = []
): ExtensionFactory[] {
    // default extension set
    let extensionSet: ExtensionSetItem[] = [
        FileInputSource,
        _SourceSlot,
        DataTransferLoader,
        _LoaderSlot,
        FileExtensionValidator,
        FileMimeTypeValidator,
        _ValidatorSlot,
        _TransformSlot,
        _ResourceSlot,
        _ViewSlot,
        EntryListView,
        SourceListView,
        SourceDescriptionView,
        _StoreSlot,
        ValueCallbackStore,
    ];

    // now we loop over passed extensions and insert them after the index of a current extension (source types after FileInputSource, validator types after FileExtensionValidator, etc.)
    for (const extension of extensions) {
        let name = getExtensionName(extension);
        let type = getExtensionType(extension);

        // test if is already in extensionSet, else replace
        let index = extensionSet.findIndex((extension) => getExtensionName(extension) === name);
        if (index > -1) {
            extensionSet[index] = extension;
            continue;
        }

        let needle: string;
        let indexOffset = 1;
        let instructions = getExtensionInsertInstructions(extension);
        let insertBefore = false;

        // no insert instructions, we use the extension type
        if (!instructions) {
            needle = type;
        }
        // use the supplied insert instructions
        else {
            insertBefore = !!instructions.before;
            indexOffset = insertBefore ? 0 : 1;
            needle = (instructions.before || instructions.after) as string;
        }

        // find where to insert the extension
        index =
            instructions && !isExtensionType(needle)
                ? extensionSet.findIndex((extension) => getExtensionName(extension) === needle)
                : insertBefore
                  ? extensionSet.findIndex((extension) => getExtensionType(extension) === needle)
                  : extensionSet.findLastIndex(
                        (extension) => getExtensionType(extension) === needle
                    );

        if (index === -1) {
            warn(`No valid insertion index found for extension "${name}" with type "${type}"`);
            continue;
        }

        // insert the extension
        const extensionToInsert: ExtensionFactory = isObject(extension)
            ? //  @ts-ignore
              [extension.insert, extension.options]
            : extension;
        extensionSet = arrayInsertAtIndex(extensionSet, index + indexOffset, extensionToInsert);
    }

    // filter out slots
    return extensionSet.filter(
        (item) =>
            !_ExtensionSlots.includes(
                item as {
                    type: ExtensionType;
                }
            )
    ) as ExtensionFactory[];
}
