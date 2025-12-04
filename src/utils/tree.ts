import { isArray } from './test.js';

type TreeNode = {
    [key: string]: any;
};

/** Applies a function to every item in a tree structure */
export function eachTree<T extends TreeNode>(
    items: T[],
    each: (item: T, index: number) => void,
    subTreeKey = 'entries'
) {
    items.forEach((item, index) => {
        each(item, index);
        if (isArray(item[subTreeKey])) {
            eachTree(item[subTreeKey] as T[], each);
        }
    });
}

/** Searches for an item in a tree structure */
export function findTree<T extends TreeNode>(
    items: T[],
    find: (item: T, index: number) => boolean,
    subTreeKey = 'children'
) {
    items.forEach((item, index) => {
        if (find(item, index)) {
            return item;
        }
        if (isArray(item[subTreeKey])) {
            findTree(item[subTreeKey] as T[], find);
        }
    });
    return undefined;
}

/** Applies a map function to a tree structure */
export const mapTree = (
    items: any[],
    map: (item: any, index: number, items: any[]) => any,
    subTreeKey = 'entries'
): any[] => {
    const res = [];
    for (const [index, item] of items.entries()) {
        // handle falsy items
        if (!item) {
            res.push(item);
            continue;
        }

        // map the current item
        const mappedItem = map(item, index, items);

        // if has a subtree we map the subtree recursively
        if (isArray(mappedItem[subTreeKey])) {
            mappedItem[subTreeKey] = mapTree(item[subTreeKey], map, subTreeKey);
        }

        // add to mapped results
        res.push(mappedItem);
    }

    return res;
};

/** Applies an async map function to a tree structure */
export const mapTreeAsync = async (
    items: any[],
    map: (item: any, index: number, items: any[]) => Promise<any>,
    subTreeKey = 'entries'
): Promise<any[]> => {
    const res = [];
    for (const [index, item] of items.entries()) {
        // handle falsy items
        if (!item) {
            res.push(item);
            continue;
        }

        // map the current item
        const mappedItem = await map(item, index, items);

        // if has a subtree we map the subtree recursively
        if (isArray(mappedItem[subTreeKey])) {
            mappedItem[subTreeKey] = await mapTreeAsync(item[subTreeKey], map, subTreeKey);
        }

        // add to mapped results
        res.push(mappedItem);
    }

    return res;
};

/** Applies a filter function to a tree structure */
export const filterTree = <T extends TreeNode>(
    items: T[],
    filter: (item: T) => boolean,
    subTreeKey = 'entries'
): T[] => {
    const res = [];
    for (const item of items) {
        // check if should exclude this item
        if (!filter(item)) {
            continue;
        }

        // clone the item object, we don't want to manipulate the original tree
        const filteredItem = { ...item };

        // check if item has array
        if (isArray(filteredItem[subTreeKey])) {
            // @ts-ignore
            filteredItem[subTreeKey] = filterTree(item[subTreeKey], filter, subTreeKey);
        }

        res.push(filteredItem);
    }
    return res;
};

/** Flattens a tree structure to a new array */
export const flattenTree = <T extends TreeNode>(
    items: T[],
    subTreeKey: keyof T = 'entries'
): T[] => {
    let res: T[] = [];
    for (const item of items) {
        res = [...res, item];
        if (Array.isArray(item[subTreeKey])) {
            res.push(...flattenTree(item[subTreeKey], subTreeKey));
        }
    }
    return res;
};

/** Sorts a tree structure in place */
export const sortTree = <T extends TreeNode>(
    items: T[],
    sort: (a: T, b: T) => number,
    subTreeKey = 'entries'
): T[] => {
    items.sort(sort);
    for (const item of items) {
        const subTree = item[subTreeKey] as T[];
        if (!subTree) {
            continue;
        }
        // @ts-ignore
        item[subTreeKey] = sortTree(subTree, sort, subTreeKey);
    }
    return items;
};
