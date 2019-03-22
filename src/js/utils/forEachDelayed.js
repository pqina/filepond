export const forEachDelayed = (items, cb, delay = 75) =>
    items.map(
        (item, index) =>
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    cb(item);
                    resolve();
                }, delay * index);
            })
    );
