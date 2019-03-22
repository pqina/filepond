import { isBoolean } from './isBoolean';
export const toBoolean = value => (isBoolean(value) ? value : value === 'true');
