import { toString } from './toString';
import { isInt } from './isInt';
import { toInt } from './toInt';

export const toBytes = (value, base = 1000) => {
    // is in bytes
    if (isInt(value)) {
        return value;
    }

    // is natural file size
    let naturalFileSize = toString(value).trim();

    // if is value in megabytes
    if (/MB$/i.test(naturalFileSize)) {
        naturalFileSize = naturalFileSize.replace(/MB$i/, '').trim();
        return toInt(naturalFileSize) * base * base;
    }

    // if is value in kilobytes
    if (/KB/i.test(naturalFileSize)) {
        naturalFileSize = naturalFileSize.replace(/KB$i/, '').trim();
        return toInt(naturalFileSize) * base;
    }

    return toInt(naturalFileSize);
};
