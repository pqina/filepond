import { createView, createRoute } from '../frame/index';
import { progressIndicator } from './progressIndicator';
import { fileActionButton } from './fileActionButton';
import { fileInfo } from './fileInfo';
import { fileStatus } from './fileStatus';
import { forin } from '../../utils/forin';
import { applyFilters } from '../../filter';

/**
 * Button definitions for the file view
 */

const Buttons = {
    AbortItemLoad: {
        label: 'GET_LABEL_BUTTON_ABORT_ITEM_LOAD',
        action: 'ABORT_ITEM_LOAD',
        className: 'filepond--action-abort-item-load',
        align: 'LOAD_INDICATOR_POSITION', // right
    },
    RetryItemLoad: {
        label: 'GET_LABEL_BUTTON_RETRY_ITEM_LOAD',
        action: 'RETRY_ITEM_LOAD',
        icon: 'GET_ICON_RETRY',
        className: 'filepond--action-retry-item-load',
        align: 'BUTTON_PROCESS_ITEM_POSITION', // right
    },
    RemoveItem: {
        label: 'GET_LABEL_BUTTON_REMOVE_ITEM',
        action: 'REQUEST_REMOVE_ITEM',
        icon: 'GET_ICON_REMOVE',
        className: 'filepond--action-remove-item',
        align: 'BUTTON_REMOVE_ITEM_POSITION', // left
    },
    ProcessItem: {
        label: 'GET_LABEL_BUTTON_PROCESS_ITEM',
        action: 'REQUEST_ITEM_PROCESSING',
        icon: 'GET_ICON_PROCESS',
        className: 'filepond--action-process-item',
        align: 'BUTTON_PROCESS_ITEM_POSITION', // right
    },
    AbortItemProcessing: {
        label: 'GET_LABEL_BUTTON_ABORT_ITEM_PROCESSING',
        action: 'ABORT_ITEM_PROCESSING',
        className: 'filepond--action-abort-item-processing',
        align: 'BUTTON_PROCESS_ITEM_POSITION', // right
    },
    RetryItemProcessing: {
        label: 'GET_LABEL_BUTTON_RETRY_ITEM_PROCESSING',
        action: 'RETRY_ITEM_PROCESSING',
        icon: 'GET_ICON_RETRY',
        className: 'filepond--action-retry-item-processing',
        align: 'BUTTON_PROCESS_ITEM_POSITION', // right
    },
    RevertItemProcessing: {
        label: 'GET_LABEL_BUTTON_UNDO_ITEM_PROCESSING',
        action: 'REQUEST_REVERT_ITEM_PROCESSING',
        icon: 'GET_ICON_UNDO',
        className: 'filepond--action-revert-item-processing',
        align: 'BUTTON_PROCESS_ITEM_POSITION', // right
    },
};

// make a list of buttons, we can then remove buttons from this list if they're disabled
const ButtonKeys = [];
forin(Buttons, key => {
    ButtonKeys.push(key);
});

const calculateFileInfoOffset = root => {
    if (getRemoveIndicatorAligment(root) === 'right') return 0;
    const buttonRect = root.ref.buttonRemoveItem.rect.element;
    return buttonRect.hidden ? null : buttonRect.width + buttonRect.left;
};

const calculateButtonWidth = root => {
    const buttonRect = root.ref.buttonAbortItemLoad.rect.element;
    return buttonRect.width;
};

// Force on full pixels so text stays crips
const calculateFileVerticalCenterOffset = root =>
    Math.floor(root.ref.buttonRemoveItem.rect.element.height / 4);
const calculateFileHorizontalCenterOffset = root =>
    Math.floor(root.ref.buttonRemoveItem.rect.element.left / 2);

const getLoadIndicatorAlignment = root => root.query('GET_STYLE_LOAD_INDICATOR_POSITION');
const getProcessIndicatorAlignment = root => root.query('GET_STYLE_PROGRESS_INDICATOR_POSITION');
const getRemoveIndicatorAligment = root => root.query('GET_STYLE_BUTTON_REMOVE_ITEM_POSITION');

const DefaultStyle = {
    buttonAbortItemLoad: { opacity: 0 },
    buttonRetryItemLoad: { opacity: 0 },
    buttonRemoveItem: { opacity: 0 },
    buttonProcessItem: { opacity: 0 },
    buttonAbortItemProcessing: { opacity: 0 },
    buttonRetryItemProcessing: { opacity: 0 },
    buttonRevertItemProcessing: { opacity: 0 },
    loadProgressIndicator: { opacity: 0, align: getLoadIndicatorAlignment },
    processProgressIndicator: { opacity: 0, align: getProcessIndicatorAlignment },
    processingCompleteIndicator: { opacity: 0, scaleX: 0.75, scaleY: 0.75 },
    info: { translateX: 0, translateY: 0, opacity: 0 },
    status: { translateX: 0, translateY: 0, opacity: 0 },
};

const IdleStyle = {
    buttonRemoveItem: { opacity: 1 },
    buttonProcessItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { translateX: calculateFileInfoOffset },
};

const ProcessingStyle = {
    buttonAbortItemProcessing: { opacity: 1 },
    processProgressIndicator: { opacity: 1 },
    status: { opacity: 1 },
};

const StyleMap = {
    DID_THROW_ITEM_INVALID: {
        buttonRemoveItem: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
        status: { translateX: calculateFileInfoOffset, opacity: 1 },
    },
    DID_START_ITEM_LOAD: {
        buttonAbortItemLoad: { opacity: 1 },
        loadProgressIndicator: { opacity: 1 },
        status: { opacity: 1 },
    },
    DID_THROW_ITEM_LOAD_ERROR: {
        buttonRetryItemLoad: { opacity: 1 },
        buttonRemoveItem: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
        status: { opacity: 1 },
    },
    DID_START_ITEM_REMOVE: {
        processProgressIndicator: { opacity: 1, align: getRemoveIndicatorAligment },
        info: { translateX: calculateFileInfoOffset },
        status: { opacity: 0 },
    },
    DID_THROW_ITEM_REMOVE_ERROR: {
        processProgressIndicator: { opacity: 0, align: getRemoveIndicatorAligment },
        buttonRemoveItem: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
        status: { opacity: 1, translateX: calculateFileInfoOffset },
    },
    DID_LOAD_ITEM: IdleStyle,
    DID_LOAD_LOCAL_ITEM: {
        buttonRemoveItem: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
        status: { translateX: calculateFileInfoOffset },
    },
    DID_START_ITEM_PROCESSING: ProcessingStyle,
    DID_REQUEST_ITEM_PROCESSING: ProcessingStyle,
    DID_UPDATE_ITEM_PROCESS_PROGRESS: ProcessingStyle,
    DID_COMPLETE_ITEM_PROCESSING: {
        buttonRevertItemProcessing: { opacity: 1 },
        info: { opacity: 1 },
        status: { opacity: 1 },
    },
    DID_THROW_ITEM_PROCESSING_ERROR: {
        buttonRemoveItem: { opacity: 1 },
        buttonRetryItemProcessing: { opacity: 1 },
        status: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
    },
    DID_THROW_ITEM_PROCESSING_REVERT_ERROR: {
        buttonRevertItemProcessing: { opacity: 1 },
        status: { opacity: 1 },
        info: { opacity: 1 },
    },
    DID_ABORT_ITEM_PROCESSING: {
        buttonRemoveItem: { opacity: 1 },
        buttonProcessItem: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
        status: { opacity: 1 },
    },
    DID_REVERT_ITEM_PROCESSING: IdleStyle,
};

// complete indicator view
const processingCompleteIndicatorView = createView({
    create: ({ root }) => {
        root.element.innerHTML = root.query('GET_ICON_DONE');
    },
    name: 'processing-complete-indicator',
    ignoreRect: true,
    mixins: {
        styles: ['scaleX', 'scaleY', 'opacity'],
        animations: {
            scaleX: 'spring',
            scaleY: 'spring',
            opacity: { type: 'tween', duration: 250 },
        },
    },
});

/**
 * Creates the file view
 */
const create = ({ root, props }) => {
    // copy Buttons object
    const LocalButtons = Object.keys(Buttons).reduce((prev, curr) => {
        prev[curr] = { ...Buttons[curr] };
        return prev;
    }, {});

    const { id } = props;

    // allow reverting upload
    const allowRevert = root.query('GET_ALLOW_REVERT');

    // allow remove file
    const allowRemove = root.query('GET_ALLOW_REMOVE');

    // allow processing upload
    const allowProcess = root.query('GET_ALLOW_PROCESS');

    // is instant uploading, need this to determine the icon of the undo button
    const instantUpload = root.query('GET_INSTANT_UPLOAD');

    // is async set up
    const isAsync = root.query('IS_ASYNC');

    // should align remove item buttons
    const alignRemoveItemButton = root.query('GET_STYLE_BUTTON_REMOVE_ITEM_ALIGN');

    // enabled buttons array
    let buttonFilter;
    if (isAsync) {
        if (allowProcess && !allowRevert) {
            // only remove revert button
            buttonFilter = key => !/RevertItemProcessing/.test(key);
        } else if (!allowProcess && allowRevert) {
            // only remove process button
            buttonFilter = key => !/ProcessItem|RetryItemProcessing|AbortItemProcessing/.test(key);
        } else if (!allowProcess && !allowRevert) {
            // remove all process buttons
            buttonFilter = key => !/Process/.test(key);
        }
    } else {
        // no process controls available
        buttonFilter = key => !/Process/.test(key);
    }

    const enabledButtons = buttonFilter ? ButtonKeys.filter(buttonFilter) : ButtonKeys.concat();

    // update icon and label for revert button when instant uploading
    if (instantUpload && allowRevert) {
        LocalButtons['RevertItemProcessing'].label = 'GET_LABEL_BUTTON_REMOVE_ITEM';
        LocalButtons['RevertItemProcessing'].icon = 'GET_ICON_REMOVE';
    }

    // remove last button (revert) if not allowed
    if (isAsync && !allowRevert) {
        const map = StyleMap['DID_COMPLETE_ITEM_PROCESSING'];
        map.info.translateX = calculateFileHorizontalCenterOffset;
        map.info.translateY = calculateFileVerticalCenterOffset;
        map.status.translateY = calculateFileVerticalCenterOffset;
        map.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
    }

    // should align center
    if (isAsync && !allowProcess) {
        [
            'DID_START_ITEM_PROCESSING',
            'DID_REQUEST_ITEM_PROCESSING',
            'DID_UPDATE_ITEM_PROCESS_PROGRESS',
            'DID_THROW_ITEM_PROCESSING_ERROR',
        ].forEach(key => {
            StyleMap[key].status.translateY = calculateFileVerticalCenterOffset;
        });
        StyleMap['DID_THROW_ITEM_PROCESSING_ERROR'].status.translateX = calculateButtonWidth;
    }

    // move remove button to right
    if (alignRemoveItemButton && allowRevert) {
        LocalButtons['RevertItemProcessing'].align = 'BUTTON_REMOVE_ITEM_POSITION';
        const map = StyleMap['DID_COMPLETE_ITEM_PROCESSING'];
        map.info.translateX = calculateFileInfoOffset;
        map.status.translateY = calculateFileVerticalCenterOffset;
        map.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
    }

    // show/hide RemoveItem button
    if (!allowRemove) {
        LocalButtons['RemoveItem'].disabled = true;
    }

    // create the button views
    forin(LocalButtons, (key, definition) => {
        // create button
        const buttonView = root.createChildView(fileActionButton, {
            label: root.query(definition.label),
            icon: root.query(definition.icon),
            opacity: 0,
        });

        // should be appended?
        if (enabledButtons.includes(key)) {
            root.appendChildView(buttonView);
        }

        // toggle
        if (definition.disabled) {
            buttonView.element.setAttribute('disabled', 'disabled');
            buttonView.element.setAttribute('hidden', 'hidden');
        }

        // add position attribute
        buttonView.element.dataset.align = root.query(`GET_STYLE_${definition.align}`);

        // add class
        buttonView.element.classList.add(definition.className);

        // handle interactions
        buttonView.on('click', e => {
            e.stopPropagation();
            if (definition.disabled) return;
            root.dispatch(definition.action, { query: id });
        });

        // set reference
        root.ref[`button${key}`] = buttonView;
    });

    // checkmark
    root.ref.processingCompleteIndicator = root.appendChildView(
        root.createChildView(processingCompleteIndicatorView)
    );
    root.ref.processingCompleteIndicator.element.dataset.align = root.query(
        `GET_STYLE_BUTTON_PROCESS_ITEM_POSITION`
    );

    // create file info view
    root.ref.info = root.appendChildView(root.createChildView(fileInfo, { id }));

    // create file status view
    root.ref.status = root.appendChildView(root.createChildView(fileStatus, { id }));

    // add progress indicators
    const loadIndicatorView = root.appendChildView(
        root.createChildView(progressIndicator, {
            opacity: 0,
            align: root.query(`GET_STYLE_LOAD_INDICATOR_POSITION`),
        })
    );
    loadIndicatorView.element.classList.add('filepond--load-indicator');
    root.ref.loadProgressIndicator = loadIndicatorView;

    const progressIndicatorView = root.appendChildView(
        root.createChildView(progressIndicator, {
            opacity: 0,
            align: root.query(`GET_STYLE_PROGRESS_INDICATOR_POSITION`),
        })
    );
    progressIndicatorView.element.classList.add('filepond--process-indicator');
    root.ref.processProgressIndicator = progressIndicatorView;

    // current active styles
    root.ref.activeStyles = [];
};

const write = ({ root, actions, props }) => {
    // route actions
    route({ root, actions, props });

    // select last state change action
    let action = actions
        .concat()
        .filter(action => /^DID_/.test(action.type))
        .reverse()
        .find(action => StyleMap[action.type]);

    // a new action happened, let's get the matching styles
    if (action) {
        // define new active styles
        root.ref.activeStyles = [];

        const stylesToApply = StyleMap[action.type];
        forin(DefaultStyle, (name, defaultStyles) => {
            // get reference to control
            const control = root.ref[name];

            // loop over all styles for this control
            forin(defaultStyles, (key, defaultValue) => {
                const value =
                    stylesToApply[name] && typeof stylesToApply[name][key] !== 'undefined'
                        ? stylesToApply[name][key]
                        : defaultValue;
                root.ref.activeStyles.push({ control, key, value });
            });
        });
    }

    // apply active styles to element
    root.ref.activeStyles.forEach(({ control, key, value }) => {
        control[key] = typeof value === 'function' ? value(root) : value;
    });
};

const route = createRoute({
    DID_SET_LABEL_BUTTON_ABORT_ITEM_PROCESSING: ({ root, action }) => {
        root.ref.buttonAbortItemProcessing.label = action.value;
    },
    DID_SET_LABEL_BUTTON_ABORT_ITEM_LOAD: ({ root, action }) => {
        root.ref.buttonAbortItemLoad.label = action.value;
    },
    DID_SET_LABEL_BUTTON_ABORT_ITEM_REMOVAL: ({ root, action }) => {
        root.ref.buttonAbortItemRemoval.label = action.value;
    },
    DID_REQUEST_ITEM_PROCESSING: ({ root }) => {
        root.ref.processProgressIndicator.spin = true;
        root.ref.processProgressIndicator.progress = 0;
    },
    DID_START_ITEM_LOAD: ({ root }) => {
        root.ref.loadProgressIndicator.spin = true;
        root.ref.loadProgressIndicator.progress = 0;
    },
    DID_START_ITEM_REMOVE: ({ root }) => {
        root.ref.processProgressIndicator.spin = true;
        root.ref.processProgressIndicator.progress = 0;
    },
    DID_UPDATE_ITEM_LOAD_PROGRESS: ({ root, action }) => {
        root.ref.loadProgressIndicator.spin = false;
        root.ref.loadProgressIndicator.progress = action.progress;
    },
    DID_UPDATE_ITEM_PROCESS_PROGRESS: ({ root, action }) => {
        root.ref.processProgressIndicator.spin = false;
        root.ref.processProgressIndicator.progress = action.progress;
    },
});

export const file = createView({
    create,
    write,
    didCreateView: root => {
        applyFilters('CREATE_VIEW', { ...root, view: root });
    },
    name: 'file',
});
