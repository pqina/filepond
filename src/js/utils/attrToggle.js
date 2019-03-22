import { attr } from './attr';
export const attrToggle = (element, name, state, enabledValue = '') => {
    if (state) {
        attr(element, name, enabledValue);
    } else {
        element.removeAttribute(name);
    }
};
