import { isNumber } from './isNumber';
import { isString } from './isString';
import { toString } from './toString';
export const toNumber = value =>
    isNumber(value)
        ? value
        : isString(value) ? toString(value).replace(/[a-z]+/gi, '') : 0;
