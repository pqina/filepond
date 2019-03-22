import { forin } from '../../utils/forin';
export const mergeOptionObject = (originalObject, newObject) => {
    const obj = {};
    forin(originalObject, key => {
        obj[key] = newObject[key] || originalObject[key];
    });
    return obj;
};
