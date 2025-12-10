export const core = {
    // default
    abort: 'Afbreken',
    remove: 'Verwijderen',
    reset: 'Resetten',
    undo: 'Ongedaan maken',
    cancel: 'Annuleren',
    store: 'Opslaan',
    revert: 'Terugzetten',
    busy: 'Bezig',
    loading: 'Laden',

    // extension status
    error: 'Fout',
    warning: 'Waarschuwing',
    success: 'Gelukt',
    info: 'Info',
    system: 'Systeem',

    // file types
    fileMainTypeImage: 'afbeelding',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'bestand',

    // assist
    assistAbort: 'Tik om te annuleren',
    assistUndo: 'Tik om ongedaan te maken',

    // file status
    loadError: 'Bestand kon niet worden geladen.',

    // data transfer status
    loadDataTranserProgress: 'Bestanden laden',
    loadDataTranserInfo: '{{processedFiles}} van {{totalFiles}} bestanden verwerkt',

    // validation fallback
    validationInvalid: 'Ongeldig bestand.',
    validationFileNameMissing: 'Bestandsnaam ontbreekt',

    // file list status
    validationInvalidEntries: 'De lijst bevat ongeldige items.',
    validationInvalidState: 'De bestandslijst is in een ongeldige staat.',
    validationInvalidBusy: 'De bestandslijst is bezig.',
    validationInvalidEmpty: 'Vul dit veld in.',
};

export const media = {
    mediaEdit: 'Bewerken',
    mediaPlay: 'Afspelen',
    mediaPause: 'Pauzeren',
    mediaSilent: 'Geen audio',
    mediaUnmute: 'Dempen uit',
    mediaMute: 'Dempen',
    mediaFullscreen: 'Volledig scherm',
    mediaLoadError: '{{fileMainType}} kon niet worden geladen.',
    mediaPlayError: 'Video kon niet worden afgespeeld.',
};

export const store = {
    storeRestoreProgress: '{{progress}}% laden',

    storeStorageQueued: 'Wachten op upload',
    storeStorageProgress: 'Uploaden {{progress}}%',
    storeStorageComplete: 'Upload voltooid',

    // item status block
    storeError: 'Bestand kon niet worden opgeslagen.',

    // list validation status
    storeAwaitingCompletion: 'Niet alle bestanden zijn opgeslagen.',
};

export const transform = {
    transformEditBusy: 'Bestand wordt bewerkt',
    transformError: 'Bestand kon niet worden bewerkt. Probeer het opnieuw.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Dit bestandstype is niet toegestaan. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Bestand moet van het type {{accept}} zijn',
                    else: 'Toegestane types zijn: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Deze bestandsextensie is niet toegestaan. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Bestand moet de {{accept}} extensie hebben',
                    else: 'Toegestane extensies zijn: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Bestandsnaam ontbreekt',
    validationFileNameMismatch: 'Deze bestandsnaam is ongeldig.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Dit bestand is te klein. Minimale grootte is {{minSize}}.',
    validationFileSizeOverflow: 'Dit bestand is te groot. Maximale grootte is {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Totale bestandsgrootte is te klein. Minimum vereist is {{minListSize}}.',
    validationListSizeOverflow:
        'Totale bestandsgrootte is te groot. Maximum toegestaan is {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Kon mediagrootte niet lezen.',

    validationMediaWidthRangeMismatch:
        'De breedte van de {{fileMainType}} is ongeldig. De breedte moet tussen {{minWidth}} en {{maxWidth}} pixels liggen.',

    validationMediaWidthUnderflow:
        'De {{fileMainType}} is te klein. Minimale breedte is {{minWidth}} pixels.',
    validationMediaWidthOverflow:
        'De {{fileMainType}} is te groot. Maximale breedte is {{maxWidth}} pixels.',

    validationMediaHeightRangeMismatch:
        'De hoogte van de {{fileMainType}} is ongeldig. De hoogte moet tussen {{minHeight}} en {{maxHeight}} pixels liggen.',

    validationMediaHeightUnderflow:
        'De {{fileMainType}} is te klein. Minimale hoogte is {{minHeight}} pixels.',
    validationMediaHeightOverflow:
        'De {{fileMainType}} is te groot. Maximale hoogte is {{maxHeight}} pixels.',

    validationMediaResolutionRangeMismatch:
        'De resolutie van de {{fileMainType}} is ongeldig. De resolutie moet tussen {{minResolution}}MP en {{maxResolution}}MP liggen.',

    validationMediaResolutionUnderflow:
        'De resolutie van de {{fileMainType}} is ongeldig. Minimale resolutie is {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'De resolutie van de {{fileMainType}} is ongeldig. Maximale resolutie is {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Te weinig bestanden. Minimum vereist is {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'bestand',
                    else: 'bestanden',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Te veel bestanden. Maximum toegestaan is {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'bestand',
                    else: 'bestanden',
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
