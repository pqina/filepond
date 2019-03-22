import { isArray } from './isArray';
import { isEmpty } from './isEmpty';
import { trim } from './trim';
import { toString } from './toString';

export const toArray = (value, splitter = ',') => {
    if (isEmpty(value)) {
        return [];
    }
    if (isArray(value)) {
        return value;
    }
    return toString(value)
        .split(splitter)
        .map(trim)
        .filter(str => str.length);
};
