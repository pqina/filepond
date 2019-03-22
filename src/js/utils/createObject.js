import { defineProperty } from './defineProperty';
import { forin } from './forin';

export const createObject = definition => {
    const obj = {};
    forin(definition, property => {
        defineProperty(obj, property, definition[property]);
    });
    return obj;
};
