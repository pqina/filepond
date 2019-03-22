import { getNonNumeric } from './getNonNumeric';
import { getDecimalSeparator } from './getDecimalSeparator';

export const getThousandsSeparator = () => {
    // Added for browsers that do not return the thousands separator (happend on native browser Android 4.4.4)
    // We check against the normal toString output and if they're the same return a comma when decimal separator is a dot
    const decimalSeparator = getDecimalSeparator();
    const thousandsStringWithSeparator = (1000.0).toLocaleString();
    const thousandsStringWithoutSeparator = (1000.0).toString();
    if (thousandsStringWithSeparator !== thousandsStringWithoutSeparator) {
        return getNonNumeric(thousandsStringWithSeparator)[0];
    }
    return decimalSeparator === '.' ? ',' : '.';
};
