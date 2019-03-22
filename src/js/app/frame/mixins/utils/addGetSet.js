export const addGetSet = (keys, obj, props, overwrite = false) => {
    obj = Array.isArray(obj) ? obj : [obj];
    obj.forEach(o => {
        keys.forEach(key => {
            let name = key;
            let getter = () => props[key];
            let setter = value => (props[key] = value);

            if (typeof key === 'object') {
                name = key.key;
                getter = key.getter || getter;
                setter = key.setter || setter;
            }

            if (o[name] && !overwrite) {
                return;
            }

            o[name] = {
                get: getter,
                set: setter
            };
        });
    });
};
