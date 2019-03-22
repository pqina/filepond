import { isObject } from '../../utils/isObject';
import { isString } from '../../utils/isString';

export const isAPI = value => {
    return (
        isObject(value) &&
        isString(value.url) &&
        isObject(value.process) &&
        isObject(value.revert) &&
        isObject(value.restore) &&
        isObject(value.fetch)
    );
};
