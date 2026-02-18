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

    browseAndDrop: 'Húzza ide a fájlokat, vagy <u>tallózzon</u>',

    loadError: 'A fájl betöltése nem sikerült.',

    loadDataTranserProgress: 'Fájlok betöltése',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} fájl feldolgozva',

    validationInvalid: 'Érvénytelen fájl.',
    validationFileNameMissing: 'Hiányzó fájlnév',

    validationInvalidEntries: 'A fájllista érvénytelen elemeket tartalmaz.',
    validationInvalidState: 'A fájllista érvénytelen állapotban van.',
    validationInvalidBusy: 'A fájllista foglalt.',
    validationInvalidEmpty: 'Töltse ki ezt a mezőt.',

    // screenreader accessibility
    ariaRequired: 'required',
    ariaNoEntries: {
        template: 'No {{files}} selected',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'files',
                    false: 'file',
                },
            },
        },
    },
    ariaSingleEntry: 'Selected {{name}}',
    ariaMultipleEntries: '{{count}} files selected',
    ariaItemRoleDescription: 'Sortable',
    ariaDragDescription:
        'Press space to pick up and drop this item. Use the up and down arrow keys to move it to a new position.',
    ariaDragStateDrop: 'Dropped {{name}} at position {{position}}',
    ariaDragStateGrab: 'Picked up {{name}} at position {{position}}',
    ariaDragStateSort: 'Moved {{name}} to position {{position}} of {{total}}',
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
