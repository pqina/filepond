// all registered filters
const filters = [];

// loops over matching filters and passes options to each filter, returning the mapped results
export const applyFilterChain = (key, value, utils) =>
    new Promise((resolve, reject) => {
        // find matching filters for this key
        const matchingFilters = filters
            .filter(f => f.key === key)
            .map(f => f.cb);

        // resolve now
        if (matchingFilters.length === 0) {
            resolve(value);
            return;
        }

        // first filter to kick things of
        const initialFilter = matchingFilters.shift();

        // chain filters
        matchingFilters
            .reduce(
                // loop over promises passing value to next promise
                (current, next) => current.then(value => next(value, utils)),

                // call initial filter, will return a promise
                initialFilter(value, utils)

                // all executed
            )
            .then(value => resolve(value))
            .catch(error => reject(error));
    });

export const applyFilters = (key, value, utils) =>
    filters.filter(f => f.key === key).map(f => f.cb(value, utils));

// adds a new filter to the list
export const addFilter = (key, cb) => filters.push({ key, cb });
