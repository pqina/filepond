/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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
        1: 'fil',
        else: 'filer',
    },

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
    // browse button labels
    browse: 'Vælg {{maxFilesUnit}}',
    browseAndDrop: 'Slip {{maxFilesUnit}} her, eller <u>gennemse</u>',

    loadError: 'Kunne ikke indlæse filen.',

    loadDataTransferProgress: 'Indlæser filer',
    loadDataTransferInfo: 'Behandlet {{processedFiles}} af {{totalFiles}} filer',

    validationInvalid: 'Ugyldig fil.',
    validationFileNameMissing: 'Filnavn mangler',

    validationInvalidEntries: 'Fillisten indeholder ugyldige elementer.',
    validationInvalidState: 'Fillisten er i en ugyldig tilstand.',
    validationInvalidBusy: 'Fillisten er optaget.',
    validationInvalidEmpty: {
        template: 'Vælg {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'en fil',
                    true: 'en eller flere filer',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'påkrævet',
    ariaNoEntries: 'Ingen {{maxFilesUnit}} valgt',
    ariaSingleEntry: 'Valgt {{name}}',
    ariaMultipleEntries: '{{count}} filer valgt',
    ariaItemRoleDescription: 'Kan sorteres',
    ariaDragDescription:
        'Tryk på mellemrum for at tage og slippe et element. Brug pil op og pil ned for at flytte det til en ny position.',
    ariaDragStateDrop: 'Placerede {{name}} på position {{position}}',
    ariaDragStateGrab: 'Tog fat i {{name}} på position {{position}}',
    ariaDragStateSort: 'Flyttede {{name}} til position {{position}} af {{total}}',
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
    validationFileSizeUnderflow:
        'Denne fil er for lille. Minimumsstørrelsen er {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Denne fil er for stor. Maksimumsstørrelsen er {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Den samlede filstørrelse er for lille. Minimumsstørrelsen er {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Den samlede filstørrelse er for stor. Maksimumsstørrelsen er {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Kunne ikke læse mediestørrelsen.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}}-bredden er ugyldig. Bredden skal være mellem {{minWidth}} og {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} er for lille. Minimumsbredde er {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} er for stor. Maksimal bredde er {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}}-højden er ugyldig. Højden skal være mellem {{minHeight}} og {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} er for lille. Minimumshøjde er {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        '{{fileMainType}} er for stor. Maksimal højde er {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} har en ugyldig opløsning. Opløsningen skal være mellem {{minResolution}}MP og {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} har en ugyldig opløsning. Minimumsopløsning er {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        '{{fileMainType}} har en ugyldig opløsning. Maksimal opløsning er {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Der er for få filer på listen. Minimum er {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Der er for mange filer på listen. Maksimum er {{maxFiles}} {{maxFilesUnit}}.',
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
