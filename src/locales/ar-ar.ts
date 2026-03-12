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
    browse: {
        template: 'اختر {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'ملفات',
                    false: 'ملفًا',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'أسقط {{files}} هنا، أو <u>تصفح</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'الملفات',
                    false: 'ملفًا',
                },
            },
        },
    },

    loadError: 'تعذر تحميل الملف.',

    loadDataTranserProgress: 'جارٍ تحميل الملفات',
    loadDataTranserInfo: 'تمت معالجة {{processedFiles}} من {{totalFiles}} ملفات',

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
    ariaNoEntries: {
        template: 'لم يتم تحديد {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'ملفات',
                    false: 'ملف',
                },
            },
        },
    },
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
    validationFileSizeUnderflow: 'الملف صغير جدًا. الحد الأدنى هو {{minSize}}.',
    validationFileSizeOverflow: 'الملف كبير جدًا. الحد الأقصى هو {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'إجمالي حجم الملفات صغير جدًا. الحد الأدنى هو {{minListSize}}.',
    validationListSizeOverflow: 'إجمالي حجم الملفات كبير جدًا. الحد الأقصى هو {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'تعذر قراءة حجم الوسائط.',

    validationMediaWidthRangeMismatch:
        'عرض {{fileMainType}} غير صالح. يجب أن يكون بين {{minWidth}} و {{maxWidth}} بكسل.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} صغير جدًا. الحد الأدنى للعرض هو {{minWidth}} بكسل.',
    validationMediaWidthOverflow:
        '{{fileMainType}} كبير جدًا. الحد الأقصى للعرض هو {{maxWidth}} بكسل.',

    validationMediaHeightRangeMismatch:
        'ارتفاع {{fileMainType}} غير صالح. يجب أن يكون بين {{minHeight}} و {{maxHeight}} بكسل.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} صغير جدًا. الحد الأدنى للارتفاع هو {{minHeight}} بكسل.',
    validationMediaHeightOverflow:
        '{{fileMainType}} كبير جدًا. الحد الأقصى للارتفاع هو {{maxHeight}} بكسل.',

    validationMediaResolutionRangeMismatch:
        'دقة {{fileMainType}} غير صالحة. يجب أن تكون بين {{minResolution}}MP و {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'دقة {{fileMainType}} غير صالحة. الحد الأدنى للدقة هو {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'دقة {{fileMainType}} غير صالحة. الحد الأقصى للدقة هو {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'عدد الملفات قليل جدًا. الحد الأدنى هو {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'ملف',
                    else: 'ملفات',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'عدد الملفات كبير جدًا. الحد الأقصى هو {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'maxFiles',
                map: {
                    1: 'ملف',
                    else: 'ملفات',
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
