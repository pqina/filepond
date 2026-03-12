/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Przerwij',
    remove: 'Usuń',
    reset: 'Resetuj',
    undo: 'Cofnij',
    cancel: 'Anuluj',
    store: 'Zapisz',
    revert: 'Przywróć',
    busy: 'Zajęte',
    loading: 'Ładowanie',

    error: 'Błąd',
    warning: 'Ostrzeżenie',
    success: 'Sukces',
    info: 'Informacja',
    system: 'System',

    fileMainTypeImage: 'obraz',
    fileMainTypeVideo: 'wideo',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'plik',

    assistAbort: 'Dotknij, aby anulować',
    assistUndo: 'Dotknij, aby cofnąć',
    browse: {
        template: 'Wybierz {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'pliki',
                    false: 'plik',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Upuść tutaj {{files}} lub <u>przeglądaj</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'pliki',
                    false: 'plik',
                },
            },
        },
    },

    loadError: 'Nie udało się załadować pliku.',

    loadDataTranserProgress: 'Ładowanie plików',
    loadDataTranserInfo: 'Przetworzono {{processedFiles}} z {{totalFiles}} plików',

    validationInvalid: 'Nieprawidłowy plik.',
    validationFileNameMissing: 'Brak nazwy pliku',

    validationInvalidEntries: 'Lista plików zawiera nieprawidłowe elementy.',
    validationInvalidState: 'Lista plików jest w nieprawidłowym stanie.',
    validationInvalidBusy: 'Lista plików jest zajęta.',
    validationInvalidEmpty: {
        template: 'Wybierz {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'plik',
                    true: 'co najmniej jeden plik',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'wymagane',
    ariaNoEntries: {
        template: 'Nie wybrano {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'plików',
                    false: 'pliku',
                },
            },
        },
    },
    ariaSingleEntry: 'Wybrano {{name}}',
    ariaMultipleEntries: 'Wybrano {{count}} plików',
    ariaItemRoleDescription: 'Możliwe sortowanie',
    ariaDragDescription:
        'Naciśnij spację, aby podnieść i upuścić element. Użyj klawiszy strzałek w górę i w dół, aby przenieść go na nową pozycję.',
    ariaDragStateDrop: 'Upuszczono {{name}} na pozycji {{position}}',
    ariaDragStateGrab: 'Podniesiono {{name}} na pozycji {{position}}',
    ariaDragStateSort: 'Przeniesiono {{name}} na pozycję {{position}} z {{total}}',
};

export const media = {
    mediaEdit: 'Edytuj',
    mediaPlay: 'Odtwórz',
    mediaPause: 'Pauza',
    mediaSilent: 'Brak dźwięku',
    mediaUnmute: 'Włącz dźwięk',
    mediaMute: 'Wycisz',
    mediaFullscreen: 'Pełny ekran',
    mediaLoadError: 'Nie udało się załadować {{fileMainType}}.',
    mediaPlayError: 'Nie udało się odtworzyć wideo.',
};

export const store = {
    storeRestoreProgress: 'Ładowanie {{progress}}%',

    storeStorageQueued: 'Oczekiwanie na przesłanie',
    storeStorageProgress: 'Przesyłanie {{progress}}%',
    storeStorageComplete: 'Przesyłanie zakończone',

    storeError: 'Nie udało się zapisać pliku.',

    storeAwaitingCompletion: 'Nie wszystkie pliki zostały zapisane.',
};

export const transform = {
    transformEditBusy: 'Edycja danych pliku',
    transformError: 'Nie udało się edytować danych pliku. Spróbuj ponownie.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Ten typ pliku jest niedozwolony. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Plik musi być typu {{accept}}',
                    else: 'Dozwolone typy: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'To rozszerzenie pliku jest niedozwolone. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Plik musi mieć rozszerzenie {{accept}}',
                    else: 'Dozwolone rozszerzenia: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Brak nazwy pliku',
    validationFileNameMismatch: 'Nazwa pliku jest nieprawidłowa.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Plik jest za mały. Minimum to {{minSize}}.',
    validationFileSizeOverflow: 'Plik jest za duży. Maksimum to {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Łączny rozmiar plików jest za mały. Minimum to {{minListSize}}.',
    validationListSizeOverflow: 'Łączny rozmiar plików jest za duży. Maksimum to {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Nie udało się odczytać rozmiaru multimediów.',

    validationMediaWidthRangeMismatch:
        'Szerokość {{fileMainType}} jest nieprawidłowa. Musi być między {{minWidth}} a {{maxWidth}} pikseli.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} jest za mały. Minimalna szerokość to {{minWidth}} pikseli.',
    validationMediaWidthOverflow:
        '{{fileMainType}} jest za duży. Maksymalna szerokość to {{maxWidth}} pikseli.',

    validationMediaHeightRangeMismatch:
        'Wysokość {{fileMainType}} jest nieprawidłowa. Musi być między {{minHeight}} a {{maxHeight}} pikseli.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} jest za mały. Minimalna wysokość to {{minHeight}} pikseli.',
    validationMediaHeightOverflow:
        '{{fileMainType}} jest za duży. Maksymalna wysokość to {{maxHeight}} pikseli.',

    validationMediaResolutionRangeMismatch:
        'Rozdzielczość jest nieprawidłowa. Musi być między {{minResolution}}MP a {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Rozdzielczość jest zbyt niska. Minimum to {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        'Rozdzielczość jest zbyt wysoka. Maksimum to {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Za mało plików na liście. Minimum to {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'plik',
                    else: 'pliki',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Za dużo plików na liście. Maksimum to {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'maxFiles',
                map: {
                    1: 'plik',
                    else: 'pliki',
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
