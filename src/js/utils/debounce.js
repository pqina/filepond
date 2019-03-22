export const debounce = (func, interval = 16, immidiateOnly = true) => {
    let last = Date.now();
    let timeout = null;

    return (...args) => {
        clearTimeout(timeout);

        const dist = Date.now() - last;

        const fn = () => {
            last = Date.now();
            func(...args);
        };

        if (dist < interval) {
            // we need to delay by the difference between interval and dist
            // for example: if distance is 10 ms and interval is 16 ms,
            // we need to wait an additional 6ms before calling the function)
            if (!immidiateOnly) {
                timeout = setTimeout(fn, interval - dist);
            }
        } else {
            // go!
            fn();
        }
    };
};
