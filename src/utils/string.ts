export function transformFirstLetter(str: string, fn: (char: string) => string) {
    return fn(str.charAt(0)) + str.slice(1);
}

export function upperCaseFirstLetter(str: string) {
    return transformFirstLetter(str, (char) => char.toUpperCase());
}

/** Returns a unique id of length, `length` should be between 1 and 11 */
export function getUniqueId(length = 11) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + Math.min(length, 11));
}

export function lowerCaseFirstLetter(str: string) {
    return transformFirstLetter(str, (char) => char.toLowerCase());
}

export function toCamelCase(str: string, separator = '-') {
    return lowerCaseFirstLetter(toPascalCase(str, separator));
}

export function toPascalCase(str: string, separator = '-') {
    return str.replace(new RegExp(`${separator}.`, 'g'), (sub) => sub.charAt(1).toUpperCase());
}

export function toCamelParts(str: string) {
    return str.split(/[\s_\b]|(?=[A-Z])/);
}

/** Turns a camelCase string into a kebab-case string, already kebab case strings aren't modified */
export function toKebabCase(str: string) {
    return toCamelParts(str).join('-').toLowerCase();
}

/** Returns the default locale for the current client, this is used when no locale is supplied */
let runtimeDefaultLocale: string | null = null;
export function getRuntimeDefaultLocale() {
    if (runtimeDefaultLocale === null) {
        runtimeDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
    }
    return runtimeDefaultLocale;
}
