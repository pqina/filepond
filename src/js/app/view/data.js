import { createView, createRoute } from '../frame/index';
import { createElement } from '../../utils/createElement';
import { setInputFiles } from '../../utils/setInputFiles';
import { FileOrigin } from '../enum/FileOrigin';

const create = ({ root }) => (root.ref.fields = {});

const getField = (root, id) => root.ref.fields[id];

const syncFieldPositionsWithItems = root => {
    root.query('GET_ACTIVE_ITEMS').forEach(item => {
        if (!root.ref.fields[item.id]) return;
        root.element.appendChild(root.ref.fields[item.id]);
    });
};

const didReorderItems = ({ root }) => syncFieldPositionsWithItems(root);

const didAddItem = ({ root, action }) => {
    const fileItem = root.query('GET_ITEM', action.id);
    const isLocalFile = fileItem.origin === FileOrigin.LOCAL;
    const shouldUseFileInput = !isLocalFile && root.query('SHOULD_UPDATE_FILE_INPUT');
    const dataContainer = createElement('input');
    dataContainer.type = shouldUseFileInput ? 'file' : 'hidden';
    dataContainer.name = root.query('GET_NAME');
    root.ref.fields[action.id] = dataContainer;
    syncFieldPositionsWithItems(root);
};

const didLoadItem = ({ root, action }) => {
    const field = getField(root, action.id);
    if (!field) return;

    // store server ref in hidden input
    if (action.serverFileReference !== null) field.value = action.serverFileReference;

    // store file item in file input
    if (!root.query('SHOULD_UPDATE_FILE_INPUT')) return;

    const fileItem = root.query('GET_ITEM', action.id);
    setInputFiles(field, [fileItem.file]);
};

const didPrepareOutput = ({ root, action }) => {
    // this timeout pushes the handler after 'load'
    if (!root.query('SHOULD_UPDATE_FILE_INPUT')) return;
    setTimeout(() => {
        const field = getField(root, action.id);
        if (!field) return;
        setInputFiles(field, [action.file]);
    }, 0);
};

const didSetDisabled = ({ root }) => {
    root.element.disabled = root.query('GET_DISABLED');
};

const didRemoveItem = ({ root, action }) => {
    const field = getField(root, action.id);
    if (!field) return;
    if (field.parentNode) field.parentNode.removeChild(field);
    delete root.ref.fields[action.id];
};

// only runs for server files. will refuse to update the value if the field
// is a file field
const didDefineValue = ({ root, action }) => {
    const field = getField(root, action.id);
    if (!field) return;
    if (action.value === null) {
        // clear field value
        field.removeAttribute('value');
    } else {
        // set field value
        if (field.type != 'file') {
            field.value = action.value;
        }
    }
    syncFieldPositionsWithItems(root);
};

const write = createRoute({
    DID_SET_DISABLED: didSetDisabled,
    DID_ADD_ITEM: didAddItem,
    DID_LOAD_ITEM: didLoadItem,
    DID_REMOVE_ITEM: didRemoveItem,
    DID_DEFINE_VALUE: didDefineValue,
    DID_PREPARE_OUTPUT: didPrepareOutput,
    DID_REORDER_ITEMS: didReorderItems,
    DID_SORT_ITEMS: didReorderItems,
});

export const data = createView({ tag: 'fieldset', name: 'data', create, write, ignoreRect: true });
