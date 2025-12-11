import { isArray, isBlobOrFile, isFunction, isObject, isObjectOrArray } from './test.js';

/**
 * Test if object "a" property values are equal to object "b" property values, doesn't deep compare,
 * and only compares props on object "a" with "b", "b" may have more props
 */
export function isObjectValuesEqual(a: any, b: any) {
    for (const [key, value] of Object.entries(a)) {
        // when comparing functions
        if (isFunction(value) && isFunction(b[key])) {
            if (value.toString() !== b[key].toString()) {
                return false;
            }
            continue;
        }

        if (value !== b[key]) {
            return false;
        }
    }
    return true;
}

/** Merges source into target */
export function deepAssign(
    target: { [key: string]: any },
    ...sources: { [key: string]: any }[]
): { [key: string]: any } {
    sources.forEach((source) => {
        for (const [key, value] of Object.entries(source)) {
            if (isObject(value)) {
                if (!isObject(target[key]) || isBlobOrFile(value)) {
                    target[key] = value;
                } else {
                    deepAssign(target[key], value);
                }
            } else {
                Object.assign(target, { [key]: value });
            }
        }
    });
    return target;
}

/** Tests if properties and values described in obj are same in target */
export function deepOverlap(props: { [key: string]: any }, target: { [key: string]: any }) {
    for (const [key, value] of Object.entries(props)) {
        if (isObject(value)) {
            if (!deepOverlap(value, target[key])) {
                return false;
            }
        } else if (isArray(value)) {
            if (!arrayItemsOverlap(value, target[key])) {
                return false;
            }
        } else if (value !== target[key]) {
            return false;
        }
    }
    return true;
}

/**
 * Tests if array items in a overlap with items in b, will also return true if b has items but a has
 * no items
 */
export function arrayItemsOverlap(a: any, b: any) {
    if (!isArray(a) || !isArray(b)) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (isObjectOrArray(a[i]) && isObjectOrArray(b[i])) {
            return deepOverlap(a, b);
        } else if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

export function hasOwnProp(obj: { [key: string]: any } = {}, prop: string) {
    return obj.hasOwnProperty(prop);
}

export function hasOwnProps(obj: { [key: string]: any } = {}, props: string[] = []) {
    return props.every((prop) => hasOwnProp(obj, prop));
}

export function hasProps(obj: { [key: string]: any } = {}) {
    return isObject(obj) && !!Object.keys(obj).length;
}

export function copyDescriptors(source: any, target: any) {
    const sourceDescriptors = Object.getOwnPropertyDescriptors(source);
    const targetDescriptors = Object.getOwnPropertyDescriptors(target);

    Object.entries(sourceDescriptors).forEach(([key, { get, set, value }]) => {
        if (targetDescriptors[key]) {
            return;
        }

        if (get || set) {
            Object.defineProperty(target, key, {
                set: set ? (value) => (source[key] = value) : undefined,
                get: get ? () => source[key] : undefined,
            });
        } else if (isFunction(value)) {
            target[key] = source[key];
        }
    });
    return target;
}

export function nullToUndefined(value: null) {
    if (value === null) {
        return undefined;
    }
    return value;
}
