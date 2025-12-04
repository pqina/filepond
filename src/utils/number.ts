import { getRuntimeDefaultLocale } from './string.js';
import { isArray, isString } from './test.js';

const numberToFloatCache: { [key: string]: [string, string] } = {};

export function numberToFloat(v: string, locale?: string | string[]) {
    let thousandsChar: string;
    let decimalsChar: string;
    const localeIndex = isString(locale)
        ? locale
        : isArray(locale)
          ? locale.join(',')
          : getRuntimeDefaultLocale();

    if (numberToFloatCache[localeIndex]) {
        [thousandsChar, decimalsChar] = numberToFloatCache[localeIndex];
    } else {
        const formatter = new Intl.NumberFormat(locale);
        thousandsChar = formatter.format(1337).replace(/\d/g, '');
        decimalsChar = formatter.format(1.5).replace(/\d/g, '');
        numberToFloatCache[localeIndex] = [thousandsChar, decimalsChar];
    }

    return parseFloat(v.trim().split(thousandsChar).join('').replace(decimalsChar, '.'));
}

export function anyToInt(value: any, radix = 10) {
    if (value == null) {
        return undefined;
    }
    return parseInt(value, radix);
}

export function anyToFloat(value: any) {
    if (value == null) {
        return undefined;
    }
    return parseFloat(value);
}
