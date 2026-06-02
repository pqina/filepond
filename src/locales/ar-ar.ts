/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'إيقاف',
    remove: 'إزالة',
    reset: 'إعادة تعيين',
    undo: 'تراجع',
    cancel: 'إلغاء',
    store: 'حفظ',
    revert: 'استرجاع',
    busy: 'مشغول',
    loading: 'جارٍ التحميل',

    // units
    unitB: {
        1: 'بايت',
        else: 'بايت',
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
        1: 'بكسل',
        else: 'بكسل',
    },
    unitFiles: {
        1: 'ملف',
        else: 'ملفات',
    },

    error: 'خطأ',
    warning: 'تحذير',
    success: 'نجاح',
    info: 'معلومات',
    system: 'النظام',

    fileMainTypeImage: 'صورة',
    fileMainTypeVideo: 'فيديو',
    fileMainTypeAudio: 'صوت',
    fileMainTypeApplication: 'ملف',

    assistAbort: 'اضغط للإلغاء',
    assistUndo: 'اضغط للتراجع',
    // browse button labels
    browse: 'اختر {{maxFilesUnit}}',
    browseAndDrop: 'أسقط {{maxFilesUnit}} هنا، أو <u>تصفح</u>',

    loadError: 'تعذر تحميل الملف.',

    loadDataTransferProgress: 'جارٍ تحميل الملفات',
    loadDataTransferInfo: 'تمت معالجة {{processedFiles}} من {{totalFiles}} ملفات',

    validationInvalid: 'ملف غير صالح.',
    validationFileNameMissing: 'اسم الملف مفقود',

    validationInvalidEntries: 'تحتوي قائمة الملفات على عناصر غير صالحة.',
    validationInvalidState: 'قائمة الملفات في حالة غير صالحة.',
    validationInvalidBusy: 'قائمة الملفات مشغولة.',
    validationInvalidEmpty: {
        template: 'يرجى تحديد {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'ملفًا',
                    true: 'ملفًا واحدًا أو أكثر',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'مطلوب',
    ariaNoEntries: 'لم يتم تحديد {{maxFilesUnit}}',
    ariaSingleEntry: 'تم تحديد {{name}}',
    ariaMultipleEntries: 'تم تحديد {{count}} ملفات',
    ariaItemRoleDescription: 'قابل للترتيب',
    ariaDragDescription:
        'اضغط مفتاح المسافة لالتقاط عنصر وإفلاته. استخدم مفتاحي السهم للأعلى والأسفل لنقله إلى موضع جديد.',
    ariaDragStateDrop: 'تم إسقاط {{name}} في الموضع {{position}}',
    ariaDragStateGrab: 'تم التقاط {{name}} في الموضع {{position}}',
    ariaDragStateSort: 'تم نقل {{name}} إلى الموضع {{position}} من {{total}}',
};

export const media = {
    mediaEdit: 'تحرير',
    mediaPlay: 'تشغيل',
    mediaPause: 'إيقاف مؤقت',
    mediaSilent: 'بدون صوت',
    mediaUnmute: 'تشغيل الصوت',
    mediaMute: 'كتم الصوت',
    mediaFullscreen: 'ملء الشاشة',
    mediaLoadError: 'تعذر تحميل {{fileMainType}}.',
    mediaPlayError: 'تعذر تشغيل الفيديو.',
};

export const store = {
    storeRestoreError: 'تعذر تحميل الملف.',
    storeRestoreProgress: 'جارٍ التحميل {{progress}}%',

    storeStorageQueued: 'في انتظار الرفع',
    storeStorageProgress: 'جارٍ الرفع {{progress}}%',
    storeStorageComplete: 'اكتمل الرفع',

    storeError: 'تعذر حفظ الملف.',

    storeAwaitingCompletion: 'لم يتم حفظ جميع الملفات.',
};

export const transform = {
    transformEditBusy: 'جارٍ تحرير بيانات الملف',
    transformError: 'تعذر تحرير بيانات الملف. حاول مرة أخرى.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'نوع الملف غير مسموح. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'يجب أن يكون الملف من النوع {{accept}}',
                    else: 'الأنواع المسموح بها: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'امتداد الملف غير مسموح. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'يجب أن يكون للملف الامتداد {{accept}}',
                    else: 'الامتدادات المسموح بها: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'اسم الملف مفقود',
    validationFileNameMismatch: 'اسم الملف غير صالح.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'الملف صغير جدًا. الحد الأدنى للحجم هو {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'الملف كبير جدًا. الحد الأقصى للحجم هو {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'إجمالي حجم الملفات صغير جدًا. الحد الأدنى للإجمالي هو {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'إجمالي حجم الملفات كبير جدًا. الحد الأقصى للإجمالي هو {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'تعذر قراءة حجم الوسائط.',
    validationMediaWidthRangeMismatch:
        'عرض {{fileMainType}} غير صالح. يجب أن يكون العرض بين {{minWidth}} و{{maxWidth}} {{maxWidthUnit}}.',
    validationMediaWidthUnderflow:
        '{{fileMainType}} صغير جدًا. الحد الأدنى للعرض هو {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        '{{fileMainType}} كبير جدًا. الحد الأقصى للعرض هو {{maxWidth}} {{maxWidthUnit}}.',
    validationMediaHeightRangeMismatch:
        'ارتفاع {{fileMainType}} غير صالح. يجب أن يكون الارتفاع بين {{minHeight}} و{{maxHeight}} {{maxHeightUnit}}.',
    validationMediaHeightUnderflow:
        '{{fileMainType}} صغير جدًا. الحد الأدنى للارتفاع هو {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        '{{fileMainType}} كبير جدًا. الحد الأقصى للارتفاع هو {{maxHeight}} {{maxHeightUnit}}.',
    validationMediaResolutionRangeMismatch:
        'دقة {{fileMainType}} غير صالحة. يجب أن تكون بين {{minResolution}}MP و {{maxResolution}}MP.',
    validationMediaResolutionUnderflow:
        'دقة {{fileMainType}} غير صالحة. الحد الأدنى للدقة هو {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        'دقة {{fileMainType}} غير صالحة. الحد الأقصى للدقة هو {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'عدد الملفات في القائمة قليل جدًا. الحد الأدنى هو {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'عدد الملفات في القائمة كبير جدًا. الحد الأقصى هو {{maxFiles}} {{maxFilesUnit}}.',
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
