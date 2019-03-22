export const attr = (node, name, value = null) => {
    if (value === null) {
        return node.getAttribute(name) || node.hasAttribute(name);
    }
    node.setAttribute(name, value);
};
