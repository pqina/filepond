import { convertTo } from './convertTo';
import { getType } from './getType';

export const getValueByType = (newValue, defaultValue, valueType) => {

    // can always assign default value
    if (newValue === defaultValue) {
        return newValue;
    }

    // get the type of the new value
    let newValueType = getType(newValue);

    // is valid type?
    if (newValueType !== valueType) {
        // is string input, let's attempt to convert
        const convertedValue = convertTo(newValue, valueType);

        // what is the type now
        newValueType = getType(convertedValue);

        // no valid conversions found
        if (convertedValue === null) {
            throw `Trying to assign value with incorrect type to "${option}", allowed type: "${valueType}"`;
        } else {
            newValue = convertedValue;
        }
    }

    // assign new value
    return newValue;
}