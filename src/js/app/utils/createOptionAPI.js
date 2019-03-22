import { fromCamels } from '../../utils/fromCamels';
import { forin } from '../../utils/forin';

export const createOptionAPI = (store, options) => {
    const obj = {};
    forin(options, key => {
        obj[key] = {
            get: () => store.getState().options[key],
            set: value => {
                store.dispatch(`SET_${fromCamels(key, '_').toUpperCase()}`, {
                    value
                });
            }
        };
    });
    return obj;
};
