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

    // units
    unitB: {
        1: 'tavu',
        else: 'tavua',
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
        1: 'pikseli',
        else: 'pikseliä',
    },
    unitFiles: {
        1: 'tiedosto',
        else: 'tiedostoa',
    },

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
    // browse button labels
    browse: 'Valitse {{maxFilesUnit}}',
    browseAndDrop: 'Pudota {{maxFilesUnit}} tähän tai <u>selaa</u>',

    loadError: 'Tiedostoa ei voitu ladata.',

    loadDataTransferProgress: 'Ladataan tiedostoja',
    loadDataTransferInfo: 'Käsitelty {{processedFiles}} / {{totalFiles}} tiedostoa',

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
    ariaNoEntries: '{{maxFilesUnit}} ei ole valittu',
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
    storeRestoreError: 'Tiedostoa ei voitu ladata.',
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
    validationFileSizeUnderflow:
        'Tämä tiedosto on liian pieni. Vähimmäiskoko on {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Tämä tiedosto on liian suuri. Enimmäiskoko on {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Tiedostojen kokonaiskoko on liian pieni. Vähimmäiskokonaiskoko on {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Tiedostojen kokonaiskoko on liian suuri. Enimmäiskokonaiskoko on {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Mediakokoa ei voitu lukea.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}}n leveys ei kelpaa. Leveyden on oltava välillä {{minWidth}} ja {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} on liian pieni. Vähimmäisleveys on {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} on liian suuri. Enimmäisleveys on {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}}n korkeus ei kelpaa. Korkeuden on oltava välillä {{minHeight}} ja {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} on liian pieni. Vähimmäiskorkeus on {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        '{{fileMainType}} on liian suuri. Enimmäiskorkeus on {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Tarkkuus on virheellinen. Sen tulee olla {{minResolution}}–{{maxResolution}} MP.',

    validationMediaResolutionUnderflow: 'Tarkkuus on liian pieni. Vähintään {{minResolution}} MP.',
    validationMediaResolutionOverflow: 'Tarkkuus on liian suuri. Enintään {{maxResolution}} MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Luettelossa on liian vähän tiedostoja. Vähimmäismäärä on {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Luettelossa on liikaa tiedostoja. Enimmäismäärä on {{maxFiles}} {{maxFilesUnit}}.',
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
