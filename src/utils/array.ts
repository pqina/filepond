export enum SortOrder {
    ASCENDING,
    DESCENDING,
}

/** Wraps value in array if is not an array */
export function arrayWrap<T>(v: T | T[]): T[] {
    return Array.isArray(v) ? v : [v];
}

/** Add unique value to array */
export function arrayAddUnique<T>(arr: T[], value: T, compare = (item: T) => item !== value): T[] {
    return [...arr.filter(compare), value];
}

/** Sorts an array by a `numericProp` value in `SortOrder` direction */
export function arraySortByItemProp(
    arr: any[],
    numericProp: string,
    direction: SortOrder = SortOrder.ASCENDING
) {
    const dir = direction === SortOrder.ASCENDING ? 1 : -1;
    arr.sort((a, b) => {
        if (a[numericProp] < b[numericProp]) {
            return -1 * dir;
        }
        if (a[numericProp] > b[numericProp]) {
            return 1 * dir;
        }
        return 0;
    });
}

/** Remove item from array and return copy */
export function arrayRemove<T>(arr: T[], compare: (item: T) => boolean): T[] {
    return arr.filter((item) => !compare(item));
}

/** Remove item(s) from array in-place, returns removed items */
export function arrayRemoveInPlace<T>(
    arr: T[],
    predicate: (value: T, index: number, obj: any[]) => boolean
): T[] {
    let res: T[] = [];

    const hits = arr.filter(predicate);
    hits.forEach((hit) => {
        const index = arr.indexOf(hit);
        res.push(...arr.splice(index, 1));
    });

    return res;
}

export function arrayRemoveFalsy<T>(arr: T[]) {
    return arr.filter(Boolean) as Exclude<T, null | undefined | void>[];
}

/** Add item(s) to array at index */
export function arrayInsertAtIndex<T>(arr: T[], index: number, ...itemsToInsert: T[]): T[] {
    return [...arr.slice(0, index), ...itemsToInsert, ...arr.slice(index)];
}

export function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    const item = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    return arr;
}

export function arraySwap<T>(arr: T[], indexA: number, indexB: number): T[] {
    const itemA = arr[indexA];
    const itemB = arr[indexB];
    arr[indexA] = itemB;
    arr[indexB] = itemA;
    return arr;
}

/** Tests if array lengths are the same and if items in array are the same instances */
export function arrayItemsEqual(a: any[], b: any[]) {
    if (a === b) {
        return true;
    }

    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

export function arrayGetSurroundingItems<T>(arr: T[], index: number, total: number): T[] {
    const half = Math.floor(total / 2);
    const start = Math.max(0, index - half);
    const end = Math.min(arr.length, start + total);
    const adjustedStart = Math.max(0, end - total); // in case start is too close to the end
    return arr.slice(adjustedStart, end);
}
