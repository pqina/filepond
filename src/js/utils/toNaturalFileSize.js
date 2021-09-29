export const toNaturalFileSize = (bytes, decimalSeparator = '.', base = 1000, options = {}) => {
    const {
        labelBytes = 'bytes',
        labelKilobytes = 'KB',
        labelMegabytes = 'MB',
        labelGigabytes = 'GB',
    } = options;

    // no negative byte sizes
    bytes = Math.round(Math.abs(bytes));

    const KB = base;
    const MB = base * base;
    const GB = base * base * base;

    // just bytes
    if (bytes < KB) {
        return `${bytes} ${labelBytes}`;
    }

    // kilobytes
    if (bytes < MB) {
        return `${Math.floor(bytes / KB)} ${labelKilobytes}`;
    }

    // megabytes
    if (bytes < GB) {
        return `${removeDecimalsWhenZero(bytes / MB, 1, decimalSeparator)} ${labelMegabytes}`;
    }

    // gigabytes
    return `${removeDecimalsWhenZero(bytes / GB, 2, decimalSeparator)} ${labelGigabytes}`;
};

const removeDecimalsWhenZero = (value, decimalCount, separator) => {
    return value
        .toFixed(decimalCount)
        .split('.')
        .filter(part => part !== '0')
        .join(separator);
};
