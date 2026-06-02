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

    // units
    unitB: {
        1: 'bájt',
        else: 'bájt',
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
        1: 'képpont',
        else: 'képpont',
    },
    unitFiles: {
        1: 'fájl',
        else: 'fájlok',
    },

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
    // browse button labels
    browse: '{{maxFilesUnit}} kiválasztása',
    browseAndDrop: 'Dobja ide: {{maxFilesUnit}}, vagy <u>böngésszen</u>',

    loadError: 'A fájl betöltése nem sikerült.',

    loadDataTransferProgress: 'Fájlok betöltése',
    loadDataTransferInfo: '{{processedFiles}} / {{totalFiles}} fájl feldolgozva',

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
    ariaNoEntries: 'Nincs kiválasztva {{maxFilesUnit}}',
    ariaSingleEntry: 'Kiválasztva: {{name}}',
    ariaMultipleEntries: '{{count}} fájl kiválasztva',
    ariaItemRoleDescription: 'Rendezhető',
    ariaDragDescription:
        'A szóköz megnyomásával felvehet és letehet egy elemet. Az új pozícióba mozgatáshoz használja a fel és le nyílbillentyűket.',
    ariaDragStateDrop: 'A(z) {{name}} lerakva a(z) {{position}}. pozícióban',
    ariaDragStateGrab: 'A(z) {{name}} felvéve a(z) {{position}}. pozícióban',
    ariaDragStateSort:
        'A(z) {{name}} áthelyezve a(z) {{position}}. pozícióba, összesen {{total}} közül',
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
    storeRestoreError: 'A fájl betöltése nem sikerült.',
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
    validationFileSizeUnderflow:
        'Ez a fájl túl kicsi. A minimális méret {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Ez a fájl túl nagy. A maximális méret {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'A fájlok teljes mérete túl kicsi. A minimális összméret {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'A fájlok teljes mérete túl nagy. A maximális összméret {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'A média mérete nem olvasható.',

    validationMediaWidthRangeMismatch:
        'A(z) {{fileMainType}} szélessége érvénytelen. A szélességnek {{minWidth}} és {{maxWidth}} {{maxWidthUnit}} között kell lennie.',

    validationMediaWidthUnderflow:
        'A(z) {{fileMainType}} túl kicsi. A minimális szélesség {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'A(z) {{fileMainType}} túl nagy. A maximális szélesség {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'A(z) {{fileMainType}} magassága érvénytelen. A magasságnak {{minHeight}} és {{maxHeight}} {{maxHeightUnit}} között kell lennie.',

    validationMediaHeightUnderflow:
        'A(z) {{fileMainType}} túl kicsi. A minimális magasság {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'A(z) {{fileMainType}} túl nagy. A maximális magasság {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'A felbontás érvénytelen. {{minResolution}}–{{maxResolution}} MP között kell lennie.',

    validationMediaResolutionUnderflow: 'A felbontás túl alacsony. Minimum: {{minResolution}} MP.',
    validationMediaResolutionOverflow: 'A felbontás túl magas. Maximum: {{maxResolution}} MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Túl kevés fájl van a listában. A minimum {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Túl sok fájl van a listában. A maximum {{maxFiles}} {{maxFilesUnit}}.',
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
