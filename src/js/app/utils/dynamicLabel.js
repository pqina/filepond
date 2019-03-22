import { isFunction } from '../../utils/isFunction';

export const dynamicLabel = (label) => (...params) => isFunction(label) ? label(...params) : label;