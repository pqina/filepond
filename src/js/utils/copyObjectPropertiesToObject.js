export const copyObjectPropertiesToObject = (src, target, excluded) => {
    Object.getOwnPropertyNames(src)
        .filter(property => !excluded.includes(property))
        .forEach(key =>
            Object.defineProperty(
                target,
                key,
                Object.getOwnPropertyDescriptor(src, key)
            )
        );
};
