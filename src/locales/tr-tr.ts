/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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
    browse: {
        template: '{{files}} seçin',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'dosyalar',
                    false: 'dosya',
                },
            },
        },
    },
    browseAndDrop: {
        template: '{{files}} buraya bırakın veya <u>göz atın</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'dosyaları',
                    false: 'bir dosya',
                },
            },
        },
    },

    loadError: 'Dosya yüklenemedi.',

    loadDataTranserProgress: 'Dosyalar yükleniyor',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} dosya işlendi',

    validationInvalid: 'Geçersiz dosya.',
    validationFileNameMissing: 'Dosya adı eksik',

    validationInvalidEntries: 'Dosya listesinde geçersiz öğeler var.',
    validationInvalidState: 'Dosya listesi geçersiz durumda.',
    validationInvalidBusy: 'Dosya listesi meşgul.',
    validationInvalidEmpty: {
        template: 'Lütfen {{files}} seçin.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'bir dosya',
                    true: 'bir veya daha fazla dosya',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'gerekli',
    ariaNoEntries: {
        template: 'Hiç {{files}} seçilmedi',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'dosya',
                    false: 'dosya',
                },
            },
        },
    },
    ariaSingleEntry: 'Seçilen {{name}}',
    ariaMultipleEntries: '{{count}} dosya seçildi',
    ariaItemRoleDescription: 'Sıralanabilir',
    ariaDragDescription:
        'Bir öğeyi almak ve bırakmak için boşluk tuşuna basın. Yeni bir konuma taşımak için yukarı ve aşağı ok tuşlarını kullanın.',
    ariaDragStateDrop: '{{name}} {{position}} konumuna bırakıldı',
    ariaDragStateGrab: '{{name}} {{position}} konumunda alındı',
    ariaDragStateSort: '{{name}}, {{total}} içinde {{position}} konumuna taşındı',
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
