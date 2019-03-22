export const toFunctionReference = string => {
    let ref = self;
    let levels = string.split('.');
    let level = null;
    while ((level = levels.shift())) {
        ref = ref[level];
        if (!ref) {
            return null;
        }
    }
    return ref;
};
