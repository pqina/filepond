import { createObject } from '../../utils/createObject';
import { createOption } from './createOption';
import { forin } from '../../utils/forin';

export const createOptions = options => {
    const obj = {};
    forin(options, prop => {
        const optionDefinition = options[prop];
        obj[prop] = createOption(
            optionDefinition[0],
            optionDefinition[1]
        );
    });
    return createObject(obj);
};
