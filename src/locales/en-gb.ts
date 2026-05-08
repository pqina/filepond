export const core = {
    // default
    abort: 'Abort',
    remove: 'Remove',
    reset: 'Reset',
    undo: 'Undo',
    cancel: 'Cancel',
    store: 'Store',
    revert: 'Revert',
    busy: 'Busy',
    loading: 'Loading',

    // units
    unitB: {
        1: 'byte',
        else: 'bytes',
    },
    unitKB: 'KB',
    unitMB: 'MB',
    unitGB: 'GB',
    unitTB: 'TB',
    unitPB: 'PB',
    unitKiB: 'KiB',
    unitMiB: 'MiB',
    unitGiB: 'GiB',
    unitTiB: 'TiB',
    unitPiB: 'PiB',
    unitPixels: {
        1: 'pixel',
        else: 'pixels',
    },
    unitFiles: {
        1: 'file',
        else: 'files',
    },

    // extension status
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    info: 'Info',
    system: 'System',

    // file types (these also match with image/*, video/*, and audio/*)
    fileMainTypeImage: 'image',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'file',

    // assist
    assistAbort: 'Tap to cancel',
    assistUndo: 'Tap to undo',

    // file status
    loadError: 'Failed to load file.',

    // data transfer status
    loadDataTransferProgress: 'Loading files',
    loadDataTransferInfo: 'Processed {{processedFiles}} of {{totalFiles}} files',

    // validation fallback if no subcode set
    validationInvalid: 'Invalid file.',
    validationFileNameMissing: 'File name missing.',

    // file list status
    validationInvalidEntries: 'The file list contains invalid items.',
    validationInvalidState: 'The file list is in an invalid state.',
    validationInvalidBusy: 'The file list is busy.',
    validationInvalidEmpty: {
        template: 'Please select {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'a file',
                    true: 'one or more files',
                },
            },
        },
    },

    // browse button labels
    browse: 'Choose {{maxFilesUnit}}',
    browseAndDrop: 'Drop {{maxFilesUnit}} here, or <u>browse</u>',

    // screenreader accessibility
    ariaRequired: 'required',
    ariaNoEntries: 'No {{maxFilesUnit}} selected',
    ariaSingleEntry: 'Selected {{name}}',
    ariaMultipleEntries: '{{count}} files selected',
    ariaItemRoleDescription: 'Sortable',
    ariaDragDescription:
        'Press space to pick up and drop an item. Use the up and down arrow keys to move it to a new position.',
    ariaDragStateDrop: 'Dropped {{name}} at position {{position}}',
    ariaDragStateGrab: 'Picked up {{name}} at position {{position}}',
    ariaDragStateSort: 'Moved {{name}} to position {{position}} of {{total}}',
};

export const media = {
    mediaEdit: 'Edit',
    mediaPlay: 'Play',
    mediaPause: 'Pause',
    mediaSilent: 'No audio',
    mediaUnmute: 'Unmute',
    mediaMute: 'Mute',
    mediaFullscreen: 'Fullscreen',
    mediaLoadError: 'Failed to load {{fileMainType}}.',
    mediaPlayError: 'Failed to play video.',
};

export const store = {
    storeRestoreProgress: 'Loading {{progress}}%',

    storeStorageQueued: 'Awaiting upload',
    storeStorageProgress: 'Uploading {{progress}}%',
    storeStorageComplete: 'Upload complete',

    // item status block
    storeError: 'Failed to store file.',

    // list validation status
    storeAwaitingCompletion: 'Not all files have been stored.',
};

export const transform = {
    transformEditBusy: 'Editing file data',
    transformError: 'Failed to edit file data, please try again.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'This file type is not allowed. {{accepted}}.',
        variables: {
            accepted: {
                context: 'count',
                map: {
                    1: 'File must be of type {{accept}}',
                    else: 'Accepted file types are: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'This file extension is not allowed. {{accepted}}.',
        variables: {
            accepted: {
                context: 'count',
                map: {
                    1: 'File must have the {{accept}} extension',
                    else: 'Accepted extensions are: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'File name missing.',
    validationFileNameMismatch: 'This file name is invalid.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'This file is too small. Minimum size is {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'This file is too large. Maximum size is {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Total file size is too small. Minimum total size is {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Total file size is too large. Maximum total size is {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Failed to read media size.',
    validationMediaWidthRangeMismatch:
        'The {{fileMainType}} width is invalid. Width must be between {{minWidth}} and {{maxWidth}} {{maxWidthUnit}}.',
    validationMediaWidthUnderflow:
        'The {{fileMainType}} is too small. Minimum width is {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'The {{fileMainType}} is too large. Maximum width is {{maxWidth}} {{maxWidthUnit}}.',
    validationMediaHeightRangeMismatch:
        'The {{fileMainType}} height is invalid. Height must be between {{minHeight}} and {{maxHeight}} {{maxHeightUnit}}.',
    validationMediaHeightUnderflow:
        'The {{fileMainType}} is too small. Minimum height is {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'The {{fileMainType}} is too large. Maximum height is {{maxHeight}} {{maxHeightUnit}}.',
    validationMediaResolutionRangeMismatch:
        'The {{fileMainType}} resolution is invalid. Resolution must be between {{minResolution}}MP and {{maxResolution}}MP.',
    validationMediaResolutionUnderflow:
        'The {{fileMainType}} resolution is invalid. Minimum resolution is {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        'The {{fileMainType}} resolution is invalid. Maximum resolution is {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Too few files in the list. Minimum amount is {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Too many files in the list. Maximum amount is {{maxFiles}} {{maxFilesUnit}}.',
};

export const validation = {
    ...validationFileSize,
    ...validationFileMimeType,
    ...validationFileExtension,
    ...validationFileName,
    ...validationMediaResolution,
    ...validationListSize,
    ...validationListCount,
};

export const locale = {
    ...core,
    ...store,
    ...media,
    ...validation,
    ...transform,
};
