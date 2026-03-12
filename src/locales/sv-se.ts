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
    browse: {
        template: 'Välj {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'filer',
                    false: 'fil',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Släpp {{files}} här eller <u>bläddra</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'filer',
                    false: 'en fil',
                },
            },
        },
    },

    loadError: 'Det gick inte att ladda filen.',

    loadDataTranserProgress: 'Laddar filer',
    loadDataTranserInfo: '{{processedFiles}} av {{totalFiles}} filer behandlade',

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
    ariaNoEntries: {
        template: 'Inga {{files}} valda',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'filer',
                    false: 'fil',
                },
            },
        },
    },
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
    validationFileSizeUnderflow: 'Denna fil är för liten. Minimistorlek är {{minSize}}.',
    validationFileSizeOverflow: 'Denna fil är för stor. Maximal storlek är {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Total filstorlek är för liten. Minimikravet är {{minListSize}}.',
    validationListSizeOverflow: 'Total filstorlek är för stor. Maxgränsen är {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Det gick inte att läsa mediestorleken.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} har ogiltig bredd. Bredden måste vara mellan {{minWidth}} och {{maxWidth}} pixlar.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} är för liten. Minsta bredd är {{minWidth}} pixlar.',
    validationMediaWidthOverflow:
        '{{fileMainType}} är för stor. Största bredd är {{maxWidth}} pixlar.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} har ogiltig höjd. Höjden måste vara mellan {{minHeight}} och {{maxHeight}} pixlar.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} är för liten. Minsta höjd är {{minHeight}} pixlar.',
    validationMediaHeightOverflow:
        '{{fileMainType}} är för stor. Största höjd är {{maxHeight}} pixlar.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} har ogiltig upplösning. Den måste vara mellan {{minResolution}}MP och {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} har ogiltig upplösning. Minsta upplösning är {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        '{{fileMainType}} har ogiltig upplösning. Största upplösning är {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'För få filer. Minimikravet är {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'fil', else: 'filer' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'För många filer. Maxgränsen är {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'maxFiles',
                map: { 1: 'fil', else: 'filer' },
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
