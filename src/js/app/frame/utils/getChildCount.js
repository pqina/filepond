import { createElement } from './createElement';
const testElement = typeof document === 'undefined' ? {} : createElement('svg');
export const getChildCount = 'children' in testElement ? el => el.children.length : el => el.childNodes.length;
