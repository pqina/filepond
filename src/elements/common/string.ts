import type { Locale, DynamicLocale, DynamicLocaleMap } from '../../types/index.js';
import { lowerCaseFirstLetter, upperCaseFirstLetter } from '../../utils/string.js';
import { arrayRemoveFalsy } from '../../utils/array.js';
import { isNullOrUndefined, isString } from '../../utils/test.js';
import { createDefaultIcon } from './html.js';
import { hasOwnProp } from '../../utils/object.js';
import { cache } from '../../utils/cache.js';

/** Removes falsy values, concatenated strings, returns undefined if results in empty string */
export function toClassName(...names: (string | undefined)[]) {
    return arrayRemoveFalsy(names).join(' ') || undefined;
}

export function statusCodeToLocaleKey(code: string) {
    return lowerCaseFirstLetter(
        `${code
            .split('_')
            .map((str) => upperCaseFirstLetter(str.toLowerCase()))
            .join('')}`
    );
}

/** Variable: {{my-variable}} */
function getValueByVariable(variable: string, value: any) {
    return getObjectValueByString(variable.substring(2, variable.length - 2), value);
}

/** Drills down into an objecto find a prop value, if is null or undefined, returns empty string */
export function getObjectValueByString(selector: string, value: any) {
    const levels = selector.split('.');
    for (const level of levels) {
        value = value[level];
        if (isNullOrUndefined(value)) {
            return '';
        }
    }
    return value;
}

export function stringReplaceVariables(
    label: string | DynamicLocale,
    data?: { [key: string]: string },
    locale: Locale = {}
) {
    if (isString(label)) {
        if (!data) {
            return label;
        }

        // find all variables in label can be {{name}} or {{object.name}} or {{object.name.foo}}
        const variables = Array.from(label.matchAll(/\{{[\.a-z]+\}}/gi));
        for (const { 0: variable } of variables) {
            const value = getValueByVariable(variable, data);

            // will try to find a localized representation for this value
            const localValue = locale[value] ?? value;

            // @ts-ignore replace each variable with values in entries object
            label = label.replace(variable, localValue);
        }

        return label;
    }

    const { variables, template } = label;
    const res = Object.entries(variables).reduce((template, [variable, variableMapOrConfig]) => {
        let context: string;
        let map: DynamicLocaleMap;
        if ('context' in variableMapOrConfig && isString(variableMapOrConfig.context)) {
            context = variableMapOrConfig.context;
            map = variableMapOrConfig.map;
        } else {
            context = variable;
            map = variableMapOrConfig as DynamicLocaleMap;
        }

        const dataValue = getObjectValueByString(context, data);

        const labelValue = isNullOrUndefined(map[dataValue]) ? map.else : map[dataValue];

        return template.replace(`{{${variable}}}`, labelValue);
    }, template);

    return stringReplaceVariables(res, data, locale);
}

export function getValueByKeyFromData(
    key: string,
    data: { [key: string]: string },
    defaultValue = ''
) {
    return isString(key) ? (data[key] ?? key) : defaultValue;
}

export function statusToLabel(
    { code, subcode, values }: any,
    locale: Locale,
    { debug }: { debug: boolean }
) {
    // if a subcode is supplied we use that instead of the main status code
    const localeCode = subcode ?? code;

    // get and format the label
    const labelKey = cache(statusCodeToLocaleKey, [localeCode]);
    const hasLabel = !isNullOrUndefined(locale[labelKey]);

    // if no label and we're not debuggin we don't display this status
    if (!hasLabel && !debug) {
        return;
    }

    // get label
    const label = hasLabel ? stringReplaceVariables(locale[labelKey], values, locale) : undefined;

    // not debugging
    if (!debug) {
        return label;
    }

    // in debug mode log object
    let valuesStr = '';
    if (values) {
        valuesStr = `{${Object.entries(values)
            .map(([key, value]) => `${key}: "${value}"`)
            .join(', ')}}`;
    }

    return hasLabel
        ? `${label} ${code}${subcode ? ` ${subcode}` : ''} ${valuesStr}`
        : `${code}${subcode ? ` ${subcode}` : ''} ${valuesStr}`;
}

export function statusToIcon(
    { type }: { type: string },
    locale: Locale,
    assets: { [key: string]: string }
) {
    // test if has icon
    const assetKey = type;
    const hasIcon = !isNullOrUndefined(assets[assetKey]);
    const hasTitle = !isNullOrUndefined(locale[assetKey]);

    // get the icon for this type
    if (!hasIcon || !hasTitle) {
        return;
    }

    return createDefaultIcon(assets[assetKey], {
        // Should also have title
        title: locale[assetKey] as string,
    });
}

/** Automatically replace labels and icons */
export function withResources(
    props: any,
    resourceMap: {
        [componentProperty: string]: string;
    },
    resources: { locale: Locale; assets: { [key: string]: string } }
) {
    const keys = Object.keys(resourceMap);

    // the keys don't occur in this props object, just return props
    if (!keys.some((key) => hasOwnProp(props, key))) {
        return props;
    }

    // copy paste
    const res = {
        ...props,
    };

    // replace key
    for (const key of keys) {
        if (props[key] === undefined) continue;

        // locale | assets
        const dataset = resourceMap[key];

        // original prop value (is locale or assets key, could also be actual value)
        const value = props[key];

        // @ts-ignore we use entry in locale/assets or we use the prop value if not found (also makes it easier to spot not set props)
        res[key] = resources[dataset][value] ?? value;
    }

    return res;
}
