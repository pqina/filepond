export const core = {
    abort: 'Afbryd',
    remove: 'Fjern',
    reset: 'Nulstil',
    undo: 'Fortryd',
    cancel: 'Annuller',
    store: 'Gem',
    revert: 'Gendan',
    busy: 'Optaget',
    loading: 'Indlæser',

    error: 'Fejl',
    warning: 'Advarsel',
    success: 'Lykkedes',
    info: 'Info',
    system: 'System',

    fileMainTypeImage: 'billede',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'lyd',
    fileMainTypeApplication: 'fil',

    assistAbort: 'Tryk for at annullere',
    assistUndo: 'Tryk for at fortryde',

    browseAndDrop: 'Træk filer hertil, eller <u>gennemse</u>',

    loadError: 'Kunne ikke indlæse filen.',

    loadDataTranserProgress: 'Indlæser filer',
    loadDataTranserInfo: 'Behandlet {{processedFiles}} af {{totalFiles}} filer',

    validationInvalid: 'Ugyldig fil.',
    validationFileNameMissing: 'Filnavn mangler',

    validationInvalidEntries: 'Fillisten indeholder ugyldige elementer.',
    validationInvalidState: 'Fillisten er i en ugyldig tilstand.',
    validationInvalidBusy: 'Fillisten er optaget.',
    validationInvalidEmpty: 'Udfyld dette felt.',

    // screenreader accessibility
    ariaRequired: 'required',
    ariaNoEntries: {
        template: 'No {{files}} selected',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'files',
                    false: 'file',
                },
            },
        },
    },
    ariaSingleEntry: 'Selected {{name}}',
    ariaMultipleEntries: '{{count}} files selected',
    ariaItemRoleDescription: 'Sortable',
    ariaDragDescription:
        'Press space to pick up and drop this item. Use the up and down arrow keys to move it to a new position.',
    ariaDragStateDrop: 'Dropped {{name}} at position {{position}}',
    ariaDragStateGrab: 'Picked up {{name}} at position {{position}}',
    ariaDragStateSort: 'Moved {{name}} to position {{position}} of {{total}}',
};

export const media = {
    mediaEdit: 'Rediger',
    mediaPlay: 'Afspil',
    mediaPause: 'Pause',
    mediaSilent: 'Ingen lyd',
    mediaUnmute: 'Slå lyd til',
    mediaMute: 'Slå lyd fra',
    mediaFullscreen: 'Fuld skærm',
    mediaLoadError: 'Kunne ikke indlæse {{fileMainType}}.',
    mediaPlayError: 'Kunne ikke afspille video.',
};

export const store = {
    storeRestoreProgress: 'Indlæser {{progress}}%',

    storeStorageQueued: 'Venter på upload',
    storeStorageProgress: 'Uploader {{progress}}%',
    storeStorageComplete: 'Upload fuldført',

    storeError: 'Kunne ikke gemme filen.',

    storeAwaitingCompletion: 'Ikke alle filer er blevet gemt.',
};

export const transform = {
    transformEditBusy: 'Redigerer fildata',
    transformError: 'Kunne ikke redigere fildata. Prøv igen.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Denne filtype er ikke tilladt. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Filen skal være af typen {{accept}}',
                    else: 'Tilladte typer er: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Denne filendelse er ikke tilladt. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Filen skal have endelsen {{accept}}',
                    else: 'Tilladte endelser er: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Filnavn mangler',
    validationFileNameMismatch: 'Dette filnavn er ugyldigt.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Denne fil er for lille. Minimumstørrelsen er {{minSize}}.',
    validationFileSizeOverflow: 'Denne fil er for stor. Maksimal størrelse er {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Den samlede filstørrelse er for lille. Minimum er {{minListSize}}.',
    validationListSizeOverflow:
        'Den samlede filstørrelse er for stor. Maksimum er {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Kunne ikke læse mediestørrelsen.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} har en ugyldig bredde. Bredden skal være mellem {{minWidth}} og {{maxWidth}} pixels.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} er for lille. Minimumsbredde er {{minWidth}} pixels.',
    validationMediaWidthOverflow:
        '{{fileMainType}} er for stor. Maksimal bredde er {{maxWidth}} pixels.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} har en ugyldig højde. Højden skal være mellem {{minHeight}} og {{maxHeight}} pixels.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} er for lille. Minimumshøjde er {{minHeight}} pixels.',
    validationMediaHeightOverflow:
        '{{fileMainType}} er for stor. Maksimal højde er {{maxHeight}} pixels.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} har en ugyldig opløsning. Opløsningen skal være mellem {{minResolution}}MP og {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} har en ugyldig opløsning. Minimumsopløsning er {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        '{{fileMainType}} har en ugyldig opløsning. Maksimal opløsning er {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'For få filer i listen. Minimum er {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'fil',
                    else: 'filer',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'For mange filer i listen. Maksimum er {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'fil',
                    else: 'filer',
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
