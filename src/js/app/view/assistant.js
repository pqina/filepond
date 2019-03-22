import { createView, createRoute } from '../frame/index';
import { attr } from '../../utils/attr';

/**
 * Creates the file view
 */
const create = ({ root, props }) => {
    root.element.id = `filepond--assistant-${props.id}`;
    attr(root.element, 'role', 'status');
    attr(root.element, 'aria-live', 'polite');
    attr(root.element, 'aria-relevant', 'additions');
};

let addFilesNotificationTimeout = null;
let notificationClearTimeout = null;

const filenames = [];

const assist = (root, message) => {
    root.element.textContent = message;
};

const clear = root => {
    root.element.textContent = '';
};

const listModified = (root, filename, label) => {
    const total = root.query('GET_TOTAL_ITEMS');
    assist(
        root,
        `${label} ${filename}, ${total} ${
            total === 1
                ? root.query('GET_LABEL_FILE_COUNT_SINGULAR')
                : root.query('GET_LABEL_FILE_COUNT_PLURAL')
        }`
    );

    // clear group after set amount of time so the status is not read twice
    clearTimeout(notificationClearTimeout);
    notificationClearTimeout = setTimeout(() => {
        clear(root);
    }, 1500);
};

const isUsingFilePond = root =>
    root.element.parentNode.contains(document.activeElement);

const itemAdded = ({ root, action }) => {
    if (!isUsingFilePond(root)) {
        return;
    }

    root.element.textContent = '';
    const item = root.query('GET_ITEM', action.id);
    filenames.push(item.filename);

    clearTimeout(addFilesNotificationTimeout);
    addFilesNotificationTimeout = setTimeout(() => {
        listModified(
            root,
            filenames.join(', '),
            root.query('GET_LABEL_FILE_ADDED')
        );
        filenames.length = 0;
    }, 750);
};

const itemRemoved = ({ root, action }) => {
    if (!isUsingFilePond(root)) {
        return;
    }

    const item = action.item;
    listModified(root, item.filename, root.query('GET_LABEL_FILE_REMOVED'));
};

const itemProcessed = ({ root, action }) => {
    // will also notify the user when FilePond is not being used, as the user might be occupied with other activities while uploading a file

    const item = root.query('GET_ITEM', action.id);
    const filename = item.filename;
    const label = root.query('GET_LABEL_FILE_PROCESSING_COMPLETE');

    assist(root, `${filename} ${label}`);
};

const itemProcessedUndo = ({ root, action }) => {
    const item = root.query('GET_ITEM', action.id);
    const filename = item.filename;
    const label = root.query('GET_LABEL_FILE_PROCESSING_ABORTED');

    assist(root, `${filename} ${label}`);
};

const itemError = ({ root, action }) => {
    const item = root.query('GET_ITEM', action.id);
    const filename = item.filename;

    // will also notify the user when FilePond is not being used, as the user might be occupied with other activities while uploading a file

    assist(root, `${action.status.main} ${filename} ${action.status.sub}`);
};

export const assistant = createView({
    create,
    ignoreRect: true,
    ignoreRectUpdate: true,
    write: createRoute({
        DID_LOAD_ITEM: itemAdded,
        DID_REMOVE_ITEM: itemRemoved,
        DID_COMPLETE_ITEM_PROCESSING: itemProcessed,

        DID_ABORT_ITEM_PROCESSING: itemProcessedUndo,
        DID_REVERT_ITEM_PROCESSING: itemProcessedUndo,
        
        DID_THROW_ITEM_REMOVE_ERROR: itemError,
        DID_THROW_ITEM_LOAD_ERROR: itemError,
        DID_THROW_ITEM_INVALID: itemError,
        DID_THROW_ITEM_PROCESSING_ERROR: itemError
    }),
    tag: 'span',
    name: 'assistant'
});
