import { getValueByType } from './getValueByType';

export const createOption = (defaultValue, valueType) => {
    let currentValue = defaultValue;
    return {
        enumerable: true,
        get: () => currentValue,
        set: newValue => {
            currentValue = getValueByType(newValue, defaultValue, valueType);
        }
    };
};
