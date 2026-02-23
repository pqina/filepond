/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Keskeytä',
    remove: 'Poista',
    reset: 'Nollaa',
    undo: 'Kumoa',
    cancel: 'Peruuta',
    store: 'Tallenna',
    revert: 'Palauta',
    busy: 'Varattu',
    loading: 'Ladataan',

    error: 'Virhe',
    warning: 'Varoitus',
    success: 'Onnistui',
    info: 'Info',
    system: 'Järjestelmä',

    fileMainTypeImage: 'kuva',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'ääni',
    fileMainTypeApplication: 'tiedosto',

    assistAbort: 'Napauta peruuttaaksesi',
    assistUndo: 'Napauta kumotaksesi',
    browse: {
        template: 'Valitse {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'tiedostot',
                    false: 'tiedosto',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Pudota {{files}} tähän tai <u>selaa</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'tiedostot',
                    false: 'tiedosto',
                },
            },
        },
    },

    loadError: 'Tiedostoa ei voitu ladata.',

    loadDataTranserProgress: 'Ladataan tiedostoja',
    loadDataTranserInfo: 'Käsitelty {{processedFiles}} / {{totalFiles}} tiedostoa',

    validationInvalid: 'Virheellinen tiedosto.',
    validationFileNameMissing: 'Tiedoston nimi puuttuu',

    validationInvalidEntries: 'Tiedostolistassa on virheellisiä kohteita.',
    validationInvalidState: 'Tiedostolista on virheellisessä tilassa.',
    validationInvalidBusy: 'Tiedostolista on varattu.',
    validationInvalidEmpty: {
        template: 'Valitse {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'tiedosto',
                    true: 'yksi tai useampi tiedosto',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'pakollinen',
    ariaNoEntries: {
        template: 'Yhtään {{files}} ei ole valittu',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'tiedostoa',
                    false: 'tiedostoa',
                },
            },
        },
    },
    ariaSingleEntry: 'Valittu {{name}}',
    ariaMultipleEntries: '{{count}} tiedostoa valittu',
    ariaItemRoleDescription: 'Lajiteltava',
    ariaDragDescription:
        'Nosta ja pudota kohde painamalla välilyöntiä. Siirrä sitä uuteen sijaintiin ylä- ja alanuolinäppäimillä.',
    ariaDragStateDrop: '{{name}} pudotettu sijaintiin {{position}}',
    ariaDragStateGrab: '{{name}} nostettu sijainnista {{position}}',
    ariaDragStateSort: '{{name}} siirretty sijaintiin {{position}} / {{total}}',
};

export const media = {
    mediaEdit: 'Muokkaa',
    mediaPlay: 'Toista',
    mediaPause: 'Tauko',
    mediaSilent: 'Ei ääntä',
    mediaUnmute: 'Ääni päälle',
    mediaMute: 'Ääni pois',
    mediaFullscreen: 'Koko näyttö',
    mediaLoadError: 'Tiedostoa {{fileMainType}} ei voitu ladata.',
    mediaPlayError: 'Videota ei voitu toistaa.',
};

export const store = {
    storeRestoreProgress: 'Ladataan {{progress}}%',

    storeStorageQueued: 'Odottaa latausta',
    storeStorageProgress: 'Lähetetään {{progress}}%',
    storeStorageComplete: 'Lähetys valmis',

    storeError: 'Tiedostoa ei voitu tallentaa.',

    storeAwaitingCompletion: 'Kaikkia tiedostoja ei ole tallennettu.',
};

export const transform = {
    transformEditBusy: 'Muokataan tiedoston tietoja',
    transformError: 'Tietoja ei voitu muokata. Yritä uudelleen.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Tämä tiedostotyyppi ei ole sallittu. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Tiedoston on oltava tyyppiä {{accept}}',
                    else: 'Sallitut tyypit: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Tämä tiedostopääte ei ole sallittu. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Tiedostolla on oltava pääte {{accept}}',
                    else: 'Sallitut päätteet: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Tiedoston nimi puuttuu',
    validationFileNameMismatch: 'Virheellinen tiedostonimi.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Tiedosto on liian pieni. Vähintään {{minSize}}.',
    validationFileSizeOverflow: 'Tiedosto on liian suuri. Enintään {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Kokonaiskoko on liian pieni. Vähintään {{minListSize}}.',
    validationListSizeOverflow: 'Kokonaiskoko on liian suuri. Enintään {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Mediakokoa ei voitu lukea.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} leveys on virheellinen. Sen tulee olla {{minWidth}}–{{maxWidth}} pikseliä.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} on liian pieni. Minimileveys {{minWidth}} pikseliä.',
    validationMediaWidthOverflow:
        '{{fileMainType}} on liian suuri. Maksimileveys {{maxWidth}} pikseliä.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} korkeus on virheellinen. Sen tulee olla {{minHeight}}–{{maxHeight}} pikseliä.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} on liian pieni. Minimipituus {{minHeight}} pikseliä.',
    validationMediaHeightOverflow:
        '{{fileMainType}} on liian suuri. Maksimipituus {{maxHeight}} pikseliä.',

    validationMediaResolutionRangeMismatch:
        'Tarkkuus on virheellinen. Sen tulee olla {{minResolution}}–{{maxResolution}} MP.',

    validationMediaResolutionUnderflow: 'Tarkkuus on liian pieni. Vähintään {{minResolution}} MP.',
    validationMediaResolutionOverflow: 'Tarkkuus on liian suuri. Enintään {{maxResolution}} MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Liian vähän tiedostoja. Vähintään {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'tiedosto',
                    else: 'tiedostoa',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Liikaa tiedostoja. Enintään {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'tiedosto',
                    else: 'tiedostoa',
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
