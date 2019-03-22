import { isNumber } from './isNumber';
export const isInt = value =>
    isNumber(value) && isFinite(value) && Math.floor(value) === value;
