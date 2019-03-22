import { toArray } from '../../utils/toArray';
import { toBoolean } from '../../utils/toBoolean';
import { toInt } from '../../utils/toInt';
import { toFloat } from '../../utils/toFloat';
import { toBytes } from '../../utils/toBytes';
import { toString } from '../../utils/toString';
import { isFunction } from '../../utils/isFunction';
import { toFunctionReference } from '../../utils/toFunctionReference';
import { toServerAPI } from './toServerAPI';
import { getType } from './getType';

const replaceSingleQuotes = (str) => str
    .replace(/{\s*'/g,'{"')
    .replace(/'\s*}/g,'"}')
    .replace(/'\s*:/g,'":')
    .replace(/:\s*'/g,':"')
    .replace(/,\s*'/g,',"')
    .replace(/'\s*,/g,'",')

const conversionTable = {
    array: toArray,
    boolean: toBoolean,
    int: value => getType(value) === 'bytes' ? toBytes(value) : toInt(value),
    float: toFloat,
    bytes: toBytes,
    string: value => isFunction(value) ? value : toString(value),
    serverapi: toServerAPI,
    object: value => {
        try {
            return JSON.parse(replaceSingleQuotes(value))
        }
        catch(e) {
            return null;
        }
    },
    function: value => toFunctionReference(value)
};

export const convertTo = (value, type) => conversionTable[type](value);
