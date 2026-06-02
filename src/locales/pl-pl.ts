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

    // units
    unitB: {
        1: 'bajt',
        else: 'bajty',
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
        1: 'piksel',
        else: 'piksele',
    },
    unitFiles: {
        1: 'plik',
        else: 'pliki',
    },

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
    // browse button labels
    browse: 'Wybierz {{maxFilesUnit}}',
    browseAndDrop: 'Upuść tutaj {{maxFilesUnit}} lub <u>przeglądaj</u>',

    loadError: 'Nie udało się załadować pliku.',

    loadDataTransferProgress: 'Ładowanie plików',
    loadDataTransferInfo: 'Przetworzono {{processedFiles}} z {{totalFiles}} plików',

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
    ariaNoEntries: 'Nie wybrano {{maxFilesUnit}}',
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
    storeRestoreError: 'Nie udało się załadować pliku.',
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
    validationFileSizeUnderflow:
        'Ten plik jest za mały. Minimalny rozmiar to {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Ten plik jest za duży. Maksymalny rozmiar to {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Łączny rozmiar plików jest za mały. Minimalny łączny rozmiar to {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Łączny rozmiar plików jest za duży. Maksymalny łączny rozmiar to {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Nie udało się odczytać rozmiaru multimediów.',

    validationMediaWidthRangeMismatch:
        'Szerokość {{fileMainType}} jest nieprawidłowa. Szerokość musi mieścić się między {{minWidth}} a {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} jest za mały. Minimalna szerokość to {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} jest za duży. Maksymalna szerokość to {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'Wysokość {{fileMainType}} jest nieprawidłowa. Wysokość musi mieścić się między {{minHeight}} a {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} jest za mały. Minimalna wysokość to {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        '{{fileMainType}} jest za duży. Maksymalna wysokość to {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Rozdzielczość jest nieprawidłowa. Musi być między {{minResolution}}MP a {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Rozdzielczość jest zbyt niska. Minimum to {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        'Rozdzielczość jest zbyt wysoka. Maksimum to {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Na liście jest za mało plików. Minimum to {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Na liście jest za dużo plików. Maksimum to {{maxFiles}} {{maxFilesUnit}}.',
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
