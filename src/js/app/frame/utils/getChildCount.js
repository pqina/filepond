import { createElement } from './createElement';
const testElement = createElement('svg');
export const getChildCount = 'children' in testElement ? el => el.children.length : el => el.childNodes.length;