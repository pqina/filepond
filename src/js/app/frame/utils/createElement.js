import { forin } from '../../../utils/forin';
import { attr } from '../../../utils/attr';

const ns = 'http://www.w3.org/2000/svg';
const svgElements = ['svg', 'path']; // only svg elements used

const isSVGElement = tag => svgElements.includes(tag);

export const createElement = (tag, className, attributes = {}) => {
    if (typeof className === 'object') {
        attributes = className;
        className = null;
    }
    const element = isSVGElement(tag)
        ? document.createElementNS(ns, tag)
        : document.createElement(tag);
    if (className) {
        if (isSVGElement(tag)) {
            attr(element, 'class', className);
        } else {
            element.className = className;
        }
    }
    forin(attributes, (name, value) => {
        attr(element, name, value);
    });
    return element;
};
