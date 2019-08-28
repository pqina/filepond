// Based on definitions by Zach Posten for React-Filepond <https://github.com/zposten>
// Updated by Hawxy <https://github.com/Hawxy>
// TypeScript Version: 3.5

export {};

export enum FileStatus {
    INIT = 1,
    IDLE = 2,
    PROCESSING_QUEUED = 9,
    PROCESSING = 3,
    PROCESSING_COMPLETE = 5,
    PROCESSING_ERROR = 6,
    PROCESSING_REVERT_ERROR = 10,
    LOADING = 7,
    LOAD_ERROR = 8
}

export enum Status {
    EMPTY = 0,
    IDLE = 1,
    ERROR = 2,
    BUSY = 3,
    READY = 4
}

export enum FileOrigin {
    INPUT = 1,
    LIMBO = 2,
    LOCAL = 3
}

type ActualFileObject = Blob & {readonly lastModified: number; readonly name: string; readonly size: number; readonly type: string};

export class File {
    /** Returns the ID of the file */
    id: string;
    /** Returns the server id of the file */
    serverId: string;
    /** Returns the origin of the file*/
    origin: 'input' | 'limbo' | 'local';
    /** Returns the current status of the file */
    status: FileStatus;
    /** Returns the File object */
    file: ActualFileObject;
    /** Returns the file extensions */
    fileExtension: string;
    /** Returns the size of the file */
    fileSize: number;
    /** Returns the type of the file */
    fileType: string;
    /** Returns the full name of the file */
    filename: string;
    /** Returns the name of the file without extension */
    filenameWithoutExtension: string;

    /** Aborts loading of this file */
    abortLoad: () => void;
    /** Aborts processing of this file */
    abortProcessing: () => void;
    /**
     * Retrieve metadata saved to the file, pass a key to retrieve
     * a specific part of the metadata (e.g. 'crop' or 'resize').
     * If no key is passed, the entire metadata object is returned.
     */
    getMetadata: (key?: string) => any;
    /** Add additional metadata to the file */
    setMetadata: (key: string, value: any) => void;
}

interface ServerUrl {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    withCredentials?: boolean;
    headers?: {[key: string]: string|boolean|number};
    timeout?: number;

    /**
     * Called when server response is received, useful for getting
     * the unique file id from the server response
     */
    onload?: () => any;
    /**
     * Called when server error is received, receives the response
     * body, useful to select the relevant error data
     */
    onerror?: (responseBody: any) => any;
    /**
     * Called with the formdata object right before it is sent,
     * return extended formdata object to make changes
     */
    ondata?: (data: any) => any;
}

type ProgressServerConfigFunction = (
    /**
     * Flag indicating if the resource has a length that can be calculated.
     * If not, the totalDataAmount has no significant value.  Setting this to
     * false switches the FilePond loading indicator to infinite mode.
     */
    isLengthComputable: boolean,
    /** The amount of data currently transferred */
    loadedDataAmount: number,
    /** The total amount of data to be transferred */
    totalDataAmount: number,
) => void;

type ProcessServerConfigFunction = (
    /** The name of the input field */
    fieldName: string,
    /** The actual file object to send */
    file: ActualFileObject,
    metadata: {[key: string]: any},
    /**
     * Should call the load method when done and pass the returned server file id.
     * This server file id is then used later on when reverting or restoring a file
     * so that your server knows which file to return without exposing that info
     * to the client.
     */
    load: (p: string | {[key: string]: any}) => void,
    /** Can call the error method is something went wrong, should exit after */
    error: (errorText: string) => void,
    /**
     * Should call the progress method to update the progress to 100% before calling load()
     * Setting computable to false switches the loading indicator to infinite mode
     */
    progress: ProgressServerConfigFunction,
    /** Let FilePond know the request has been cancelled */
    abort: () => void
) => void;

type RevertServerConfigFunction = (
    /** Server file id of the file to restore */
    uniqueFieldId: any,
    /** Should call the load method when done */
    load: () => void,
    /** Can call the error method is something went wrong, should exit after */
    error: (errorText: string) => void,
) => void;

type RestoreServerConfigFunction = (
    uniqueFileId: any,
    /** Should call the load method with a file object or blob when done */
    load: (file: ActualFileObject) => void,
    /** Can call the error method is something went wrong, should exit after */
    error: (errorText: string) => void,
    /**
     * Should call the progress method to update the progress to 100% before calling load()
     * Setting computable to false switches the loading indicator to infinite mode
     */
    progress: ProgressServerConfigFunction,
    /** Let FilePond know the request has been cancelled */
    abort: () => void,
    /**
     * Can call the headers method to supply FilePond with early response header string
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
     */
    headers: (headersString: string) => void,
) => void;

type LoadServerConfigFunction = (
    source: any,
    /** Should call the load method with a file object or blob when done */
    load: (file: ActualFileObject) => void,
    /** Can call the error method is something went wrong, should exit after */
    error: (errorText: string) => void,
    /**
     * Should call the progress method to update the progress to 100% before calling load()
     * Setting computable to false switches the loading indicator to infinite mode
     */
    progress: ProgressServerConfigFunction,
    /** Let FilePond know the request has been cancelled */
    abort: () => void,
    /**
     * Can call the headers method to supply FilePond with early response header string
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders>
     */
    headers: (headersString: string) => void,
) => void;

type FetchServerConfigFunction = (
    url: string,
    /** Should call the load method with a file object or blob when done */
    load: (file: ActualFileObject) => void,
    /** Can call the error method is something went wrong, should exit after */
    error: (errorText: string) => void,
    /**
     * Should call the progress method to update the progress to 100% before calling load()
     * Setting computable to false switches the loading indicator to infinite mode
     */
    progress: ProgressServerConfigFunction,
    /** Let FilePond know the request has been cancelled */
    abort: () => void,
    /**
     * Can call the headers method to supply FilePond with early response header string
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
     */
    headers: (headersString: string) => void,
) => void;

interface FilePondInitialFile {
    /** The server file reference */
    source: string;
    options: {
        /** Origin of file being added */
        type: 'input' | 'limbo' | 'local';
        /** Mock file information */
        file?: {
            name?: string;
            size?: number;
            type?: string;
        };
        /** File initial metadata */
        metadata?: {[key: string]: any};
    };
}

interface FilePondServerConfigProps {
    /** 
     * Server API Configuration.
     * See: https://pqina.nl/filepond/docs/patterns/api/server
     * @default null
     */
    server?: string | {
        url?: string
        timeout?: number
        process?: string | ServerUrl | ProcessServerConfigFunction;
        revert?: string | ServerUrl | RevertServerConfigFunction;
        restore?: string | ServerUrl | RestoreServerConfigFunction;
        load?: string | ServerUrl | LoadServerConfigFunction;
        fetch?: string | ServerUrl | FetchServerConfigFunction;
    };
    /** 
     * Immediately upload new files to the server
     * @default true
     */
    instantUpload?: boolean;
    /**
     * A list of file locations that should be loaded immediately.
     * See: https://pqina.nl/filepond/docs/patterns/api/filepond-object/#setting-initial-files
     * @default []
     */
    files?: FilePondInitialFile[] | ActualFileObject[] | Blob[] | string[];
}

interface FilePondDragDropProps {
    /** 
     * FilePond will catch all files dropped on the webpage.
     * @default false
     */
    dropOnPage?: boolean;
    /** Require drop on the FilePond element itself to catch the file.
     * @default true
    */
    dropOnElement?: boolean;
    /**
     * When enabled, files are validated before they are dropped.
     * A file is not added when it’s invalid.
     * @default false
     */
    dropValidation?: boolean;
    /**
     * Ignored file names when handling dropped directories.
     * Dropping directories is not supported on all browsers.
     * @default ['.ds_store', 'thumbs.db', 'desktop.ini']
     */
    ignoredFiles?: string[];
}

interface FilePondLabelProps {
    /**
     * The decimal separator used to render numbers.
     * By default this is determined automatically.
     * @default 'auto'
     */
    labelDecimalSeparator?: string;
    /**
     * The thousands separator used to render numbers.
     * By default this is determined automatically.
     * @default 'auto'
     */
    labelThousandsSeparator?: string;
    /**
     * Default label shown to indicate this is a drop area.
     * FilePond will automatically bind browse file events to
     * the element with CSS class .filepond--label-action.
     * @default 'Drag & Drop your files or <span class="filepond--label-action"> Browse </span>'
     */
    labelIdle?: string;
    /** 
     * Label shown when the field contains invalid files and is validated by the parent form.
     * @default 'Field contains invalid files'
     */
    labelInvalidField?: string;
    /** 
     * Label used while waiting for file size information.
     * @default 'Waiting for size'
     */
    labelFileWaitingForSize?: string;
    /** 
     * Label used when no file size information was received.
     * @default 'Size not available'
     */
    labelFileSizeNotAvailable?: string;
    /** 
     * Label used while loading a file.
     * @default 'Loading'
     */
    labelFileLoading?: string;
    /** 
     * Label used when file load failed.
     * @default 'Error during load'
     */
    labelFileLoadError?: string;
    /** 
     * Label used when uploading a file.
     * @default 'Uploading'
     */
    labelFileProcessing?: string;
    /** 
     * Label used when file upload has completed.
     * @default 'Upload complete'
     */
    labelFileProcessingComplete?: string;
    /** 
     * Label used when upload was cancelled.
     * @default 'Upload cancelled'
     */
    labelFileProcessingAborted?: string;
    /** 
     * Label used when something went wrong during file upload.
     * @default 'Error during upload'
     */
    labelFileProcessingError?: string;
    /** 
     * Label used when something went wrong during reverting the file upload.
     * @default 'Error during revert'
     */
    labelFileProcessingRevertError?: string;
    /** 
     * Label used when something went during during removing the file upload.
     * @default 'Error during remove'
     */
    labelFileRemoveError?: string;
    /** 
     * Label used to indicate to the user that an action can be cancelled.
     * @default 'tap to cancel'
     */
    labelTapToCancel?: string;
    /** 
     * Label used to indicate to the user that an action can be retried.
     * @default 'tap to retry'
     */
    labelTapToRetry?: string;
    /** 
     * Label used to indicate to the user that an action can be undone.
     * @default 'tap to undo'
     */
    labelTapToUndo?: string;
    /** 
     * Label used for remove button.
     * @default 'Remove'
     */
    labelButtonRemoveItem?: string;
    /** 
     * Label used for abort load button.
     * @default 'Abort'
     */
    labelButtonAbortItemLoad?: string;
    /** 
     * Label used for retry load.
     * @default 'Retry'
     */
    labelButtonRetryItemLoad?: string;
    /** 
     * Label used for abort upload button.
     * @default 'Cancel'
     */
    labelButtonAbortItemProcessing?: string;
    /** 
     * Label used for undo upload button.
     * @default 'Undo'
     */
    labelButtonUndoItemProcessing?: string;
    /** 
     * Label used for retry upload button.
     * @default 'Retry'
     */
    labelButtonRetryItemProcessing?: string;
    /** 
     * Label used for upload button.
     * @default 'Upload'
     */
    labelButtonProcessItem?: string;
}

interface FilePondSvgIconProps {
    /** 
     * The icon used for remove actions.
     * @default '<svg></svg>'
     */
    iconRemove?: string;
    /** 
     * The icon used for process actions.
     * @default '<svg></svg>'
     */
    iconProcess?: string;
    /** 
     * The icon used for retry actions.
     * @default '<svg></svg>'
     */
    iconRetry?: string;
     /** 
      * The icon used for undo actions.
      * @default '<svg></svg>'
      */
    iconUndo?: string;
}

interface FilePondErrorDescription {
    main: string;
    sub: string;
}

/**
 * Note that in my testing, callbacks that include an error prop
 * always give the error as the second prop, with the file as
 * the first prop.    This is contradictory to the current docs.
 */
interface FilePondCallbackProps {
    /** FilePond instance has been created and is ready. */
    oninit?: () => void;
    /**
     * FilePond instance throws a warning. For instance
     * when the maximum amount of files has been reached.
     * Optionally receives file if error is related to a
     * file object
     */
    onwarning?: (error: any, file?: File, status?: any) => void;
    /**
     * FilePond instance throws an error. Optionally receives
     * file if error is related to a file object.
     */
    onerror?: (file?: File, error?: FilePondErrorDescription, status?: any) => void;
    /** Started file load */
    onaddfilestart?: (file: File) => void;
    /** Made progress loading a file */
    onaddfileprogress?: (file: File, progress: number) => void;
    /** If no error, file has been successfully loaded */
    onaddfile?: (file: File, error?: FilePondErrorDescription) => void;
    /** Started processing a file */
    onprocessfilestart?: (file: File) => void;
    /** Made progress processing a file */
    onprocessfileprogress?: (file: File, progress: number) => void;
    /** Aborted processing of a file */
    onprocessfileabort?: (file: File) => void;
    /** Processing of a file has been reverted */
    onprocessfilerevert?: (file: File) => void;
    /** If no error, Processing of a file has been completed */
    onprocessfile?: (file: File, error?: FilePondErrorDescription) => void;
    /** Called when all files in the list have been processed */
    onprocessfiles?: () => void;
    /** File has been removed. */
    onremovefile?: (file: File, error?: FilePondErrorDescription) => void;
    /**
     * File has been transformed by the transform plugin or
     * another plugin subscribing to the prepare_output filter.
     * It receives the file item and the output data.
     */
    onpreparefile?: (file: File, output: any) => void;
    /** A file has been added or removed, receives a list of file items */
    onupdatefiles?: (fileItems: File[]) => void;
    /* Called when a file is clicked or tapped **/
    onactivatefile?: (file: File) => void;
}

interface FilePondHookProps {
    /**
     * FilePond is about to allow this item to be dropped, it can be a URL or a File object.
     * 
     * Return `true` or `false` depending on if you want to allow the item to be dropped.
     */
    beforeDropFile?: (file: File | string) => boolean;
    /**
     * FilePond is about to add this file. 
     * 
     * Return `false` to prevent adding it, or return a `Promise` and resolve with `true` or `false`.
     */
    beforeAddFile?: (item: File) => boolean | Promise<boolean>;
    /**
     * FilePond is about to remove this file. 
     * 
     * Return `false` to prevent adding it, or return a `Promise` and resolve with `true` or `false`.
     */
    beforeRemoveFile?: (item: File) => boolean | Promise<boolean>;
}

interface FilePondStyleProps {
    /** 
     * Set a different layout render mode.
     * @default null
     */
    stylePanelLayout?: 'integrated' | 'compact' | 'circle';
    /**
     * Set a forced aspect ratio for the FilePond drop area.
     * 
     * Accepts human readable aspect ratios like `1:1` or numeric aspect ratios like `0.75`.
     * @default null
     */
    stylePanelAspectRatio?: string;
    /**
     * Set a forced aspect ratio for the file items. 
     * 
     * Useful when rendering cropped or fixed aspect ratio images in grid view.
     * @default null
     */
    styleItemPanelAspectRatio?: string;
    /** 
     * The position of the remove item button
     * @default 'left'
     */
    styleButtonRemoveItemPosition?: string;
    /**
     * The position of the remove item button.
     * @default 'right' 
     */
    styleButtonProcessItemPosition?: string;
    /**
     * The position of the load indicator
     * @default 'right'
     */
    styleLoadIndicatorPosition?: string;
    /**
     * The position of the progress indicator
     * @default 'right'
     */
    styleProgressIndicatorPosition?: string;
}

type CaptureAttribute = "camera" | "microphone" | "camcorder";

interface FilePondBaseProps {
    id?: string;
    name?: string;
    disabled?: boolean;
    /** Class Name to put on wrapper */
    className?: string;
    /** Sets the required attribute to the output field */
    required?: boolean;
    /** Sets the given value to the capture attribute */
    captureMethod?: CaptureAttribute;

    /** Enable or disable drag n’ drop */
    allowDrop?: boolean;
    /** Enable or disable file browser */
    allowBrowse?: boolean;
    /**
     * Enable or disable pasting of files. Pasting files is not
     * supported on all browsers.
     */
    allowPaste?: boolean;
    /** Enable or disable adding multiple files */
    allowMultiple?: boolean;
    /** Allow drop to replace a file, only works when allowMultiple is false */
    allowReplace?: boolean;
    /** Allows the user to undo file upload */
    allowRevert?: boolean;
    /** Require the file to be reverted before removal */
    forceRevert?: boolean;

    /** The maximum number of files that filepond pond can handle */
    maxFiles?: number;
    /** Enables custom validity messages */
    checkValidity?: boolean;

    itemInsertLocationFreedom?: boolean;
    itemInsertLocation?: 'before' | 'after' | ((a: File, b: File) => number);
    itemInsertInterval?: number;

    /** The maximum number of files that can be uploaded in parallel */
    maxParallelUploads?: number;
    acceptedFileTypes?: string[];
}

export interface FilePondOptionProps extends
    FilePondDragDropProps,
    FilePondServerConfigProps,
    FilePondLabelProps,
    FilePondSvgIconProps,
    FilePondCallbackProps,
    FilePondHookProps,
    FilePondStyleProps,
    FilePondBaseProps {}

export class FilePond {
    readonly element: Element | null;
    readonly status: Status;

    name: string;
    className: string | null;
    required: boolean;
    disabled: boolean;
    captureMethod: CaptureAttribute | null;
    allowDrop: boolean;
    allowBrowse: boolean;
    allowPaste: boolean;
    allowMultiple: boolean;
    allowReplace: boolean;
    allowRevert: boolean;
    forceRevert: boolean;
    maxFiles: number | null;
    maxParallelUploads: number | null;
    checkValidity: boolean;

    itemInsertLocationFreedom: boolean;
    itemInsertLocation: 'before' | 'after' | ((a: File, b: File) => number);
    itemInsertInterval: number;

    dropOnPage: boolean;
    dropOnElement: boolean;
    dropValidation: false;
    ignoredFiles: string[];

    instantUpload: boolean;
    server: string | {
        url?: string
        timeout?: number
        process?: string | ServerUrl | ProcessServerConfigFunction;
        revert?: string | ServerUrl | RevertServerConfigFunction;
        restore?: string | ServerUrl | RestoreServerConfigFunction;
        load?: string | ServerUrl | LoadServerConfigFunction;
        fetch?: string | ServerUrl | FetchServerConfigFunction;
    } | null;   
    files: FilePondInitialFile[] | ActualFileObject[] | Blob[] | string[];

    /**
     * The decimal separator used to render numbers.
     * By default this is determined automatically.
     */
    labelDecimalSeparator: string;
    /**
     * The thousands separator used to render numbers.
     * By default this is determined automatically.
     */
    labelThousandsSeparator: string;
    /**
     * Default label shown to indicate this is a drop area.
     * FilePond will automatically bind browse file events to
     * the element with CSS class .filepond--label-action
     */
    labelIdle: string;
    /** Label shown when the field contains invalid files and is validated by the parent form */
    labelInvalidField: string;
    /** Label used while waiting for file size information */
    labelFileWaitingForSize: string;
    /** Label used when no file size information was received */
    labelFileSizeNotAvailable: string;
    /** Label used while loading a file */
    labelFileLoading: string;
    /** Label used when file load failed */
    labelFileLoadError: string;
    /** Label used when uploading a file */
    labelFileProcessing: string;
    /** Label used when file upload has completed */
    labelFileProcessingComplete: string;
    /** Label used when upload was cancelled */
    labelFileProcessingAborted: string;
    /** Label used when something went wrong during file upload */
    labelFileProcessingError: string;
    /** Label used when something went wrong during reverting the file upload */
    labelFileProcessingRevertError: string;
    /** Label used when something went during during removing the file upload */
    labelFileRemoveError: string;
    /** Label used to indicate to the user that an action can be cancelled. */
    labelTapToCancel: string;
    /** Label used to indicate to the user that an action can be retried. */
    labelTapToRetry: string;
    /** Label used to indicate to the user that an action can be undone. */
    labelTapToUndo: string;
    /** Label used for remove button */
    labelButtonRemoveItem: string;
    /** Label used for abort load button */
    labelButtonAbortItemLoad: string;
    /** Label used for retry load button */
    labelButtonRetryItemLoad: string;
    /** Label used for abort upload button */
    labelButtonAbortItemProcessing: string;
    /** Label used for undo upload button */
    labelButtonUndoItemProcessing: string;
    /** Label used for retry upload button */
    labelButtonRetryItemProcessing: string;
    /** Label used for upload button */
    labelButtonProcessItem: string;

    /** The icon used for remove actions */
    iconRemove: string;
    /** The icon used for process actions */
    iconProcess: string;
    /** The icon used for retry actions */
    iconRetry: string;
    /** The icon used for undo actions */
    iconUndo: string;

    /** FilePond instance has been created and is ready. */
    oninit?: () => void;
    /**
     * FilePond instance throws a warning. For instance
     * when the maximum amount of files has been reached.
     * Optionally receives file if error is related to a
     * file object
     */
    onwarning?: (error: any, file?: File, status?: any) => void;
    /**
     * FilePond instance throws an error. Optionally receives
     * file if error is related to a file object.
     */
    onerror?: (file?: File, error?: FilePondErrorDescription, status?: any) => void;
    /** Started file load */
    onaddfilestart?: (file: File) => void;
    /** Made progress loading a file */
    onaddfileprogress?: (file: File, progress: number) => void;
    /** If no error, file has been successfully loaded */
    onaddfile?: (file: File, error?: FilePondErrorDescription) => void;
    /** Started processing a file */
    onprocessfilestart?: (file: File) => void;
    /** Made progress processing a file */
    onprocessfileprogress?: (file: File, progress: number) => void;
    /** Aborted processing of a file */
    onprocessfileabort?: (file: File) => void;
    /** Processing of a file has been reverted */
    onprocessfilerevert?: (file: File) => void;
    /** If no error, Processing of a file has been completed */
    onprocessfile?: (file: File, error?: FilePondErrorDescription) => void;
    /** Called when all files in the list have been processed */
    onprocessfiles?: () => void;
    /** File has been removed. */
    onremovefile?: (file: File, error?: FilePondErrorDescription) => void;
    /**
     * File has been transformed by the transform plugin or
     * another plugin subscribing to the prepare_output filter.
     * It receives the file item and the output data.
     */
    onpreparefile?: (file: File, output: any) => void;
    /** A file has been added or removed, receives a list of file items */
    onupdatefiles?: (fileItems: File[]) => void;
    /* Called when a file is clicked or tapped **/
    onactivatefile?: (file: File) => void;

    beforeDropFile?: (file: File | string) => boolean;
    beforeAddFile?: (item: File) => boolean | Promise<boolean>;
    beforeRemoveFile?: (item: File) => boolean | Promise<boolean>;

    stylePanelLayout: 'integrated' | 'compact' | 'circle';
    stylePanelAspectRatio: string;
    styleItemPanelAspectRatio: string;
    styleButtonRemoveItemPosition: string;
    styleButtonProcessItemPosition: string;
    styleLoadIndicatorPosition: string;
    styleProgressIndicatorPosition: string;

    setOptions: (options: FilePondOptionProps) => void;
    addFile: (source: ActualFileObject | Blob | string, options?: {index: number}) => Promise<File>;
    addFiles: (source: ActualFileObject[] | Blob[] | string[], options?: {index: number}) => Promise<File[]>;
    removeFile: (query?: File | string | number) => void;
    removeFiles: () => void;
    processFile: (query?: File | string | number) => Promise<File>;
    processFiles: () => Promise<File[]>;
    getFile: () => File;
    getFiles: () => File[];
    browse: () => void;
    sort: (compare: (a: File, b: File) => number) => void;
    destroy: () => void;

    /** Inserts the FilePond instance after the supplied element */
    insertAfter: (element: Element) => void;
    /** Inserts the FilePond instance before the supplied element */
    insertBefore: (element: Element) => void;
    /** Appends FilePond to the given element  */
    appendTo: (element: Element) => void;
    /** Returns true if the current instance is attached to the supplied element */
    isAttachedTo: (element: Element) => void;
    /** Replaces the supplied element with FilePond */
    replaceElement: (element: Element) => void;
    /** If FilePond replaced the original element, this restores the original element to its original glory */
    restoreElement: (element: Element) => void;

    addEventListener: (event: string, fn: (...args: any[]) => void) => void;
    on: (event: string, fn: (...args: any[]) => void) => void;
    onOnce: (event: string, fn: (...args: any[]) => void) => void;
    off: (event: string, fn: (...args: any[]) => void) => void;  
}

/** Creates a new FilePond instance */
export function create(element?: Element, options?: FilePondOptionProps): FilePond;
/** Destroys the FilePond instance attached to the supplied element */
export function destroy(element: Element): void;
/** Returns the FilePond instance attached to the supplied element */
export function find(element: Element): FilePond;
/**
 * Parses a given section of the DOM tree for elements with class
 * .filepond and turns them into FilePond elements.
 */
export function parse(context: Element): void;
/** Registers a FilePond plugin for later use */
export function registerPlugin(...plugins: any[]): void;
/** Sets page level default options for all FilePond instances */
export function setOptions(options: FilePondOptionProps): void;
/** Returns the current default options */
export function getOptions(): FilePondOptionProps;
/** Determines whether or not the browser supports FilePond */
export function supported(): boolean;
/** Returns an object describing all the available options and their types, useful for writing FilePond adapters */
export const OptionTypes: object;
