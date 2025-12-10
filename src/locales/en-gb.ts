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

    // extension status
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    info: 'Info',
    system: 'System',

    // file types
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
    loadDataTranserProgress: 'Loading files',
    loadDataTranserInfo: 'Processed {{processedFiles}} of {{totalFiles}} files',

    // validaton fallback if no subscode set
    validationInvalid: 'Invalid file.',
    validationFileNameMissing: 'File name missing',

    // file list status
    validationInvalidEntries: 'The file list contains invalid items.',
    validationInvalidState: 'The file list is in an invalid state.',
    validationInvalidBusy: 'The file list is busy.',
    validationInvalidEmpty: 'Please fill in this field.',
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
        template: 'This file type is not allowed. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'File must by of type {{accept}}',
                    else: 'Accepted types are: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'This file extension is not allowed. {{details}}.',
        variables: {
            details: {
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
    validationFileNameMissing: 'File name missing',
    validationFileNameMismatch: 'This file name is invalid.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'This file is too small. Minimum size is {{minSize}}.',
    validationFileSizeOverflow: 'This file is too large. Maximum size is {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Total file size is too small. Minimum required is {{minListSize}}.',
    validationListSizeOverflow: 'Total file size is too large. Maximum allowed is {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Failed to read media size.',

    validationMediaWidthRangeMismatch:
        'The {{fileMainType}} width is invalid. Width must be between {{minWidth}} and {{maxWidth}} pixels.',

    validationMediaWidthUnderflow:
        'The {{fileMainType}} is too small. Minimum width is {{minWidth}} pixels.',
    validationMediaWidthOverflow:
        'The {{fileMainType}} is too large. Maximum width is {{maxWidth}} pixels.',

    validationMediaHeightRangeMismatch:
        'The {{fileMainType}} height is invalid. Height must be between {{minHeight}} and {{maxHeight}} pixels.',

    validationMediaHeightUnderflow:
        'The {{fileMainType}} is too small. Minimum height is {{minHeight}} pixels.',
    validationMediaHeightOverflow:
        'The {{fileMainType}} is too large. Maximum height is {{maxHeight}} pixels.',

    validationMediaResolutionRangeMismatch:
        'The {{fileMainType}} resolution is invalid. Resolution must be between {{minResolution}}MP and {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'The {{fileMainType}} resolution is invalid. Minimum resolution is {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'The {{fileMainType}} resolution is invalid. Maximum resolution is {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Too few files in the list. Minimum required is {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'file',
                    else: 'files',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Too many files in the list. Maximum required is {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'file',
                    else: 'files',
                },
            },
        },
    },
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
