import { isString } from '../../utils/isString';
import { toBoolean } from '../../utils/toBoolean';
import { forin } from '../../utils/forin';

const methods = {
    process: 'POST',
    revert: 'DELETE',
    fetch: 'GET',
    restore: 'GET',
    load: 'GET'
};

export const createServerAPI = outline => {
    const api = {};

    api.url = isString(outline) ? outline : outline.url || '';
    api.timeout = outline.timeout ? parseInt(outline.timeout, 10) : 0;

    forin(methods, key => {
        api[key] = createAction(key, outline[key], methods[key], api.timeout);
    });

    // special treatment for remove
    api.remove = outline.remove || null;

    return api;
};

const createAction = (name, outline, method, timeout) => {
    // is explicitely set to null so disable
    if (outline === null) {
        return null;
    }

    // if is custom function, done! Dev handles everything.
    if (typeof outline === 'function') {
        return outline;
    }

    // build action object
    const action = {
        url: method === 'GET' ? `?${name}=` : '',
        method,
        headers: {},
        withCredentials: false,
        timeout,
        onload: null,
        ondata: null,
        onerror: null
    };

    // is a single url
    if (isString(outline)) {
        action.url = outline;
        return action;
    }

    // overwrite
    Object.assign(action, outline);

    // see if should reformat headers;
    if (isString(action.headers)) {
        const parts = action.headers.split(/:(.+)/);
        action.headers = {
            header: parts[0],
            value: parts[1]
        };
    }

    // if is bool withCredentials
    action.withCredentials = toBoolean(action.withCredentials);

    return action;
};
