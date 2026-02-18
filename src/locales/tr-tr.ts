export const core = {
    abort: 'Durdur',
    remove: 'Kaldır',
    reset: 'Sıfırla',
    undo: 'Geri al',
    cancel: 'İptal',
    store: 'Kaydet',
    revert: 'Geri yükle',
    busy: 'Meşgul',
    loading: 'Yükleniyor',

    error: 'Hata',
    warning: 'Uyarı',
    success: 'Başarılı',
    info: 'Bilgi',
    system: 'Sistem',

    fileMainTypeImage: 'görüntü',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'ses',
    fileMainTypeApplication: 'dosya',

    assistAbort: 'İptal etmek için dokun',
    assistUndo: 'Geri almak için dokun',

    browseAndDrop: 'Dosyaları buraya bırakın veya <u>göz atın</u>',

    loadError: 'Dosya yüklenemedi.',

    loadDataTranserProgress: 'Dosyalar yükleniyor',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} dosya işlendi',

    validationInvalid: 'Geçersiz dosya.',
    validationFileNameMissing: 'Dosya adı eksik',

    validationInvalidEntries: 'Dosya listesinde geçersiz öğeler var.',
    validationInvalidState: 'Dosya listesi geçersiz durumda.',
    validationInvalidBusy: 'Dosya listesi meşgul.',
    validationInvalidEmpty: 'Lütfen bu alanı doldurun.',

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
    mediaEdit: 'Düzenle',
    mediaPlay: 'Oynat',
    mediaPause: 'Duraklat',
    mediaSilent: 'Ses yok',
    mediaUnmute: 'Sesi aç',
    mediaMute: 'Sesi kapat',
    mediaFullscreen: 'Tam ekran',
    mediaLoadError: '{{fileMainType}} yüklenemedi.',
    mediaPlayError: 'Video oynatılamadı.',
};

export const store = {
    storeRestoreProgress: '{{progress}}% yükleniyor',

    storeStorageQueued: 'Yükleme bekleniyor',
    storeStorageProgress: '%{{progress}} yükleniyor',
    storeStorageComplete: 'Yükleme tamamlandı',

    storeError: 'Dosya kaydedilemedi.',

    storeAwaitingCompletion: 'Tüm dosyalar kaydedilmedi.',
};

export const transform = {
    transformEditBusy: 'Dosya verisi düzenleniyor',
    transformError: 'Dosya verisi düzenlenemedi. Lütfen tekrar deneyin.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Bu dosya türüne izin verilmiyor. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Dosya türü {{accept}} olmalıdır',
                    else: 'İzin verilen türler: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Bu dosya uzantısına izin verilmiyor. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Dosya uzantısı {{accept}} olmalıdır',
                    else: 'İzin verilen uzantılar: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Dosya adı eksik',
    validationFileNameMismatch: 'Dosya adı geçersiz.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Bu dosya çok küçük. Minimum boyut {{minSize}}.',
    validationFileSizeOverflow: 'Bu dosya çok büyük. Maksimum boyut {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Toplam dosya boyutu çok küçük. Minimum {{minListSize}}.',
    validationListSizeOverflow: 'Toplam dosya boyutu çok büyük. Maksimum {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Ortam boyutu okunamadı.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} genişliği geçersiz. {{minWidth}} - {{maxWidth}} piksel olmalıdır.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} çok küçük. Minimum genişlik {{minWidth}} piksel.',
    validationMediaWidthOverflow:
        '{{fileMainType}} çok büyük. Maksimum genişlik {{maxWidth}} piksel.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} yüksekliği geçersiz. {{minHeight}} - {{maxHeight}} piksel olmalıdır.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} çok küçük. Minimum yükseklik {{minHeight}} piksel.',
    validationMediaHeightOverflow:
        '{{fileMainType}} çok büyük. Maksimum yükseklik {{maxHeight}} piksel.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} çözünürlüğü geçersiz. {{minResolution}}MP - {{maxResolution}}MP aralığında olmalıdır.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} çözünürlüğü çok düşük. Minimum {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        '{{fileMainType}} çözünürlüğü çok yüksek. Maksimum {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Listedeki dosya sayısı çok az. Minimum {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'dosya',
                    else: 'dosya',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Listedeki dosya sayısı çok fazla. Maksimum {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'dosya',
                    else: 'dosya',
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
