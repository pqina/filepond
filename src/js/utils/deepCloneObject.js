import { isObject } from './isObject';
import { isArray } from './isArray';

export const deepCloneObject = (src) => {
    if (!isObject(src)) return src;
    const target = isArray(src) ? [] : {};
    for (const key in src) {
        if (!src.hasOwnProperty(key)) continue;
        const v = src[key];
        target[key] = v && isObject(v) ? deepCloneObject(v) : v;
    }
    return target;
}