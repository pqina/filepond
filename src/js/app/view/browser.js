import { createView, createRoute } from '../frame/index';
import { attrToggle } from '../../utils/attrToggle';
import { resetFileInput } from '../../utils/resetFileInput';
import { attr } from '../../utils/attr';

const create = ({ root, props }) => {

    // set id so can be referenced from outside labels
    root.element.id = `filepond--browser-${props.id}`;

    // set name of element (is removed when a value is set)
    attr(root.element, 'name', root.query('GET_NAME'));

    // we have to link this element to the status element
    attr(root.element, 'aria-controls', `filepond--assistant-${props.id}`);

    // set label, we use labelled by as otherwise the screenreader does not read the "browse" text in the label (as it has tabindex: 0)
    attr(root.element, 'aria-labelledby', `filepond--drop-label-${props.id}`);

    // handle changes to the input field
    root.ref.handleChange = e => {
        if (!root.element.value) {
            return;
        }

        // extract files
        const files = Array.from(root.element.files);

        // we add a little delay so the OS file select window can move out of the way before we add our file
        setTimeout(() => {
            // load files
            props.onload(files);

            // reset input, it's just for exposing a method to drop files, should not retain any state
            resetFileInput(root.element);
        }, 250);
    }
    root.element.addEventListener('change', root.ref.handleChange);
};

const setAcceptedFileTypes = ({ root, action }) => {
    attrToggle(
        root.element,
        'accept',
        !!action.value,
        action.value ? action.value.join(',') : ''
    );
};

const toggleAllowMultiple = ({ root, action }) => {
    attrToggle(root.element, 'multiple', action.value);
};

const toggleDisabled = ({ root, action }) => {
    const isDisabled = root.query('GET_DISABLED');
    const doesAllowBrowse = root.query('GET_ALLOW_BROWSE');
    const disableField = isDisabled || !doesAllowBrowse;
    attrToggle(root.element, 'disabled', disableField);
}

const toggleRequired = ({ root, action }) => {
    // want to remove required, always possible
    if (!action.value) {
        attrToggle(root.element, 'required', false);
    }
    // if want to make required, only possible when zero items
    else if (root.query('GET_TOTAL_ITEMS') === 0) {
        attrToggle(root.element, 'required', true);
    }
};

const setCaptureMethod = ({ root, action }) => {
    attrToggle(
        root.element,
        'capture',
        !!action.value,
        action.value === true ? '' : action.value
    );
};

const updateRequiredStatus = ({ root }) => {
    const { element } = root;
    // always remove the required attribute when more than zero items
    if (root.query('GET_TOTAL_ITEMS') > 0) {
        attrToggle(element, 'required', false);
        attrToggle(element, 'name', false);
    }
    else {

        // add name attribute
        attrToggle(element, 'name', true, root.query('GET_NAME'));

        // remove any validation messages
        const shouldCheckValidity = root.query('GET_CHECK_VALIDITY');
        if (shouldCheckValidity) {
            element.setCustomValidity('');
        }
        
        // we only add required if the field has been deemed required
        if (root.query('GET_REQUIRED')) {
            attrToggle(element, 'required', true);
        }
    }
};

const updateFieldValidityStatus = ({ root }) => {
    const shouldCheckValidity = root.query('GET_CHECK_VALIDITY');
    if (!shouldCheckValidity) return;
    root.element.setCustomValidity(root.query('GET_LABEL_INVALID_FIELD'));
}

export const browser = createView({
    tag: 'input',
    name: 'browser',
    ignoreRect: true,
    ignoreRectUpdate: true,
    attributes: {
        type: 'file'
    },
    create,
    destroy: ({ root }) => {
        root.element.removeEventListener('change', root.ref.handleChange);
    },
    write: createRoute({
        DID_LOAD_ITEM: updateRequiredStatus,
        DID_REMOVE_ITEM: updateRequiredStatus,
        DID_THROW_ITEM_INVALID: updateFieldValidityStatus,

        DID_SET_DISABLED: toggleDisabled,
        DID_SET_ALLOW_BROWSE: toggleDisabled,
        DID_SET_ALLOW_MULTIPLE: toggleAllowMultiple,
        DID_SET_ACCEPTED_FILE_TYPES: setAcceptedFileTypes,
        DID_SET_CAPTURE_METHOD: setCaptureMethod,
        DID_SET_REQUIRED: toggleRequired
    })
});
