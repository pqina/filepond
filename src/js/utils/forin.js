export const forin = (obj, cb) => {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }

        cb(key, obj[key]);
    }
};
