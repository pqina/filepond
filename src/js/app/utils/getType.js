import { isArray } from '../../utils/isArray';
import { isInt } from '../../utils/isInt';
import { isNull } from '../../utils/isNull';
import { isAPI } from './isAPI';

export const getType = value => {
    
    if (isArray(value)) {
        return 'array';
    }

    if (isNull(value)) {
        return 'null';
    }

    if (isInt(value)) {
        return 'int';
    }

    if (/^[0-9]+ ?(?:GB|MB|KB)$/gi.test(value)) {
        return 'bytes';
    }

    if (isAPI(value)) {
        return 'api';
    }

    return typeof value;
};
