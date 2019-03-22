export const toNaturalFileSize = (bytes, decimalSeparator = '.') => {
    // nope, no negative byte sizes
    bytes = Math.round(Math.abs(bytes));

    // just bytes
    if (bytes < 1000) {
        return `${bytes} bytes`;
    }

    // kilobytes
    if (bytes < MB) {
        return `${Math.floor(bytes / KB)} KB`;
    }

    // megabytes
    if (bytes < GB) {
        return `${removeDecimalsWhenZero(bytes / MB, 1, decimalSeparator)} MB`;
    }

    // gigabytes
    return `${removeDecimalsWhenZero(bytes / GB, 2, decimalSeparator)} GB`;
};

const KB = 1000;
const MB = 1000000;
const GB = 1000000000;

const removeDecimalsWhenZero = (value, decimalCount, separator) => {
    return value
        .toFixed(decimalCount)
        .split('.')
        .filter(part => part !== '0')
        .join(separator);
};
