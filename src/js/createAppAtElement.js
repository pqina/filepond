import { getAttributesAsObject } from './utils/getAttributesAsObject';
import { createAppObject } from './createAppObject';
import { applyFilters } from './filter';
import { isObject } from './utils/isObject';

export const createAppAtElement = (element, options = {}) => {

    // how attributes of the input element are mapped to the options for the plugin
    const attributeMapping = {
        // translate to other name
        '^class$': 'className',
        '^multiple$': 'allowMultiple',
        '^capture$': 'captureMethod',
        '^webkitdirectory$': 'allowDirectoriesOnly',

        // group under single property
        '^server': {
            group: 'server',
            mapping: {
                '^process': {
                    group: 'process'
                },
                '^revert': {
                    group: 'revert'
                },
                '^fetch': {
                    group: 'fetch'
                },
                '^restore': {
                    group: 'restore'
                },
                '^load': {
                    group: 'load'
                }
            }
        },

        // don't include in object
        '^type$': false,
        '^files$': false
    };

    // add additional option translators
    applyFilters('SET_ATTRIBUTE_TO_OPTION_MAP', attributeMapping);

    // create final options object by setting options object and then overriding options supplied on element
    const mergedOptions = {
        ...options
    };
    
    const attributeOptions = getAttributesAsObject(
        element.nodeName === 'FIELDSET'
            ? element.querySelector('input[type=file]')
            : element,
        attributeMapping
    );
    
    // merge with options object
    Object.keys(attributeOptions).forEach(key => {
        if (isObject(attributeOptions[key])) {
            if (!isObject(mergedOptions[key])) {
                mergedOptions[key] = {};
            }
            Object.assign(mergedOptions[key], attributeOptions[key]);
        }
        else {
            mergedOptions[key] = attributeOptions[key];
        }
    });
    
    // if parent is a fieldset, get files from parent by selecting all input fields that are not file upload fields
    // these will then be automatically set to the initial files
    mergedOptions.files = (options.files || []).concat(
        Array.from(element.querySelectorAll('input:not([type=file])')).map(input => ({
            source: input.value,
            options: {
                type: input.dataset.type
            }
        }))
    );

    // build plugin
    const app = createAppObject(mergedOptions);

    // add already selected files
    if (element.files) {
        Array.from(element.files).forEach(file => {
            app.addFile(file);
        });
    }

    // replace the target element
    app.replaceElement(element);

    // expose
    return app;
};
