export const toNaturalFileSize = (bytes, decimalSeparator = '.', base = 1000) => {
    // no negative byte sizes
    bytes = Math.round(Math.abs(bytes));

    const KB = base;
    const MB = base * base;
    const GB = base * base * base;
    
    // just bytes
    if (bytes < KB) {
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

const removeDecimalsWhenZero = (value, decimalCount, separator) => {
    return value
        .toFixed(decimalCount)
        .split('.')
        .filter(part => part !== '0')
        .join(separator);
};
