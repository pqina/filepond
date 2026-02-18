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
    browse: {
        template: '{{files}} auswählen',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'Dateien',
                    false: 'Datei',
                },
            },
        },
    },
    browseAndDrop: {
        template: '{{files}} hier ablegen oder <u>durchsuchen</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'Dateien',
                    false: 'eine Datei',
                },
            },
        },
    },

    loadError: 'Datei konnte nicht geladen werden.',

    loadDataTranserProgress: 'Dateien werden geladen',
    loadDataTranserInfo: '{{processedFiles}} von {{totalFiles}} Dateien verarbeitet',

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
    ariaNoEntries: {
        template: 'Keine {{files}} ausgewählt',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'Dateien',
                    false: 'Datei',
                },
            },
        },
    },
    ariaSingleEntry: 'Ausgewählt: {{name}}',
    ariaMultipleEntries: '{{count}} Dateien ausgewählt',
    ariaItemRoleDescription: 'Sortierbar',
    ariaDragDescription:
        'Drücke die Leertaste, um dieses Element aufzunehmen und abzulegen. Verwende die Pfeiltasten nach oben und unten, um es an eine neue Position zu verschieben.',
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
    validationFileSizeUnderflow: 'Diese Datei ist zu klein. Mindestgröße: {{minSize}}.',
    validationFileSizeOverflow: 'Diese Datei ist zu groß. Maximalgröße: {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Gesamtgröße zu klein. Mindestwert: {{minListSize}}.',
    validationListSizeOverflow: 'Gesamtgröße zu groß. Maximalwert: {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Mediagröße konnte nicht gelesen werden.',

    validationMediaWidthRangeMismatch:
        'Die Breite des {{fileMainType}} ist ungültig. Die Breite muss zwischen {{minWidth}} und {{maxWidth}} Pixel liegen.',

    validationMediaWidthUnderflow:
        'Der {{fileMainType}} ist zu klein. Die minimale Breite beträgt {{minWidth}} Pixel.',
    validationMediaWidthOverflow:
        'Der {{fileMainType}} ist zu groß. Die maximale Breite beträgt {{maxWidth}} Pixel.',

    validationMediaHeightRangeMismatch:
        'Die Höhe des {{fileMainType}} ist ungültig. Die Höhe muss zwischen {{minHeight}} und {{maxHeight}} Pixel liegen.',

    validationMediaHeightUnderflow:
        'Der {{fileMainType}} ist zu klein. Die minimale Höhe beträgt {{minHeight}} Pixel.',
    validationMediaHeightOverflow:
        'Der {{fileMainType}} ist zu groß. Die maximale Höhe beträgt {{maxHeight}} Pixel.',

    validationMediaResolutionRangeMismatch:
        'Die Auflösung des {{fileMainType}} ist ungültig. Die Auflösung muss zwischen {{minResolution}}MP und {{maxResolution}}MP liegen.',

    validationMediaResolutionUnderflow:
        'Die Auflösung des {{fileMainType}} ist ungültig. Die minimale Auflösung beträgt {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'Die Auflösung des {{fileMainType}} ist ungültig. Die maximale Auflösung beträgt {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Zu wenige Dateien. Minimum: {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'Datei', else: 'Dateien' },
            },
        },
    },
    validationListEntryCountOverflow: {
        template: 'Zu viele Dateien. Maximum: {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'Datei', else: 'Dateien' },
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
