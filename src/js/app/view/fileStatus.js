import { createView, createRoute } from '../frame/index';
import { toPercentage } from '../../utils/toPercentage';
import { text } from '../../utils/text';
import { createElement } from '../../utils/createElement';
import { applyFilters } from '../../filter';

const create = ({ root }) => {

    // main status
    const main = createElement('span');
    main.className = 'filepond--file-status-main';
    root.appendChild(main);
    root.ref.main = main;

    // sub status
    const sub = createElement('span');
    sub.className = 'filepond--file-status-sub';
    root.appendChild(sub);
    root.ref.sub = sub;

    didSetItemLoadProgress({ root, action: { progress: null } });
};

const didSetItemLoadProgress = ({ root, action }) => {
    const title =
        action.progress === null
            ? root.query('GET_LABEL_FILE_LOADING')
            : `${root.query('GET_LABEL_FILE_LOADING')} ${toPercentage(
                  action.progress
              )}%`;
    text(root.ref.main, title);
    text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
};

const didSetItemProcessProgress = ({ root, action }) => {
    const title =
        action.progress === null
            ? root.query('GET_LABEL_FILE_PROCESSING')
            : `${root.query('GET_LABEL_FILE_PROCESSING')} ${toPercentage(
                  action.progress
              )}%`;
    text(root.ref.main, title);
    text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
};

const didRequestItemProcessing = ({ root }) => {
    text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING'));
    text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
};

const didAbortItemProcessing = ({ root }) => {
    text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING_ABORTED'));
    text(root.ref.sub, root.query('GET_LABEL_TAP_TO_RETRY'));
};

const didCompleteItemProcessing = ({ root }) => {
    text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING_COMPLETE'));
    text(root.ref.sub, root.query('GET_LABEL_TAP_TO_UNDO'));
};

const clear = ({ root }) => {
    text(root.ref.main, '');
    text(root.ref.sub, '');
};

const error = ({ root, action }) => {
    text(root.ref.main, action.status.main);
    text(root.ref.sub, action.status.sub);
};

export const fileStatus = createView({
    name: 'file-status',
    ignoreRect: true,
    ignoreRectUpdate: true,
    write: createRoute({
        DID_LOAD_ITEM: clear,
        DID_REVERT_ITEM_PROCESSING: clear,
        DID_REQUEST_ITEM_PROCESSING: didRequestItemProcessing,
        DID_ABORT_ITEM_PROCESSING: didAbortItemProcessing,
        DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing,
        DID_UPDATE_ITEM_PROCESS_PROGRESS: didSetItemProcessProgress,
        DID_UPDATE_ITEM_LOAD_PROGRESS: didSetItemLoadProgress,
        DID_THROW_ITEM_LOAD_ERROR: error,
        DID_THROW_ITEM_INVALID: error,
        DID_THROW_ITEM_PROCESSING_ERROR: error,
        DID_THROW_ITEM_PROCESSING_REVERT_ERROR: error,
        DID_THROW_ITEM_REMOVE_ERROR: error
    }),
    didCreateView: root => {
        applyFilters('CREATE_VIEW', { ...root, view: root });
    },
    create,
    mixins: {
        styles: ['translateX', 'translateY', 'opacity'],
        animations: {
            opacity: { type: 'tween', duration: 250 },
            translateX: 'spring',
            translateY: 'spring'
        }
    }
});
