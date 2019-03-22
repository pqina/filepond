export const defineProperty = (obj, property, definition) => {
    if (typeof definition === 'function') {
        obj[property] = definition;
        return;
    }
    Object.defineProperty(obj, property, { ...definition });
};
