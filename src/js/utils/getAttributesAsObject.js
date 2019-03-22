import { toCamels } from './toCamels';
import { attr } from './attr';
import { forin } from './forin';
import { lowerCaseFirstLetter } from './lowerCaseFirstLetter';
import { isString } from './isString';
import { isObject } from './isObject';

const attributeNameToPropertyName = attributeName =>
    toCamels(attributeName.replace(/^data-/, ''));

const mapObject = (object, propertyMap) => {
    // remove unwanted
    forin(propertyMap, (selector, mapping) => {
        forin(object, (property, value) => {
            // create regexp shortcut
            const selectorRegExp = new RegExp(selector);

            // tests if
            const matches = selectorRegExp.test(property);

            // no match, skip
            if (!matches) {
                return;
            }

            // if there's a mapping, the original property is always removed
            delete object[property];

            // should only remove, we done!
            if (mapping === false) {
                return;
            }

            // move value to new property
            if (isString(mapping)) {
                object[mapping] = value
                return;
            }

            // move to group
            const group = mapping.group;
            if (isObject(mapping) && !object[group]) {
                object[group] = {};
            }
            
            object[group][
                lowerCaseFirstLetter(property.replace(selectorRegExp, ''))
            ] = value;
        });

        // do submapping
        if (mapping.mapping) {
            mapObject(object[mapping.group], mapping.mapping);
        }
    });
};

export const getAttributesAsObject = (node, attributeMapping = {}) => {
    // turn attributes into object
    const attributes = [];
    forin(node.attributes, index => {
        attributes.push(node.attributes[index]);
    });
    
    const output = attributes
        .filter(attribute => attribute.name)
        .reduce((obj, attribute) => {
        
        const value = attr(
            node,
            attribute.name
        );

        obj[attributeNameToPropertyName(attribute.name)] = value === attribute.name ? true : value;
        return obj;
    }, {});

    // do mapping of object properties
    mapObject(output, attributeMapping);

    return output;
};