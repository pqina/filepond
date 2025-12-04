// can cache function responses
const cachedFunctionResponses = new Map();
export function cache(fn: Function, args: any, cacheKey?: any) {
    // get all calls to this function
    let cachedFunctionCalls = cachedFunctionResponses.get(fn);
    if (!cachedFunctionCalls) {
        cachedFunctionCalls = new Map();
        cachedFunctionResponses.set(fn, cachedFunctionCalls);
    }

    // get cached response from this function
    const key = cacheKey ?? args[0];
    let res = cachedFunctionCalls.get(key);
    if (!res) {
        res = fn(...args);
        cachedFunctionCalls.set(key, res);
    }

    return res;
}
