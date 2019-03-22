export const getParameters = (args, filters) => {
    return Object.keys(filters).reduce((acc, name) => {
        acc[name] = args.find(arg => typeof arg === filters[name]);
        return acc;
    }, {});
};
