import type { FilePondEntry, FilePondDirectoryEntry, FilePondEntrySource } from '../types/index.js';

import { eachTree, filterTree, findTree, mapTree, sortTree } from '../utils/tree.js';
import { deepAssign, deepOverlap } from '../utils/object.js';
import { pubsub } from '../utils/pubsub.js';
import { arrayRemoveFalsy, arrayWrap } from '../utils/array.js';
import {
    isFile,
    isBlobOrFile,
    isNumber,
    isString,
    isFileEntry,
    isArray,
    isDirectoryEntry,
    isNullOrUndefined,
    isUndefined,
    isObject,
} from '../utils/test.js';
import { getUniqueId } from '../utils/string.js';

export interface EntryTreeOptions {
    /**
     * Called before an entry is added to the tree, allows manipulating the entry, or returning
     * false to prevent adding it
     */
    beforeAddEntry?: (entry: FilePondEntrySource) => false | FilePondEntry;

    /** Called before an `entry` is updated with `props`, allows manipulating the props */
    beforeUpdateEntryWithProps?: (
        entry: FilePondEntry,
        props: {
            [key: string]: any;
        },
        isUpdatingData: boolean
    ) => void;
}

/**
 * Is passed to `EntryTree` functions to find a `FilePondEntry`
 */
export type Needle = number | number[] | string | { id: string } | { id: string }[];

interface FilePondEntryTree {
    entries: FilePondEntry[];
}

/** Lean headless file processor */
export function createEntryTree(options: EntryTreeOptions) {
    const { beforeAddEntry, beforeUpdateEntryWithProps } = options ?? {};

    // pubsub
    const { on, pub } = pubsub();

    /** Tree of entries */
    const tree: FilePondEntryTree = {
        entries: [],
    };

    /** Maps entry id to index in tree */
    const treeIndexes: Map<string, number[]> = new Map();

    // is true when a function is going to call update tree
    let willCallUpdateEntries = false;

    /** Assigns an id to the entry if */
    function onboardEntry(entry: FilePondEntrySource): FilePondEntry | undefined {
        // allow manipulating the entry
        const sanitizedEntry = beforeAddEntry
            ? beforeAddEntry(entry)
            : isFileEntry(entry) || isDirectoryEntry(entry)
              ? entry
              : false;

        // can't add onboard this entry
        if (sanitizedEntry === false) {
            return;
        }

        // we set an entry id if it's not already set
        sanitizedEntry.id = sanitizedEntry.id ?? getUniqueId();

        return sanitizedEntry;
    }

    /** Called when an entry is added */
    function didInsertEntry(entry: FilePondEntry) {
        pub('insertEntry', entry);

        // when adding a file we always fire updateEntryData
        if (isFileEntry(entry) && isBlobOrFile(entry.file)) {
            // if updateEntryData handler fires updateEntry, we don't have to fire it ourselves
            const didCallUpdateEntry = handleUpdateEntryData(entry);
            if (didCallUpdateEntry) {
                return;
            }
        }

        handleUpdateEntry(entry);
    }

    /** Called when an entry is removed */
    function handleRemoveEntry(detail: { entry: FilePondEntry; index: number[] }) {
        pub('removeEntry', detail);
    }

    /** Called when an entry is updated */
    function handleUpdateEntry(detail: FilePondEntry) {
        pub('updateEntry', detail);
    }

    /** Called when an entry data was updated */
    function handleUpdateEntryData(entry: FilePondEntry) {
        // we test if updateEntryData triggers update entry, if so, we don't have to manually dispatch it
        let didCallUpdateEntry = false;
        const off = on('updateEntry', () => {
            off();
            didCallUpdateEntry = true;
        });
        pub('updateEntryData', entry);

        // already called updateEntry
        return didCallUpdateEntry;
    }

    /** Called when something in the entry tree is updated */
    function didUpdateEntries() {
        pub('updateEntries', tree.entries);
    }

    /** Computes indexes for the curren tree of entries so we can quickly look up entries */
    function computeIndexes(entries?: FilePondEntry[], path: number[] = []) {
        if (!entries) {
            treeIndexes.clear();
            entries = tree.entries;
        }

        // compute new ones
        entries.forEach((entry, index) => {
            // set my index
            treeIndexes.set(entry.id, [...path, index]);

            // if i'm a directory, let's compute my child indexes
            if (isDirectoryEntry(entry)) {
                computeIndexes(entry.entries, [...path, index]);
            }
        });
    }

    /** Reset the index map */
    function clearIndexes() {
        treeIndexes.clear();
    }

    function toIndexPath(index: number | number[]) {
        if (isArray(index)) {
            return index;
        }
        return [index];
    }

    /** Returns the entry found at index inside the tree */
    function getEntryByIndexPath(
        index: number[],
        parent: FilePondDirectoryEntry | FilePondEntryTree = tree
    ): FilePondDirectoryEntry {
        const path = index;

        for (let i = 0; i < path.length; i++) {
            const index = path[i];
            const entry: FilePondEntry = parent.entries[index];
            if (isDirectoryEntry(entry) && i < path.length) {
                parent = entry;
                continue;
            }

            return entry as FilePondDirectoryEntry;
        }

        return parent as FilePondDirectoryEntry;
    }

    /** Returns the parent of the entry found at index inside the tree */
    function getEntryParentByIndexPath(index: number[]) {
        const entryParentIndex = index.slice(0, index.length - 1);
        return getEntryByIndexPath(entryParentIndex) as FilePondDirectoryEntry;
    }

    function getEntryIndexPathByNeedle(needle: any) {
        // invalid
        if (isNullOrUndefined(needle)) {
            return;
        }

        // is root index
        if (isNumber(needle)) {
            if (tree.entries[needle]) {
                return [needle];
            }
            return;
        }

        // is array of numbers
        if (isArray(needle) && needle.every(isNumber)) {
            return needle;
        }

        // is id
        if (isString(needle) || isString(needle.id)) {
            const id = needle.id ?? needle;
            return treeIndexes.get(id);
        }

        // is an object
        if (isObject(needle)) {
            const result = findTree(tree.entries, (entry) => {
                return deepOverlap(needle, entry);
            }) as FilePondEntry | undefined;
            return result && treeIndexes.get(result.id);
        }
    }

    function updateSingleEntryWithProps(
        entry: FilePondEntry,
        ...propGroups: FilePondEntry[]
    ): [FilePondEntry, boolean] {
        let didUpdateData = false;

        // loop over array of new entry props to assign
        for (const props of propGroups) {
            let isUpdatingData = false;

            // if props includes file and file is not the same as existing file, we manipulated data
            if (
                // we're comparing files
                isFileEntry(entry) &&
                isFileEntry(props) &&
                // new entry carries a file object
                isFile(props.file) &&
                // these files are different so we're gonna update data
                entry.file !== props.file
            ) {
                isUpdatingData = true;
            }

            // so we can manipulate the new props in specific ways before updating the entry
            if (beforeUpdateEntryWithProps) {
                beforeUpdateEntryWithProps(entry, props, isUpdatingData);
            }

            // we need to know if we have to fire data update event
            if (isUpdatingData) {
                didUpdateData = true;
            }

            // update the entry with the entry props
            deepAssign(entry, props);
        }

        return [entry, didUpdateData];
    }

    function updateEntry(needle: Needle, ...props: any[]) {
        // get path to entry
        const path = getEntryIndexPathByNeedle(needle);
        if (!path) {
            return;
        }

        // get parent
        const parent = getEntryParentByIndexPath(path);
        if (!parent) {
            return;
        }

        // remove invalid props
        const sanitizedProps = arrayRemoveFalsy(props);

        // need to determine if this will update the file data
        const index = path.at(-1);
        if (isUndefined(index)) {
            return;
        }
        const [entry, didUpdateFileData] = updateSingleEntryWithProps(
            parent.entries[index],
            ...sanitizedProps
        );

        // update entry in parent array
        parent.entries = parent.entries.toSpliced(index, 1, entry);

        // did update entry data
        let didCallUpdateEntry = false;
        if (didUpdateFileData) {
            didCallUpdateEntry = handleUpdateEntryData(entry);
        }

        // did update entry
        if (!didCallUpdateEntry) {
            handleUpdateEntry(entry);
        }

        // we did update something in the tree and no-one else is calling update
        if (!willCallUpdateEntries) {
            didUpdateEntries();
        }
    }

    function insertEntries(
        rawEntries: FilePondEntrySource | FilePondEntrySource[],
        index?: number | number[]
    ) {
        // by default add to root
        let entriesToInsert = arrayWrap(rawEntries);
        let parent = tree;
        let insertionIndex = -1;

        // if index is not supplied or is -1 we add to end
        index = isArray(index) || (isNumber(index) && index > -1) ? index : tree.entries.length;

        // let's find parent
        const path = toIndexPath(index);
        for (let i = 0; i < path.length; i++) {
            const index = path[i];

            // can't work with negative indexes
            if (index < 0) {
                return;
            }

            // dive into directory if is dir and we have another index
            if (isDirectoryEntry(parent.entries[index]) && i < path.length) {
                parent = parent.entries[index];
                continue;
            }

            // is file or directory entry, add before
            insertionIndex = index;
            break;
        }

        // sanitized
        const sanitizedEntries = arrayRemoveFalsy(
            entriesToInsert.map((entry) => onboardEntry(entry))
        );

        willCallUpdateEntries = true;

        // update array
        parent.entries = parent.entries.toSpliced(insertionIndex, 0, ...sanitizedEntries);

        // update indexes
        computeIndexes();

        // let others know the entries were added
        sanitizedEntries.forEach((entry) => didInsertEntry(entry));

        // did update tree
        didUpdateEntries();

        willCallUpdateEntries = false;
    }

    function replaceEntry(needle: Needle, ...rawEntries: any[]) {
        const path = getEntryIndexPathByNeedle(needle);
        if (!path) {
            return;
        }

        const parent = getEntryParentByIndexPath(path);
        if (!parent || !isDirectoryEntry(parent)) {
            return;
        }

        const index = path.at(-1);
        if (isUndefined(index)) {
            return;
        }

        willCallUpdateEntries = true;

        // we sanitized these entries
        const sanitizedEntries = arrayRemoveFalsy(rawEntries.flat().map(onboardEntry));

        // the entry we'll replace
        const entryToReplace = getEntryByIndexPath(path) as FilePondEntry;

        // add the new entries
        parent.entries = parent.entries.toSpliced(index, 1, ...sanitizedEntries);

        // compute new indexes
        computeIndexes();

        // let others know about the entries that we removed
        handleRemoveEntry({ entry: entryToReplace, index: [-1] });

        // we added new entries
        sanitizedEntries.forEach(didInsertEntry);

        // did update entries tree
        didUpdateEntries();

        willCallUpdateEntries = false;
    }

    function moveEntry(needle: Needle, index: number | number[]) {
        const path = getEntryIndexPathByNeedle(needle);
        if (!path) {
            return;
        }

        const oldParent = getEntryParentByIndexPath(path);
        if (!oldParent || !isDirectoryEntry(oldParent)) {
            return;
        }

        // now we need to find parent of target index so we know where to move to
        const targetIndex = toIndexPath(index);
        const newParent = getEntryParentByIndexPath(targetIndex);
        if (!newParent || !isDirectoryEntry(newParent)) {
            return;
        }

        const lastIndex = path.at(-1);
        if (isUndefined(lastIndex)) {
            return;
        }

        const lastTargetIndex = targetIndex.at(-1);
        if (isUndefined(lastTargetIndex)) {
            return;
        }

        // get entry object to move and set to undefined so we
        const entry = oldParent.entries[lastIndex];

        // remove from old location
        oldParent.entries = oldParent.entries.toSpliced(lastIndex, 1);

        // move the entry to its new location
        newParent.entries = newParent.entries.toSpliced(lastTargetIndex, 0, entry);

        // need to recompute indexes
        computeIndexes();

        // did update entries tree
        didUpdateEntries();
    }

    function findEntries(...needles: (void | Needle)[]) {
        const results = arrayRemoveFalsy(needles).map((needle) => {
            // is root index
            if (isNumber(needle)) {
                return tree.entries[needle];
            }

            // is array of numbers
            if (isArray(needle) && needle.every(isNumber)) {
                return getEntryByIndexPath(needle as number[]);
            }

            // @ts-ignore is id
            if (isString(needle) || isString(needle.id)) {
                // @ts-ignore
                const id = needle.id ?? needle;
                const index = treeIndexes.get(id);
                return isUndefined(index) ? undefined : getEntryByIndexPath(index);
            }
        });

        return needles.length === 1 ? results[0] : results;
    }

    function removeEntries(...needles: Needle[]) {
        // let's find the items to remove
        const paths =
            needles[0] === -1
                ? // last item
                  [[tree.entries.length - 1]]
                : // no params -> remove all
                  needles.length === 0 || needles[0] === undefined
                  ? Array.from(treeIndexes.values())
                  : // else find item
                    [...arguments].map(getEntryIndexPathByNeedle);

        const results: ({ entry: FilePondEntry; index: number[] } | void)[] = [];
        const parentsToClean = [];

        for (const path of paths) {
            if (!path) {
                results.push(undefined);
                continue;
            }

            const parent = getEntryParentByIndexPath(path);
            if (!parent || !isDirectoryEntry(parent)) {
                results.push(undefined);
                continue;
            }

            const lastIndex = path.at(-1);
            if (isUndefined(lastIndex)) {
                return;
            }

            const entry = parent.entries[lastIndex];
            if (!entry) {
                continue;
            }

            results.push({ entry, index: path });

            // @ts-ignore - clear index
            parent.entries = parent.entries.toSpliced(lastIndex, 1, undefined);

            // we'll filter out this entry later as otherwise we might mess up indexes
            parentsToClean.push(parent);
        }

        // remove undefined entries
        parentsToClean.forEach((parent) => {
            parent.entries = arrayRemoveFalsy(parent.entries);
        });

        // did clean parents, so have to compute indexes again
        if (results.length) {
            computeIndexes();

            willCallUpdateEntries = true;

            // let others know about the entries that have been removed
            arrayRemoveFalsy(results).forEach((removedEntry) => handleRemoveEntry(removedEntry));

            // did update entries tree
            didUpdateEntries();

            willCallUpdateEntries = false;
        }

        return arguments.length === 1 ? results[0] : results;
    }

    function sortEntries(fn: (a: FilePondEntry, b: FilePondEntry) => 1 | -1 | 0) {
        tree.entries = sortTree(tree.entries, fn);

        // need to recompute indexes after sorting
        computeIndexes();

        // did update entries tree
        didUpdateEntries();
    }

    /** We're updating the entries array */
    function sync(rawOrUpdatedEntries: FilePondEntrySource[]) {
        willCallUpdateEntries = true;

        const removedEntries: { entry: FilePondEntry; index: number[] }[] = [];
        const addedEntries: FilePondEntry[] = [];
        const updatedEntries: [FilePondEntry, boolean][] = [];

        // we need to keep track of which items were removed so we note down all current ids, and track which ones we've seen in the loop below
        const currentEntryIds = new Set(treeIndexes.keys());
        const updatedEntryIds = new Set();

        // sync!
        const sanitizedEntries = mapTree(rawOrUpdatedEntries, (rawOrUpdatedEntry) => {
            // get existing entry index
            const indexPath =
                isString(rawOrUpdatedEntry.id) && getEntryIndexPathByNeedle(rawOrUpdatedEntry.id);

            // is existing item, need to update if object is different
            if (indexPath) {
                // need to remember we've seen this entry id so we can know which were removed
                updatedEntryIds.add(rawOrUpdatedEntry.id);

                // rename variable for clarity
                const updatedEntry = rawOrUpdatedEntry;

                // we know that (if the index was kept properly) this will return an entry
                const existingEntry = getEntryByIndexPath(indexPath);

                // if is the same, we done
                if (updatedEntry === existingEntry) {
                    return existingEntry;
                }

                // update existing entry with received entry
                const [entry, didUpdateFileData] = updateSingleEntryWithProps(
                    existingEntry,
                    updatedEntry
                );

                updatedEntries.push([entry, didUpdateFileData]);

                // return the item to the list
                return entry;
            }
            // is new item
            else {
                const sanitizedEntry = onboardEntry(rawOrUpdatedEntry);
                if (!sanitizedEntry) {
                    return;
                }

                addedEntries.push(sanitizedEntry);

                return sanitizedEntry;
            }
        });

        // get references to removed entries, could use `difference` but it's still quite new
        Array.from(currentEntryIds)
            .filter((x) => !updatedEntryIds.has(x))
            .forEach((id) => {
                const indexPath = getEntryIndexPathByNeedle(id) as number[];
                const entry = getEntryByIndexPath(indexPath);
                removedEntries.push({ entry, index: [-1] });
            });

        // set new tree
        tree.entries = sanitizedEntries;

        // compute new indexes for this tree
        computeIndexes();

        // fire ze events!
        removedEntries.forEach(handleRemoveEntry);
        addedEntries.forEach(didInsertEntry);
        updatedEntries.forEach(([entry, didUpdateFiledata]) => {
            if (didUpdateFiledata) {
                let didCallUpdateEntry = handleUpdateEntryData(entry);
                if (didCallUpdateEntry) {
                    return;
                }
            }
            handleUpdateEntry(entry);
        });

        didUpdateEntries();

        willCallUpdateEntries = false;
    }

    /**
     * We're initialising the entries array for the first time or it was emptied and now we're
     * filling it again
     */
    function init(rawEntries: FilePondEntrySource[]) {
        willCallUpdateEntries = true;

        /** We sanitized all the items */
        const onboardedEntries = filterTree(mapTree(rawEntries, onboardEntry), Boolean);

        tree.entries = onboardedEntries as FilePondEntry[];

        // recalculate indexes
        computeIndexes();

        // we added all these items
        eachTree(tree.entries, didInsertEntry);

        // we updated the list
        didUpdateEntries();

        willCallUpdateEntries = false;
    }

    /** We have items and now we're clearing the items list */
    function clear() {
        // no items to clear
        if (!tree.entries.length) {
            return;
        }

        willCallUpdateEntries = true;

        // TODO: fire remove event
        eachTree(tree.entries, (entry, _) => handleRemoveEntry({ entry, index: [-1] }));

        // set empty array
        tree.entries = [];

        // recalculate indexes
        clearIndexes();

        // we updated the list
        didUpdateEntries();

        willCallUpdateEntries = false;
    }

    return {
        on,

        insertEntries,
        findEntries,
        removeEntries,
        sortEntries,
        updateEntry,
        replaceEntry,
        moveEntry,

        set entries(entries: FilePondEntrySource[]) {
            // the entries passed need to be an array, if is same array we ignore this update
            if (!isArray(entries) || tree.entries === entries) {
                return;
            }

            // clear the list
            if (!entries.length) {
                clear();
                return;
            }

            // completely new tree
            if (!tree.entries.length) {
                init(entries);
                return;
            }

            // sync entries so they reflect new tree
            sync(entries);
        },

        get entries(): FilePondEntry[] {
            return tree.entries;
        },

        destroy() {
            // nothing yet
        },
    };
}
