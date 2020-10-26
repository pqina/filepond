import { createView, createRoute } from '../frame/index';
import { createElement } from '../../utils/createElement';

const create = ({ root }) => root.ref.fields = {};

const getField = (root, id) => root.ref.fields[id];

const syncFieldPositionsWithItems = (root) => {
    root.query('GET_ACTIVE_ITEMS').forEach(item => {
        if (!root.ref.fields[item.id]) return;
        root.element.appendChild(root.ref.fields[item.id]);
    })
}

const didReorderItems = ({ root }) => syncFieldPositionsWithItems(root)

const didAddItem = ({ root, action }) => {
    const dataContainer = createElement('input');
    dataContainer.type = 'hidden';
    dataContainer.name = root.query('GET_NAME');
    dataContainer.disabled = root.query('GET_DISABLED');
    root.ref.fields[action.id] = dataContainer;
    syncFieldPositionsWithItems(root);
}

const didLoadItem = ({ root, action }) => {
    const field = getField(root, action.id);
    if (!field || action.serverFileReference === null) return;
    field.value = action.serverFileReference;
};

const didSetDisabled = ({ root }) => {
    root.element.disabled = root.query('GET_DISABLED');
}

const didRemoveItem = ({ root, action }) => {
    const field = getField(root, action.id);
    if (!field) return;
    if (field.parentNode) field.parentNode.removeChild(field);
    delete root.ref.fields[action.id];
};

const didDefineValue = ({ root, action }) => {
    const field = getField(root, action.id);
    if (!field) return;
    if (action.value === null) {
        field.removeAttribute('value');
    }
    else {
        field.value = action.value;
    }
    syncFieldPositionsWithItems(root);
};

const write = createRoute({
    DID_SET_DISABLED: didSetDisabled,
    DID_ADD_ITEM: didAddItem,
    DID_LOAD_ITEM: didLoadItem,
    DID_REMOVE_ITEM: didRemoveItem,
    DID_DEFINE_VALUE: didDefineValue,
    DID_REORDER_ITEMS: didReorderItems,
    DID_SORT_ITEMS: didReorderItems
});

export const data = createView({ tag: 'fieldset', name: 'data', create, write, ignoreRect: true });
