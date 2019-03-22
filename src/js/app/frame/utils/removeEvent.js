export const removeEvent = element => (type, fn) => {
    element.removeEventListener(type, fn);
};
