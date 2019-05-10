import { createView, createRoute } from '../frame/index';
import { formatFilename } from '../../utils/formatFilename';
import { createElement } from '../../utils/createElement';
import { text } from '../../utils/text';
import { file } from './file';
import { applyFilters } from '../../filter';

/**
 * Creates the file view
 */
const create = ({ root, props }) => {

    // filename
    root.ref.fileName = createElement('legend');
    root.appendChild(root.ref.fileName);

    // file appended
    root.ref.file = root.appendChildView(
        root.createChildView(file, { id: props.id })
    );

    // create data container
    const dataContainer = createElement('input');
    dataContainer.type = 'hidden';
    dataContainer.name = root.query('GET_NAME');
    dataContainer.disabled = root.query('GET_DISABLED');
    root.ref.data = dataContainer;
    root.appendChild(dataContainer);
};

const didSetDisabled = ({ root }) => {
    root.ref.data.disabled = root.query('GET_DISABLED');
}

/**
 * Data storage
 */
const didLoadItem = ({ root, action, props }) => {
    root.ref.data.value = action.serverFileReference;

    // updates the legend of the fieldset so screenreaders can better group buttons
    text(
        root.ref.fileName,
        formatFilename(root.query('GET_ITEM_NAME', props.id))
    );
};

const didRemoveItem = ({ root }) => {
    root.ref.data.removeAttribute('value');
};

const didCompleteItemProcessing = ({ root, action }) => {
    root.ref.data.value = action.serverFileReference;
};

const didRevertItemProcessing = ({ root }) => {
    root.ref.data.removeAttribute('value');
};

export const fileWrapper = createView({
    create,
    ignoreRect: true,
    write: createRoute({
        DID_SET_DISABLED: didSetDisabled,
        DID_LOAD_ITEM: didLoadItem,
        DID_REMOVE_ITEM: didRemoveItem,
        DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing,
        DID_REVERT_ITEM_PROCESSING: didRevertItemProcessing
    }),
    didCreateView: root => {
        applyFilters('CREATE_VIEW', { ...root, view: root });
    },
    tag: 'fieldset',
    name: 'file-wrapper'
});
