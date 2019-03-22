export const addEvent = element => (type, fn) => {
    element.addEventListener(type, fn);
};
