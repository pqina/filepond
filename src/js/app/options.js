import { getDecimalSeparator } from '../utils/getDecimalSeparator';
import { getThousandsSeparator } from '../utils/getThousandsSeparator';
import { Type } from './enum/Type';
import { applyFilters } from './../filter';
import { forin } from '../utils/forin';
import { isString } from '../utils/isString';
import { createServerAPI } from './utils/createServerAPI';
import { getValueByType } from './utils/getValueByType';

export const extendDefaultOptions = additionalOptions =>
    Object.assign(defaultOptions, additionalOptions);

export const getOptions = () => ({ ...defaultOptions });

export const setOptions = opts => {
    forin(opts, (key, value) => {
        // key does not exist, so this option cannot be set
        if (!defaultOptions[key]) {
            return;
        }
        defaultOptions[key][0] = getValueByType(value, defaultOptions[key][0], defaultOptions[key][1]);
    });
};

// default options on app
export const defaultOptions = {

    // the id to add to the root element
    id: [null, Type.STRING],

    // input field name to use
    name: ['filepond', Type.STRING],

    // disable the field
    disabled: [false, Type.BOOLEAN],

    // classname to put on wrapper
    className: [null, Type.STRING],

    // is the field required
    required: [false, Type.BOOLEAN],

    // Allow media capture when value is set
    captureMethod: [null, Type.STRING],
    // - "camera", "microphone" or "camcorder",
    // - Does not work with multiple on apple devices
    // - If set, acceptedFileTypes must be made to match with media wildcard "image/*", "audio/*" or "video/*"

    // Feature toggles
    allowDrop: [true, Type.BOOLEAN], // Allow dropping of files
    allowBrowse: [true, Type.BOOLEAN], // Allow browsing the file system
    allowPaste: [true, Type.BOOLEAN], // Allow pasting files
    allowMultiple: [false, Type.BOOLEAN], // Allow multiple files (disabled by default, as multiple attribute is also required on input to allow multiple)
    allowReplace: [true, Type.BOOLEAN], // Allow dropping a file on other file to replace it (only works when multiple is set to false)
    allowRevert: [true, Type.BOOLEAN], // Allows user to revert file upload
    allowReorder: [false, Type.BOOLEAN], // Allow reordering of files

    // Revert mode
    forceRevert: [false, Type.BOOLEAN], // Set to 'force' to require the file to be reverted before removal

    // Input requirements
    maxFiles: [null, Type.INT], // Max number of files
    checkValidity: [false, Type.BOOLEAN], // Enables custom validity messages

    // Where to put file
    itemInsertLocationFreedom: [true, Type.BOOLEAN], // Set to false to always add items to begin or end of list
    itemInsertLocation: ['before', Type.STRING], // Default index in list to add items that have been dropped at the top of the list
    itemInsertInterval: [75, Type.INT],
    
    // Drag 'n Drop related
    dropOnPage: [false, Type.BOOLEAN], // Allow dropping of files anywhere on page (prevents browser from opening file if dropped outside of Up)
    dropOnElement: [true, Type.BOOLEAN], // Drop needs to happen on element (set to false to also load drops outside of Up)
    dropValidation: [false, Type.BOOLEAN], // Enable or disable validating files on drop
    ignoredFiles: [['.ds_store', 'thumbs.db', 'desktop.ini'], Type.ARRAY],

    // Upload related
    instantUpload: [true, Type.BOOLEAN], // Should upload files immidiately on drop
    maxParallelUploads: [2, Type.INT], // Maximum files to upload in parallel
    
    // Chunks
    chunkUploads: [false, Type.BOOLEAN], // Enable chunked uploads
    chunkForce: [false, Type.BOOLEAN], // Force use of chunk uploads even for files smaller than chunk size
    chunkSize: [5000000, Type.INT], // Size of chunks (5MB default)
    chunkRetryDelays: [[500, 1000, 3000], Type.Array], // Amount of times to retry upload of a chunk when it fails

    // The server api end points to use for uploading (see docs)
    server: [null, Type.SERVER_API],

    // Labels and status messages
    labelDecimalSeparator: [getDecimalSeparator(), Type.STRING], // Default is locale separator
    labelThousandsSeparator: [getThousandsSeparator(), Type.STRING], // Default is locale separator

    labelIdle: ['Drag & Drop your files or <span class="filepond--label-action">Browse</span>', Type.STRING],    
    labelInvalidField: ['Field contains invalid files', Type.STRING],
    labelFileWaitingForSize: ['Waiting for size', Type.STRING],
    labelFileSizeNotAvailable: ['Size not available', Type.STRING],
    labelFileCountSingular: ['file in list', Type.STRING],
    labelFileCountPlural: ['files in list', Type.STRING],
    labelFileLoading: ['Loading', Type.STRING],
    labelFileAdded: ['Added', Type.STRING], // assistive only
    labelFileLoadError: ['Error during load', Type.STRING],
    labelFileRemoved: ['Removed', Type.STRING], // assistive only
    labelFileRemoveError: ['Error during remove', Type.STRING],
    labelFileProcessing: ['Uploading', Type.STRING],
    labelFileProcessingComplete: ['Upload complete', Type.STRING],
    labelFileProcessingAborted: ['Upload cancelled', Type.STRING],
    labelFileProcessingError: ['Error during upload', Type.STRING],
    labelFileProcessingRevertError: ['Error during revert', Type.STRING],
    
    labelTapToCancel: ['tap to cancel', Type.STRING],
    labelTapToRetry: ['tap to retry', Type.STRING],
    labelTapToUndo: ['tap to undo', Type.STRING],
    
    labelButtonRemoveItem: ['Remove', Type.STRING],
    labelButtonAbortItemLoad: ['Abort', Type.STRING],
    labelButtonRetryItemLoad: ['Retry', Type.STRING],
    labelButtonAbortItemProcessing: ['Cancel', Type.STRING],
    labelButtonUndoItemProcessing: ['Undo', Type.STRING],
    labelButtonRetryItemProcessing: ['Retry', Type.STRING],
    labelButtonProcessItem: ['Upload', Type.STRING],

    // make sure width and height plus viewpox are even numbers so icons are nicely centered
    iconRemove: [
        '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M11.586 13l-2.293 2.293a1 1 0 0 0 1.414 1.414L13 14.414l2.293 2.293a1 1 0 0 0 1.414-1.414L14.414 13l2.293-2.293a1 1 0 0 0-1.414-1.414L13 11.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L11.586 13z" fill="currentColor" fill-rule="nonzero"/></svg>',
        Type.STRING
    ],
    iconProcess: [
        '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.414v3.585a1 1 0 0 1-2 0v-3.585l-1.293 1.293a1 1 0 0 1-1.414-1.415l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.415L14 10.414zM9 18a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2H9z" fill="currentColor" fill-rule="evenodd"/></svg>',
        Type.STRING
    ],
    iconRetry: [
        '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M10.81 9.185l-.038.02A4.997 4.997 0 0 0 8 13.683a5 5 0 0 0 5 5 5 5 0 0 0 5-5 1 1 0 0 1 2 0A7 7 0 1 1 9.722 7.496l-.842-.21a.999.999 0 1 1 .484-1.94l3.23.806c.535.133.86.675.73 1.21l-.804 3.233a.997.997 0 0 1-1.21.73.997.997 0 0 1-.73-1.21l.23-.928v-.002z" fill="currentColor" fill-rule="nonzero"/></svg>',
        Type.STRING
    ],
    iconUndo: [
        '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M9.185 10.81l.02-.038A4.997 4.997 0 0 1 13.683 8a5 5 0 0 1 5 5 5 5 0 0 1-5 5 1 1 0 0 0 0 2A7 7 0 1 0 7.496 9.722l-.21-.842a.999.999 0 1 0-1.94.484l.806 3.23c.133.535.675.86 1.21.73l3.233-.803a.997.997 0 0 0 .73-1.21.997.997 0 0 0-1.21-.73l-.928.23-.002-.001z" fill="currentColor" fill-rule="nonzero"/></svg>',
        Type.STRING
    ],
    iconDone: [
        '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M18.293 9.293a1 1 0 0 1 1.414 1.414l-7.002 7a1 1 0 0 1-1.414 0l-3.998-4a1 1 0 1 1 1.414-1.414L12 15.586l6.294-6.293z" fill="currentColor" fill-rule="nonzero"/></svg>',
        Type.STRING
    ],

    // event handlers
    oninit: [null, Type.FUNCTION],
    onwarning: [null, Type.FUNCTION],
    onerror: [null, Type.FUNCTION],
    onactivatefile: [null, Type.FUNCTION],
    onaddfilestart: [null, Type.FUNCTION],
    onaddfileprogress: [null, Type.FUNCTION],
    onaddfile: [null, Type.FUNCTION],
    onprocessfilestart: [null, Type.FUNCTION],
    onprocessfileprogress: [null, Type.FUNCTION],
    onprocessfileabort: [null, Type.FUNCTION],
    onprocessfilerevert: [null, Type.FUNCTION],
    onprocessfile: [null, Type.FUNCTION],
    onprocessfiles: [null, Type.FUNCTION],
    onremovefile: [null, Type.FUNCTION],
    onpreparefile: [null, Type.FUNCTION],
    onupdatefiles: [null, Type.FUNCTION],

    // hooks
    beforeDropFile: [null, Type.FUNCTION],
    beforeAddFile: [null, Type.FUNCTION],
    beforeRemoveFile: [null, Type.FUNCTION],

    // styles
    stylePanelLayout: [null, Type.STRING],         // null 'integrated', 'compact', 'circle'
    stylePanelAspectRatio: [null, Type.STRING],    // null or '3:2' or 1
    styleItemPanelAspectRatio: [null, Type.STRING],
    styleButtonRemoveItemPosition: ['left', Type.STRING],
    styleButtonProcessItemPosition: ['right', Type.STRING],
    styleLoadIndicatorPosition: ['right', Type.STRING],
    styleProgressIndicatorPosition: ['right', Type.STRING],

    // custom initial files array
    files: [[], Type.ARRAY]
};
