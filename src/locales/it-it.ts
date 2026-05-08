/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Interrompi',
    remove: 'Rimuovi',
    reset: 'Reimposta',
    undo: 'Annulla',
    cancel: 'Annulla',
    store: 'Salva',
    revert: 'Ripristina',
    busy: 'In corso',
    loading: 'Caricamento',

    // units
    unitB: {
        1: 'byte',
        else: 'byte',
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
        else: 'pixel',
    },
    unitFiles: {
        1: 'file',
        else: 'file',
    },

    error: 'Errore',
    warning: 'Avviso',
    success: 'Completato',
    info: 'Info',
    system: 'Sistema',

    fileMainTypeImage: 'immagine',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'file',

    assistAbort: 'Tocca per annullare',
    assistUndo: 'Tocca per annullare l’azione',
    // browse button labels
    browse: 'Scegli {{maxFilesUnit}}',
    browseAndDrop: 'Rilascia qui {{maxFilesUnit}} oppure <u>sfoglia</u>',

    loadError: 'Impossibile caricare il file.',

    loadDataTransferProgress: 'Caricamento dei file',
    loadDataTransferInfo: '{{processedFiles}} di {{totalFiles}} file elaborati',

    validationInvalid: 'File non valido.',
    validationFileNameMissing: 'Nome file mancante',

    validationInvalidEntries: 'L’elenco contiene elementi non validi.',
    validationInvalidState: 'L’elenco dei file è in uno stato non valido.',
    validationInvalidBusy: 'L’elenco dei file è occupato.',
    validationInvalidEmpty: {
        template: 'Seleziona {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'un file',
                    true: 'uno o più file',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'obbligatorio',
    ariaNoEntries: 'Nessun {{maxFilesUnit}} selezionato',
    ariaSingleEntry: 'Selezionato {{name}}',
    ariaMultipleEntries: '{{count}} file selezionati',
    ariaItemRoleDescription: 'Ordinabile',
    ariaDragDescription:
        'Premi spazio per prendere e rilasciare un elemento. Usa i tasti freccia su e giù per spostarlo in una nuova posizione.',
    ariaDragStateDrop: '{{name}} rilasciato nella posizione {{position}}',
    ariaDragStateGrab: '{{name}} preso nella posizione {{position}}',
    ariaDragStateSort: '{{name}} spostato nella posizione {{position}} di {{total}}',
};

export const media = {
    mediaEdit: 'Modifica',
    mediaPlay: 'Riproduci',
    mediaPause: 'Pausa',
    mediaSilent: 'Senza audio',
    mediaUnmute: 'Attiva audio',
    mediaMute: 'Disattiva audio',
    mediaFullscreen: 'Schermo intero',
    mediaLoadError: 'Impossibile caricare la {{fileMainType}}.',
    mediaPlayError: 'Impossibile riprodurre il video.',
};

export const store = {
    storeRestoreProgress: 'Caricamento {{progress}}%',

    storeStorageQueued: 'In attesa di caricamento',
    storeStorageProgress: 'Caricamento {{progress}}%',
    storeStorageComplete: 'Caricamento completato',

    storeError: 'Impossibile salvare il file.',
    storeAwaitingCompletion: 'Non tutti i file sono stati salvati.',
};

export const transform = {
    transformEditBusy: 'Modifica del file in corso',
    transformError: 'Impossibile modificare il file. Riprova.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Questo tipo di file non è consentito. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Il file deve essere di tipo {{accept}}',
                    else: 'I tipi consentiti sono: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Questa estensione file non è consentita. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Il file deve avere estensione {{accept}}',
                    else: 'Le estensioni consentite sono: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Nome file mancante',
    validationFileNameMismatch: 'Questo nome file non è valido.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Questo file è troppo piccolo. La dimensione minima è {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Questo file è troppo grande. La dimensione massima è {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'La dimensione totale dei file è troppo piccola. La dimensione totale minima è {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'La dimensione totale dei file è troppo grande. La dimensione totale massima è {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Impossibile leggere la dimensione del file.',

    validationMediaWidthRangeMismatch:
        'La larghezza di {{fileMainType}} non è valida. La larghezza deve essere compresa tra {{minWidth}} e {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} è troppo piccolo. La larghezza minima è {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} è troppo grande. La larghezza massima è {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        "L'altezza di {{fileMainType}} non è valida. L'altezza deve essere compresa tra {{minHeight}} e {{maxHeight}} {{maxHeightUnit}}.",

    validationMediaHeightUnderflow:
        "{{fileMainType}} è troppo piccolo. L'altezza minima è {{minHeight}} {{minHeightUnit}}.",
    validationMediaHeightOverflow:
        "{{fileMainType}} è troppo grande. L'altezza massima è {{maxHeight}} {{maxHeightUnit}}.",

    validationMediaResolutionRangeMismatch:
        'La risoluzione del {{fileMainType}} non è valida. Deve essere tra {{minResolution}}MP e {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'La risoluzione del {{fileMainType}} non è valida. La risoluzione minima è {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'La risoluzione del {{fileMainType}} non è valida. La risoluzione massima è {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        "Troppi pochi file nell'elenco. Il minimo è {{minFiles}} {{minFilesUnit}}.",
    validationListEntryCountOverflow:
        "Troppi file nell'elenco. Il massimo è {{maxFiles}} {{maxFilesUnit}}.",
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
