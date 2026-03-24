/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Hætta við',
    remove: 'Fjarlægja',
    reset: 'Endurstilla',
    undo: 'Afturkalla',
    cancel: 'Hætta við',
    store: 'Vista',
    revert: 'Endurheimta',
    busy: 'Upptekið',
    loading: 'Hleð inn',

    // units
    unitB: {
        1: 'bæti',
        else: 'bæti',
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
        1: 'pixill',
        else: 'pixlar',
    },
    unitFiles: {
        1: 'skrá',
        else: 'skrár',
    },

    error: 'Villa',
    warning: 'Aðvörun',
    success: 'Tókst',
    info: 'Upplýsingar',
    system: 'Kerfi',

    fileMainTypeImage: 'mynd',
    fileMainTypeVideo: 'myndband',
    fileMainTypeAudio: 'hljóð',
    fileMainTypeApplication: 'skrá',

    assistAbort: 'Ýttu til að hætta við',
    assistUndo: 'Ýttu til að afturkalla',
    // browse button labels
    browse: 'Velja {{maxFilesUnit}}',
    browseAndDrop: 'Slepptu {{maxFilesUnit}} hér eða <u>flettu</u>',

    loadError: 'Tókst ekki að hlaða skránni.',

    loadDataTranserProgress: 'Hleð inn skrám',
    loadDataTranserInfo: 'Unnið {{processedFiles}} af {{totalFiles}} skrám',

    validationInvalid: 'Ógild skrá.',
    validationFileNameMissing: 'Skráarheiti vantar',

    validationInvalidEntries: 'Skráalistinn inniheldur ógilda hluti.',
    validationInvalidState: 'Skráalistinn er í ógildu ástandi.',
    validationInvalidBusy: 'Skráalistinn er upptekinn.',
    validationInvalidEmpty: {
        template: 'Vinsamlegast veldu {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'eina skrá',
                    true: 'eina eða fleiri skrár',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'nauðsynlegt',
    ariaNoEntries: 'Engar {{maxFilesUnit}} valdar',
    ariaSingleEntry: 'Valið {{name}}',
    ariaMultipleEntries: '{{count}} skrár valdar',
    ariaItemRoleDescription: 'Raðanlegt',
    ariaDragDescription:
        'Ýttu á bilslá til að taka upp og sleppa atriði. Notaðu örvar upp og niður til að færa það í nýja stöðu.',
    ariaDragStateDrop: '{{name}} sleppt á stöðu {{position}}',
    ariaDragStateGrab: '{{name}} tekið upp á stöðu {{position}}',
    ariaDragStateSort: '{{name}} fært í stöðu {{position}} af {{total}}',
};

export const media = {
    mediaEdit: 'Breyta',
    mediaPlay: 'Spila',
    mediaPause: 'Pása',
    mediaSilent: 'Enginn hljóð',
    mediaUnmute: 'Kveikja á hljóði',
    mediaMute: 'Þagga niður',
    mediaFullscreen: 'Fylla skjá',
    mediaLoadError: 'Tókst ekki að hlaða {{fileMainType}}.',
    mediaPlayError: 'Tókst ekki að spila myndband.',
};

export const store = {
    storeRestoreProgress: 'Hleð {{progress}}%',

    storeStorageQueued: 'Bíð eftir upphali',
    storeStorageProgress: 'Upphala {{progress}}%',
    storeStorageComplete: 'Upphali lokið',

    storeError: 'Tókst ekki að vista skrá.',

    storeAwaitingCompletion: 'Ekki allar skrár hafa verið vistaðar.',
};

export const transform = {
    transformEditBusy: 'Skráargögnum er breytt',
    transformError: 'Tókst ekki að breyta gögnum. Reyndu aftur.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Þessi skráategund er ekki leyfð. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Skráin verður að vera af gerðinni {{accept}}',
                    else: 'Leyfðar gerðir: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Þessi skráarending er ekki leyfð. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Skráin þarf að hafa endinguna {{accept}}',
                    else: 'Leyfðar endingar: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Skráarheiti vantar',
    validationFileNameMismatch: 'Ógilt skráarheiti.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Þessi skrá er of lítil. Lágmarksstærð er {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow: 'Þessi skrá er of stór. Hámarksstærð er {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Heildarstærð skráa er of lítil. Lágmarksheildarstærð er {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow: 'Heildarstærð skráa er of stór. Hámarksheildarstærð er {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Tókst ekki að lesa fjölmiðlastærð.',

    validationMediaWidthRangeMismatch: 'Breidd {{fileMainType}} er ógild. Breidd þarf að vera á milli {{minWidth}} og {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow: '{{fileMainType}} er of lítil. Lágmarksbreidd er {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow: '{{fileMainType}} er of stór. Hámarksbreidd er {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch: 'Hæð {{fileMainType}} er ógild. Hæð þarf að vera á milli {{minHeight}} og {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow: '{{fileMainType}} er of lítil. Lágmarkshæð er {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow: '{{fileMainType}} er of stór. Hámarkshæð er {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Upplausn er ógild. Hún þarf að vera á milli {{minResolution}}MP og {{maxResolution}}MP.',

    validationMediaResolutionUnderflow: 'Upplausn er of lág. Lágmark {{minResolution}}MP.',
    validationMediaResolutionOverflow: 'Upplausn er of há. Hámark {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Of fáar skrár á listanum. Lágmark er {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Of margar skrár á listanum. Hámark er {{maxFiles}} {{maxFilesUnit}}.',
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
