import { createElement } from './createElement';
import { isBrowser } from '../../../utils/isBrowser';
const testElement = isBrowser() ? createElement('svg') : {};
export const getChildCount = 'children' in testElement ? el => el.children.length : el => el.childNodes.length;