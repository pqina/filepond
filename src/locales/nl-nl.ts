/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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
        1: 'bestand',
        else: 'bestanden',
    },

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
    // browse button labels
    browse: 'Kies {{maxFilesUnit}}',
    browseAndDrop: 'Sleep {{maxFilesUnit}} hierheen of <u>blader</u>',

    loadError: 'Bestand kon niet worden geladen.',

    // data transfer status
    loadDataTransferProgress: 'Bestanden laden',
    loadDataTransferInfo: '{{processedFiles}} van {{totalFiles}} bestanden verwerkt',

    // validation fallback
    validationInvalid: 'Ongeldig bestand.',
    validationFileNameMissing: 'Bestandsnaam ontbreekt',

    // file list status
    validationInvalidEntries: 'De lijst bevat ongeldige items.',
    validationInvalidState: 'De lijst is in een ongeldige staat.',
    validationInvalidBusy: 'De lijst is bezig.',
    validationInvalidEmpty: {
        template: 'Selecteer {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'een bestand',
                    true: 'een of meer bestanden',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'verplicht',
    ariaNoEntries: 'Geen {{maxFilesUnit}} geselecteerd',
    ariaSingleEntry: 'Geselecteerd {{name}}',
    ariaMultipleEntries: '{{count}} bestanden geselecteerd',
    ariaItemRoleDescription: 'Sorteerbaar',
    ariaDragDescription:
        'Druk op spatie om een item op te pakken en neer te zetten. Gebruik de pijltoetsen omhoog en omlaag om het naar een nieuwe positie te verplaatsen.',
    ariaDragStateDrop: '{{name}} neergezet op positie {{position}}',
    ariaDragStateGrab: '{{name}} opgepakt op positie {{position}}',
    ariaDragStateSort: '{{name}} verplaatst naar positie {{position}} van {{total}}',
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
    validationFileSizeUnderflow:
        'Dit bestand is te klein. Minimale grootte is {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Dit bestand is te groot. Maximale grootte is {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Totale bestandsgrootte is te klein. Minimale totale grootte is {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Totale bestandsgrootte is te groot. Maximale totale grootte is {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Kon mediagrootte niet lezen.',

    validationMediaWidthRangeMismatch:
        'De breedte van de {{fileMainType}} is ongeldig. De breedte moet tussen {{minWidth}} en {{maxWidth}} {{maxWidthUnit}} liggen.',

    validationMediaWidthUnderflow:
        'De {{fileMainType}} is te klein. Minimale breedte is {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'De {{fileMainType}} is te groot. Maximale breedte is {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'De hoogte van de {{fileMainType}} is ongeldig. De hoogte moet tussen {{minHeight}} en {{maxHeight}} {{maxHeightUnit}} liggen.',

    validationMediaHeightUnderflow:
        'De {{fileMainType}} is te klein. Minimale hoogte is {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'De {{fileMainType}} is te groot. Maximale hoogte is {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'De resolutie van de {{fileMainType}} is ongeldig. De resolutie moet tussen {{minResolution}}MP en {{maxResolution}}MP liggen.',

    validationMediaResolutionUnderflow:
        'De resolutie van de {{fileMainType}} is ongeldig. Minimale resolutie is {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'De resolutie van de {{fileMainType}} is ongeldig. Maximale resolutie is {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Te weinig bestanden in de lijst. Minimum aantal is {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Te veel bestanden in de lijst. Maximum aantal is {{maxFiles}} {{maxFilesUnit}}.',
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
