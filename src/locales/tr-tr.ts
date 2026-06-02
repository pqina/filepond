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

    // units
    unitB: {
        1: 'bayt',
        else: 'bayt',
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
        1: 'piksel',
        else: 'piksel',
    },
    unitFiles: {
        1: 'dosya',
        else: 'dosyalar',
    },

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
    // browse button labels
    browse: '{{maxFilesUnit}} seç',
    browseAndDrop: '{{maxFilesUnit}} buraya bırakın veya <u>göz atın</u>',

    loadError: 'Dosya yüklenemedi.',

    loadDataTransferProgress: 'Dosyalar yükleniyor',
    loadDataTransferInfo: '{{processedFiles}} / {{totalFiles}} dosya işlendi',

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
    ariaNoEntries: 'Seçili {{maxFilesUnit}} yok',
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
    storeRestoreError: 'Dosya yüklenemedi.',
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
    validationFileSizeUnderflow: 'Bu dosya çok küçük. Minimum boyut {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow: 'Bu dosya çok büyük. Maksimum boyut {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Toplam dosya boyutu çok küçük. Minimum toplam boyut {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Toplam dosya boyutu çok büyük. Maksimum toplam boyut {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Ortam boyutu okunamadı.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} genişliği geçersiz. Genişlik {{minWidth}} ile {{maxWidth}} {{maxWidthUnit}} arasında olmalıdır.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} çok küçük. Minimum genişlik {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} çok büyük. Maksimum genişlik {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} yüksekliği geçersiz. Yükseklik {{minHeight}} ile {{maxHeight}} {{maxHeightUnit}} arasında olmalıdır.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} çok küçük. Minimum yükseklik {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        '{{fileMainType}} çok büyük. Maksimum yükseklik {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} çözünürlüğü geçersiz. {{minResolution}}MP - {{maxResolution}}MP aralığında olmalıdır.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} çözünürlüğü çok düşük. Minimum {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        '{{fileMainType}} çözünürlüğü çok yüksek. Maksimum {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Listede çok az dosya var. Minimum {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Listede çok fazla dosya var. Maksimum {{maxFiles}} {{maxFilesUnit}}.',
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
