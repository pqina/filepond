/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Megszakítás',
    remove: 'Eltávolítás',
    reset: 'Visszaállítás',
    undo: 'Visszavonás',
    cancel: 'Mégse',
    store: 'Mentés',
    revert: 'Visszaállítás',
    busy: 'Foglalt',
    loading: 'Betöltés',

    error: 'Hiba',
    warning: 'Figyelmeztetés',
    success: 'Siker',
    info: 'Információ',
    system: 'Rendszer',

    fileMainTypeImage: 'kép',
    fileMainTypeVideo: 'videó',
    fileMainTypeAudio: 'hang',
    fileMainTypeApplication: 'fájl',

    assistAbort: 'Koppintson a megszakításhoz',
    assistUndo: 'Koppintson a visszavonáshoz',
    browse: {
        template: '{{files}} kiválasztása',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'fájlok',
                    false: 'fájl',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Húzza ide {{files}} vagy <u>tallózzon</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'fájlokat',
                    false: 'egy fájlt',
                },
            },
        },
    },

    loadError: 'A fájl betöltése nem sikerült.',

    loadDataTranserProgress: 'Fájlok betöltése',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} fájl feldolgozva',

    validationInvalid: 'Érvénytelen fájl.',
    validationFileNameMissing: 'Hiányzó fájlnév',

    validationInvalidEntries: 'A fájllista érvénytelen elemeket tartalmaz.',
    validationInvalidState: 'A fájllista érvénytelen állapotban van.',
    validationInvalidBusy: 'A fájllista foglalt.',
    validationInvalidEmpty: {
        template: 'Kérjük, válasszon {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'egy fájlt',
                    true: 'egy vagy több fájlt',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'kötelező',
    ariaNoEntries: {
        template: 'Nincs kiválasztott {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'fájlok',
                    false: 'fájl',
                },
            },
        },
    },
    ariaSingleEntry: 'Kiválasztva: {{name}}',
    ariaMultipleEntries: '{{count}} fájl kiválasztva',
    ariaItemRoleDescription: 'Rendezhető',
    ariaDragDescription:
        'A szóköz megnyomásával felveheti és leteheti ezt az elemet. Az új pozícióba mozgatáshoz használja a fel és le nyílbillentyűket.',
    ariaDragStateDrop: 'A(z) {{name}} lerakva a(z) {{position}}. pozícióban',
    ariaDragStateGrab: 'A(z) {{name}} felvéve a(z) {{position}}. pozícióban',
    ariaDragStateSort: 'A(z) {{name}} áthelyezve a(z) {{position}}. pozícióba, összesen {{total}} közül',
};

export const media = {
    mediaEdit: 'Szerkesztés',
    mediaPlay: 'Lejátszás',
    mediaPause: 'Szünet',
    mediaSilent: 'Nincs hang',
    mediaUnmute: 'Hang bekapcsolása',
    mediaMute: 'Némítás',
    mediaFullscreen: 'Teljes képernyő',
    mediaLoadError: '{{fileMainType}} betöltése nem sikerült.',
    mediaPlayError: 'A videó nem játszható le.',
};

export const store = {
    storeRestoreProgress: '{{progress}}% betöltése',

    storeStorageQueued: 'Feltöltésre vár',
    storeStorageProgress: 'Feltöltés {{progress}}%',
    storeStorageComplete: 'Feltöltés kész',

    storeError: 'A fájl mentése nem sikerült.',

    storeAwaitingCompletion: 'Nem minden fájl lett elmentve.',
};

export const transform = {
    transformEditBusy: 'Fájladatok szerkesztése',
    transformError: 'A fájladatok szerkesztése nem sikerült. Próbálja újra.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Ez a fájltípus nem engedélyezett. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'A fájlnak {{accept}} típusúnak kell lennie',
                    else: 'Engedélyezett típusok: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Ez a fájlkiterjesztés nem engedélyezett. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'A fájlnak {{accept}} kiterjesztéssel kell rendelkeznie',
                    else: 'Engedélyezett kiterjesztések: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Hiányzó fájlnév',
    validationFileNameMismatch: 'Érvénytelen fájlnév.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'A fájl túl kicsi. Minimum: {{minSize}}.',
    validationFileSizeOverflow: 'A fájl túl nagy. Maximum: {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'A teljes fájlméret túl kicsi. Minimum: {{minListSize}}.',
    validationListSizeOverflow: 'A teljes fájlméret túl nagy. Maximum: {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'A média mérete nem olvasható.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} szélessége érvénytelen. {{minWidth}} és {{maxWidth}} px között kell lennie.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} túl kicsi. Minimális szélesség {{minWidth}} px.',
    validationMediaWidthOverflow: '{{fileMainType}} túl nagy. Maximális szélesség {{maxWidth}} px.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} magassága érvénytelen. {{minHeight}} és {{maxHeight}} px között kell lennie.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} túl kicsi. Minimális magasság {{minHeight}} px.',
    validationMediaHeightOverflow:
        '{{fileMainType}} túl nagy. Maximális magasság {{maxHeight}} px.',

    validationMediaResolutionRangeMismatch:
        'A felbontás érvénytelen. {{minResolution}}–{{maxResolution}} MP között kell lennie.',

    validationMediaResolutionUnderflow: 'A felbontás túl alacsony. Minimum: {{minResolution}} MP.',
    validationMediaResolutionOverflow: 'A felbontás túl magas. Maximum: {{maxResolution}} MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Túl kevés fájl a listában. Minimum {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'fájl',
                    else: 'fájl',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Túl sok fájl a listában. Maximum {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'fájl',
                    else: 'fájl',
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
