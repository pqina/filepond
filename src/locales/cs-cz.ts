/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Zrušit',
    remove: 'Odstranit',
    reset: 'Resetovat',
    undo: 'Vrátit',
    cancel: 'Zrušit',
    store: 'Uložit',
    revert: 'Obnovit',
    busy: 'Zaneprázdněno',
    loading: 'Načítání',

    error: 'Chyba',
    warning: 'Varování',
    success: 'Úspěch',
    info: 'Informace',
    system: 'Systém',

    fileMainTypeImage: 'obrázek',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'soubor',

    assistAbort: 'Klepněte pro zrušení',
    assistUndo: 'Klepněte pro vrácení',
    browse: {
        template: 'Vybrat {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'soubory',
                    false: 'soubor',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Přetáhněte sem {{files}} nebo <u>procházejte</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'soubory',
                    false: 'soubor',
                },
            },
        },
    },

    loadError: 'Soubor se nepodařilo načíst.',

    loadDataTranserProgress: 'Načítání souborů',
    loadDataTranserInfo: 'Zpracováno {{processedFiles}} z {{totalFiles}} souborů',

    validationInvalid: 'Neplatný soubor.',
    validationFileNameMissing: 'Chybí název souboru',

    validationInvalidEntries: 'Seznam obsahuje neplatné položky.',
    validationInvalidState: 'Seznam souborů je v neplatném stavu.',
    validationInvalidBusy: 'Seznam souborů je zaneprázdněn.',
    validationInvalidEmpty: {
        template: 'Vyberte {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'soubor',
                    true: 'jeden nebo více souborů',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'povinné',
    ariaNoEntries: {
        template: 'Nebyly vybrány žádné {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'soubory',
                    false: 'soubor',
                },
            },
        },
    },
    ariaSingleEntry: 'Vybráno {{name}}',
    ariaMultipleEntries: 'Vybráno {{count}} souborů',
    ariaItemRoleDescription: 'Seřaditelné',
    ariaDragDescription:
        'Stisknutím mezerníku tuto položku zvednete a upustíte. Pomocí šipek nahoru a dolů ji přesunete na novou pozici.',
    ariaDragStateDrop: 'Položka {{name}} byla umístěna na pozici {{position}}',
    ariaDragStateGrab: 'Položka {{name}} byla uchopena na pozici {{position}}',
    ariaDragStateSort: 'Položka {{name}} byla přesunuta na pozici {{position}} z {{total}}',
};

export const media = {
    mediaEdit: 'Upravit',
    mediaPlay: 'Přehrát',
    mediaPause: 'Pozastavit',
    mediaSilent: 'Bez zvuku',
    mediaUnmute: 'Zapnout zvuk',
    mediaMute: 'Vypnout zvuk',
    mediaFullscreen: 'Celá obrazovka',
    mediaLoadError: '{{fileMainType}} se nepodařilo načíst.',
    mediaPlayError: 'Video se nepodařilo přehrát.',
};

export const store = {
    storeRestoreProgress: 'Načítání {{progress}}%',

    storeStorageQueued: 'Čeká na nahrání',
    storeStorageProgress: 'Nahrávání {{progress}}%',
    storeStorageComplete: 'Nahrávání dokončeno',

    storeError: 'Soubor se nepodařilo uložit.',

    storeAwaitingCompletion: 'Ne všechny soubory byly uloženy.',
};

export const transform = {
    transformEditBusy: 'Úprava dat souboru',
    transformError: 'Nepodařilo se upravit data souboru. Zkuste to znovu.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Tento typ souboru není povolen. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Soubor musí být typu {{accept}}',
                    else: 'Povolené typy: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Tato přípona není povolena. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Soubor musí mít příponu {{accept}}',
                    else: 'Povolené přípony: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Chybí název souboru',
    validationFileNameMismatch: 'Neplatný název souboru.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Soubor je příliš malý. Minimum je {{minSize}}.',
    validationFileSizeOverflow: 'Soubor je příliš velký. Maximum je {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Celková velikost je příliš malá. Minimum je {{minListSize}}.',
    validationListSizeOverflow: 'Celková velikost je příliš velká. Maximum je {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Nelze přečíst velikost média.',

    validationMediaWidthRangeMismatch:
        'Šířka {{fileMainType}} je neplatná. Musí být mezi {{minWidth}} a {{maxWidth}} px.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} je příliš malý. Minimální šířka je {{minWidth}} px.',
    validationMediaWidthOverflow:
        '{{fileMainType}} je příliš velký. Maximální šířka je {{maxWidth}} px.',

    validationMediaHeightRangeMismatch:
        'Výška {{fileMainType}} je neplatná. Musí být mezi {{minHeight}} a {{maxHeight}} px.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} je příliš malý. Minimální výška je {{minHeight}} px.',
    validationMediaHeightOverflow:
        '{{fileMainType}} je příliš velký. Maximální výška je {{maxHeight}} px.',

    validationMediaResolutionRangeMismatch:
        'Rozlišení je neplatné. Musí být mezi {{minResolution}}MP a {{maxResolution}}MP.',

    validationMediaResolutionUnderflow: 'Rozlišení je příliš nízké. Minimum {{minResolution}}MP.',
    validationMediaResolutionOverflow: 'Rozlišení je příliš vysoké. Maximum {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Příliš málo souborů. Minimum {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'soubor',
                    else: 'souborů',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Příliš mnoho souborů. Maximum {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'soubor',
                    else: 'souborů',
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
