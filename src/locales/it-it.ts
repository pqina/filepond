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

    loadError: 'Impossibile caricare il file.',

    loadDataTranserProgress: 'Caricamento dei file',
    loadDataTranserInfo: '{{processedFiles}} di {{totalFiles}} file elaborati',

    validationInvalid: 'File non valido.',
    validationFileNameMissing: 'Nome file mancante',

    validationInvalidEntries: 'L’elenco contiene elementi non validi.',
    validationInvalidState: 'L’elenco dei file è in uno stato non valido.',
    validationInvalidBusy: 'L’elenco dei file è occupato.',
    validationInvalidEmpty: 'Compila questo campo.',
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
        'Questo file è troppo piccolo. La dimensione minima è {{minSize}}.',
    validationFileSizeOverflow: 'Questo file è troppo grande. La dimensione massima è {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'La dimensione totale dei file è troppo piccola. Il minimo richiesto è {minListSize}.',
    validationListSizeOverflow:
        'La dimensione totale dei file è troppo grande. Il massimo consentito è {maxListSize}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Impossibile leggere le dimensioni del media.',

    validationMediaWidthRangeMismatch:
        'La larghezza della {{fileMainType}} non è valida. Deve essere tra {{minWidth}} e {{maxWidth}}.',
    validationMediaWidthUnderflow:
        'La {{fileMainType}} è troppo stretta. La larghezza minima è {{minWidth}}.',
    validationMediaWidthOverflow:
        'La {{fileMainType}} è troppo larga. La larghezza massima è {{maxWidth}}.',

    validationMediaHeightRangeMismatch:
        'L’altezza della {{fileMainType}} non è valida. Deve essere tra {{minHeight}} e {{maxHeight}}.',
    validationMediaHeightUnderflow:
        'La {{fileMainType}} è troppo bassa. L’altezza minima è {{minHeight}}.',
    validationMediaHeightOverflow:
        'La {{fileMainType}} è troppo alta. L’altezza massima è {{maxHeight}}.',

    validationMediaResolutionRangeMismatch:
        'La risoluzione della {{fileMainType}} non è valida. Deve essere tra {{minResolution}} e {maxResolution}.',
    validationMediaResolutionUnderflow:
        'La risoluzione della {{fileMainType}} non è valida. La risoluzione minima è {{minResolution}}.',
    validationMediaResolutionOverflow:
        'La risoluzione della {{fileMainType}} non è valida. La risoluzione massima è {{maxResolution}}.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Troppi pochi file. Il minimo richiesto è {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'file', else: 'file' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Troppi file. Il massimo consentito è {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'file', else: 'file' },
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
