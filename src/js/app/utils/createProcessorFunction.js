import { isString } from '../../utils/isString';
import { createFileProcessorFunction } from './createFileProcessorFunction';

export const createProcessorFunction = (apiUrl = '', action, name, options) => {
    
    // custom handler (should also handle file, load, error, progress and abort)
    if (typeof action === 'function') return (...params) => action(name, ...params, options);

    // no action supplied
    if (!action || !isString(action.url)) return null;

    // internal handler
    return createFileProcessorFunction(apiUrl, action, name, options);
};