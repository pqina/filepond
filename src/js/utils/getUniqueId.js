export const getUniqueId = () =>
    Math.random()
        .toString(36)
        .substring(2, 11);
