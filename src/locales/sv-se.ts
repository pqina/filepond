/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Avbryt',
    remove: 'Ta bort',
    reset: 'Återställ',
    undo: 'Ångra',
    cancel: 'Avbryt',
    store: 'Spara',
    revert: 'Återgå',
    busy: 'Upptagen',
    loading: 'Laddar',

    // units
    unitB: {
        1: 'byte',
        else: 'byte',
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
        1: 'pixel',
        else: 'pixlar',
    },
    unitFiles: {
        1: 'fil',
        else: 'filer',
    },

    error: 'Fel',
    warning: 'Varning',
    success: 'Klart',
    info: 'Info',
    system: 'System',

    fileMainTypeImage: 'bild',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'ljud',
    fileMainTypeApplication: 'fil',

    assistAbort: 'Tryck för att avbryta',
    assistUndo: 'Tryck för att ångra',
    // browse button labels
    browse: 'Välj {{maxFilesUnit}}',
    browseAndDrop: 'Släpp {{maxFilesUnit}} här eller <u>bläddra</u>',

    loadError: 'Det gick inte att ladda filen.',

    loadDataTransferProgress: 'Laddar filer',
    loadDataTransferInfo: '{{processedFiles}} av {{totalFiles}} filer behandlade',

    validationInvalid: 'Ogiltig fil.',
    validationFileNameMissing: 'Filnamn saknas',

    validationInvalidEntries: 'Listan innehåller ogiltiga objekt.',
    validationInvalidState: 'Fillistan är i ett ogiltigt tillstånd.',
    validationInvalidBusy: 'Fillistan är upptagen.',
    validationInvalidEmpty: {
        template: 'Välj {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'en fil',
                    true: 'en eller flera filer',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'obligatoriskt',
    ariaNoEntries: 'Inga {{maxFilesUnit}} valda',
    ariaSingleEntry: 'Vald {{name}}',
    ariaMultipleEntries: '{{count}} filer valda',
    ariaItemRoleDescription: 'Sorterbar',
    ariaDragDescription:
        'Tryck på mellanslag för att plocka upp och släppa ett objekt. Använd upp- och nedpilarna för att flytta det till en ny position.',
    ariaDragStateDrop: 'Släppte {{name}} på position {{position}}',
    ariaDragStateGrab: 'Plockade upp {{name}} på position {{position}}',
    ariaDragStateSort: 'Flyttade {{name}} till position {{position}} av {{total}}',
};

export const media = {
    mediaEdit: 'Redigera',
    mediaPlay: 'Spela upp',
    mediaPause: 'Pausa',
    mediaSilent: 'Inget ljud',
    mediaUnmute: 'Slå på ljud',
    mediaMute: 'Stäng av ljud',
    mediaFullscreen: 'Helskärm',
    mediaLoadError: 'Det gick inte att ladda {{fileMainType}}.',
    mediaPlayError: 'Det går inte att spela upp videon.',
};

export const store = {
    storeRestoreError: 'Det gick inte att ladda filen.',
    storeRestoreProgress: 'Laddar {{progress}}%',

    storeStorageQueued: 'Väntar på uppladdning',
    storeStorageProgress: 'Laddar upp {{progress}}%',
    storeStorageComplete: 'Uppladdning klar',

    storeError: 'Det gick inte att spara filen.',
    storeAwaitingCompletion: 'Alla filer är inte sparade ännu.',
};

export const transform = {
    transformEditBusy: 'Redigerar fil',
    transformError: 'Det gick inte att redigera filen. Försök igen.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Denna filtyp är inte tillåten. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Filen måste vara av typen {{accept}}',
                    else: 'Tillåtna typer är: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Denna filändelse är inte tillåten. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Filen måste ha filändelsen {{accept}}',
                    else: 'Tillåtna filändelser är: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Filnamn saknas',
    validationFileNameMismatch: 'Detta filnamn är ogiltigt.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Den här filen är för liten. Minsta storlek är {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Den här filen är för stor. Största storlek är {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Den totala filstorleken är för liten. Minsta totala storlek är {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Den totala filstorleken är för stor. Största totala storlek är {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Det gick inte att läsa mediestorleken.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}}-bredden är ogiltig. Bredden måste vara mellan {{minWidth}} och {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} är för liten. Minsta bredd är {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} är för stor. Största bredd är {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}}-höjden är ogiltig. Höjden måste vara mellan {{minHeight}} och {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} är för liten. Minsta höjd är {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        '{{fileMainType}} är för stor. Största höjd är {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} har ogiltig upplösning. Den måste vara mellan {{minResolution}}MP och {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} har ogiltig upplösning. Minsta upplösning är {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        '{{fileMainType}} har ogiltig upplösning. Största upplösning är {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'För få filer i listan. Minsta antal är {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'För många filer i listan. Högsta antal är {{maxFiles}} {{maxFilesUnit}}.',
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
