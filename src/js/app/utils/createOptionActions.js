import { fromCamels } from '../../utils/fromCamels';
import { forin } from '../../utils/forin';

export const createOptionActions = options => (dispatch, query, state) => {
    const obj = {};
    forin(options, key => {
        const name = fromCamels(key, '_').toUpperCase();
        
        obj[`SET_${name}`] = action => {
            try {
                state.options[key] = action.value;
            } catch (e) {
                // nope, failed
            }

            // we successfully set the value of this option
            dispatch(`DID_SET_${name}`, { value: state.options[key] });
        };
    });
    return obj;
};
