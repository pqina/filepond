import { fromCamels } from '../../utils/fromCamels';
import { forin } from '../../utils/forin';

export const createOptionQueries = options => state => {
    const obj = {};
    forin(options, key => {
        obj[`GET_${fromCamels(key, '_').toUpperCase()}`] = action =>
            state.options[key];
    });
    return obj;
};
