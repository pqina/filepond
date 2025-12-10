export const core = {
    abort: 'Avbryt',
    remove: 'Fjern',
    reset: 'Nullstill',
    undo: 'Angre',
    cancel: 'Avbryt',
    store: 'Lagre',
    revert: 'Tilbakestill',
    busy: 'Opptatt',
    loading: 'Laster',

    error: 'Feil',
    warning: 'Advarsel',
    success: 'Vellykket',
    info: 'Info',
    system: 'System',

    fileMainTypeImage: 'bilde',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'lyd',
    fileMainTypeApplication: 'fil',

    assistAbort: 'Trykk for å avbryte',
    assistUndo: 'Trykk for å angre',

    loadError: 'Kunne ikke laste inn filen.',

    loadDataTranserProgress: 'Laster filer',
    loadDataTranserInfo: '{{processedFiles}} av {{totalFiles}} filer behandlet',

    validationInvalid: 'Ugyldig fil.',
    validationFileNameMissing: 'Filnavn mangler',

    validationInvalidEntries: 'Listen inneholder ugyldige elementer.',
    validationInvalidState: 'Fillisten er i en ugyldig tilstand.',
    validationInvalidBusy: 'Fillisten er opptatt.',
    validationInvalidEmpty: 'Fyll ut dette feltet.',
};

export const media = {
    mediaEdit: 'Rediger',
    mediaPlay: 'Spill av',
    mediaPause: 'Pause',
    mediaSilent: 'Ingen lyd',
    mediaUnmute: 'Slå på lyd',
    mediaMute: 'Demp',
    mediaFullscreen: 'Fullskjerm',
    mediaLoadError: 'Kunne ikke laste {{fileMainType}}.',
    mediaPlayError: 'Kan ikke spille av videoen.',
};

export const store = {
    storeRestoreProgress: 'Laster {{progress}}%',

    storeStorageQueued: 'Venter på opplasting',
    storeStorageProgress: 'Laster opp {{progress}}%',
    storeStorageComplete: 'Opplasting fullført',

    storeError: 'Kunne ikke lagre filen.',
    storeAwaitingCompletion: 'Ikke alle filer er lagret.',
};

export const transform = {
    transformEditBusy: 'Redigerer fil',
    transformError: 'Kunne ikke redigere filen. Prøv igjen.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Denne filtypen er ikke tillatt. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Filen må være av typen {{accept}}',
                    else: 'Tillatte typer er: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Denne filendelsen er ikke tillatt. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Filen må ha endelsen {{accept}}',
                    else: 'Tillatte endelser er: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Filnavn mangler',
    validationFileNameMismatch: 'Dette filnavnet er ugyldig.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Denne filen er for liten. Minimumsstørrelse er {{minSize}}.',
    validationFileSizeOverflow: 'Denne filen er for stor. Maksimal størrelse er {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Total filstørrelse er for liten. Minimumskravet er {{minListSize}}.',
    validationListSizeOverflow:
        'Total filstørrelse er for stor. Maksimalt tillatt er {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Kunne ikke lese mediestørrelsen.',

    validationMediaWidthRangeMismatch:
        'Bredden på {{fileMainType}} er ugyldig. Bredden må være mellom {{minWidth}} og {{maxWidth}} piksler.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} er for liten. Minimumsbredde er {{minWidth}} piksler.',
    validationMediaWidthOverflow:
        '{{fileMainType}} er for stor. Maksimal bredde er {{maxWidth}} piksler.',

    validationMediaHeightRangeMismatch:
        'Høyden på {{fileMainType}} er ugyldig. Høyden må være mellom {{minHeight}} og {{maxHeight}} piksler.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} er for liten. Minimumshøyde er {{minHeight}} piksler.',
    validationMediaHeightOverflow:
        '{{fileMainType}} er for stor. Maksimal høyde er {{maxHeight}} piksler.',

    validationMediaResolutionRangeMismatch:
        'Oppløsningen til {{fileMainType}} er ugyldig. Den må være mellom {{minResolution}}MP og {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Oppløsningen til {{fileMainType}} er ugyldig. Minimumsoppløsning er {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'Oppløsningen til {{fileMainType}} er ugyldig. Maksimal oppløsning er {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'For få filer. Minimumskravet er {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'fil', else: 'filer' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'For mange filer. Maksimalt tillatt er {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'fil', else: 'filer' },
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
