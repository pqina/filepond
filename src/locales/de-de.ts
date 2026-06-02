/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Abbrechen',
    remove: 'Entfernen',
    reset: 'Zurücksetzen',
    undo: 'Rückgängig',
    cancel: 'Abbrechen',
    store: 'Speichern',
    revert: 'Wiederherstellen',
    busy: 'Beschäftigt',
    loading: 'Laden',

    // units
    unitB: {
        1: 'Byte',
        else: 'Bytes',
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
        1: 'Pixel',
        else: 'Pixel',
    },
    unitFiles: {
        1: 'Datei',
        else: 'Dateien',
    },

    error: 'Fehler',
    warning: 'Warnung',
    success: 'Erfolgreich',
    info: 'Info',
    system: 'System',

    fileMainTypeImage: 'Bild',
    fileMainTypeVideo: 'Video',
    fileMainTypeAudio: 'Audio',
    fileMainTypeApplication: 'Datei',

    assistAbort: 'Tippen zum Abbrechen',
    assistUndo: 'Tippen zum Rückgängig machen',
    // browse button labels
    browse: '{{maxFilesUnit}} auswählen',
    browseAndDrop: '{{maxFilesUnit}} hier ablegen oder <u>durchsuchen</u>',

    loadError: 'Datei konnte nicht geladen werden.',

    loadDataTransferProgress: 'Dateien werden geladen',
    loadDataTransferInfo: '{{processedFiles}} von {{totalFiles}} Dateien verarbeitet',

    validationInvalid: 'Ungültige Datei.',
    validationFileNameMissing: 'Dateiname fehlt',

    validationInvalidEntries: 'Die Dateiliste enthält ungültige Elemente.',
    validationInvalidState: 'Die Dateiliste befindet sich in einem ungültigen Zustand.',
    validationInvalidBusy: 'Die Dateiliste ist beschäftigt.',
    validationInvalidEmpty: {
        template: 'Bitte wählen Sie {{files}} aus.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'eine Datei',
                    true: 'eine oder mehrere Dateien',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'erforderlich',
    ariaNoEntries: 'Keine {{maxFilesUnit}} ausgewählt',
    ariaSingleEntry: 'Ausgewählt: {{name}}',
    ariaMultipleEntries: '{{count}} Dateien ausgewählt',
    ariaItemRoleDescription: 'Sortierbar',
    ariaDragDescription:
        'Drücke die Leertaste, um ein Element aufzunehmen und abzulegen. Verwende die Pfeiltasten nach oben und unten, um es an eine neue Position zu verschieben.',
    ariaDragStateDrop: '„{{name}}“ an Position {{position}} abgelegt',
    ariaDragStateGrab: '„{{name}}“ an Position {{position}} aufgenommen',
    ariaDragStateSort: '„{{name}}“ an Position {{position}} von {{total}} verschoben',
};

export const media = {
    mediaEdit: 'Bearbeiten',
    mediaPlay: 'Abspielen',
    mediaPause: 'Pause',
    mediaSilent: 'Kein Audio',
    mediaUnmute: 'Stumm aus',
    mediaMute: 'Stumm',
    mediaFullscreen: 'Vollbild',
    mediaLoadError: '{{fileMainType}} konnte nicht geladen werden.',
    mediaPlayError: 'Video kann nicht abgespielt werden.',
};

export const store = {
    storeRestoreError: 'Datei konnte nicht geladen werden.',
    storeRestoreProgress: '{{progress}}% laden',
    storeStorageQueued: 'Warten auf Upload',
    storeStorageProgress: 'Hochladen {{progress}}%',
    storeStorageComplete: 'Upload abgeschlossen',
    storeError: 'Datei konnte nicht gespeichert werden.',
    storeAwaitingCompletion: 'Nicht alle Dateien wurden gespeichert.',
};

export const transform = {
    transformEditBusy: 'Datei wird bearbeitet',
    transformError: 'Datei konnte nicht bearbeitet werden. Bitte erneut versuchen.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Dieser Dateityp ist nicht erlaubt. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Datei muss vom Typ {{accept}} sein',
                    else: 'Zulässige Typen: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Diese Dateierweiterung ist nicht erlaubt. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Datei muss die Erweiterung {{accept}} haben',
                    else: 'Zulässige Erweiterungen: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Dateiname fehlt',
    validationFileNameMismatch: 'Dieser Dateiname ist ungültig.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Diese Datei ist zu klein. Mindestgröße: {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Diese Datei ist zu groß. Maximalgröße: {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Gesamtgröße zu klein. Die Mindestgesamtgröße beträgt {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Gesamtgröße zu groß. Die maximale Gesamtgröße beträgt {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Mediagröße konnte nicht gelesen werden.',

    validationMediaWidthRangeMismatch:
        'Die Breite des {{fileMainType}} ist ungültig. Die Breite muss zwischen {{minWidth}} und {{maxWidth}} {{maxWidthUnit}} liegen.',

    validationMediaWidthUnderflow:
        'Der {{fileMainType}} ist zu klein. Die minimale Breite beträgt {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'Der {{fileMainType}} ist zu groß. Die maximale Breite beträgt {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'Die Höhe des {{fileMainType}} ist ungültig. Die Höhe muss zwischen {{minHeight}} und {{maxHeight}} {{maxHeightUnit}} liegen.',

    validationMediaHeightUnderflow:
        'Der {{fileMainType}} ist zu klein. Die minimale Höhe beträgt {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'Der {{fileMainType}} ist zu groß. Die maximale Höhe beträgt {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Die Auflösung des {{fileMainType}} ist ungültig. Die Auflösung muss zwischen {{minResolution}}MP und {{maxResolution}}MP liegen.',

    validationMediaResolutionUnderflow:
        'Die Auflösung des {{fileMainType}} ist ungültig. Die minimale Auflösung beträgt {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'Die Auflösung des {{fileMainType}} ist ungültig. Die maximale Auflösung beträgt {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Zu wenige Dateien in der Liste. Minimum: {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Zu viele Dateien in der Liste. Maximum: {{maxFiles}} {{maxFilesUnit}}.',
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
