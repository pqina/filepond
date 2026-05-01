import type {
    ExtensionFactory,
    ExtensionFactoryInsertInstructions,
    ExtensionInsertInstructions,
} from '../../core/extensionManager.ts';
import type { ExtensionType } from '../../extensions/common/createExtension.js';
import type { Extension } from '../../types/index.js';
import { isArray, isObject } from '../../utils/test.js';
import { arrayInsertAtIndex } from '../../utils/array.js';
import { warn } from '../../common/console.js';

import { FileInputSource } from '../../extensions/file-input-source.js';
import { DataTransferLoader } from '../../extensions/data-transfer-loader.js';
import { ValueCallbackStore } from '../../extensions/value-callback-store.js';
import { FileExtensionValidator } from '../../extensions/file-extension-validator.js';
import { FileMimeTypeValidator } from '../../extensions/file-mime-type-validator.js';
import { EntryListView } from '../../extensions/entry-list-view.js';
import { hasOwnProp } from '../../utils/object.js';

// Related to managing default extensions
type ExtensionSetItem = ExtensionFactory | { name: string; type: ExtensionType };

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

// Where to insert transform and resource extensions
const _TransformSlot = { name: 'Transform', type: 'transform' } as const;
const _ResourceSlot = { name: 'Resource', type: 'resource' } as const;

/** Merges a set of extensions with the default FilePond custom element extensions, this makes switching from a default input to a file-pond element as frictionless as possible */
export function createFilePondExtensionSet(extensions: ExtensionFactory[] = []) {
    // default extension set
    let extensionSet: ExtensionSetItem[] = [
        FileInputSource,
        DataTransferLoader,
        FileExtensionValidator,
        FileMimeTypeValidator,
        // the default extension set doesn't have a Transform extension, so we create a slot so we can auto insert transform extensions there, the slot is removed when we return the extension set
        _TransformSlot,
        // same for Resource extensions, these should run before views so views can use their generated entry state
        _ResourceSlot,
        EntryListView,
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

    // remove placeholders
    return extensionSet.filter(
        (fn) => fn !== _TransformSlot && fn !== _ResourceSlot
    ) as Extension[];
}
