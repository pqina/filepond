/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'বন্ধ করুন',
    remove: 'মুছে ফেলুন',
    reset: 'রিসেট',
    undo: 'পূর্বাবস্থায় ফেরত',
    cancel: 'বাতিল',
    store: 'সংরক্ষণ',
    revert: 'পুনরুদ্ধার',
    busy: 'ব্যস্ত',
    loading: 'লোড হচ্ছে',

    error: 'ত্রুটি',
    warning: 'সতর্কতা',
    success: 'সফল',
    info: 'তথ্য',
    system: 'সিস্টেম',

    fileMainTypeImage: 'ছবি',
    fileMainTypeVideo: 'ভিডিও',
    fileMainTypeAudio: 'অডিও',
    fileMainTypeApplication: 'ফাইল',

    assistAbort: 'বাতিল করতে ট্যাপ করুন',
    assistUndo: 'পূর্বাবস্থায় ফেরত যেতে ট্যাপ করুন',
    browse: {
        template: '{{files}} নির্বাচন করুন',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'ফাইলগুলো',
                    false: 'ফাইল',
                },
            },
        },
    },
    browseAndDrop: {
        template: '{{files}} এখানে ছেড়ে দিন, অথবা <u>ব্রাউজ</u> করুন',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'ফাইলগুলো',
                    false: 'একটি ফাইল',
                },
            },
        },
    },

    loadError: 'ফাইল লোড করা যায়নি।',

    loadDataTranserProgress: 'ফাইল লোড হচ্ছে',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} ফাইল প্রক্রিয়াকৃত',

    validationInvalid: 'অকার্যকর ফাইল।',
    validationFileNameMissing: 'ফাইলের নাম অনুপস্থিত',

    validationInvalidEntries: 'ফাইল তালিকায় অকার্যকর আইটেম রয়েছে।',
    validationInvalidState: 'ফাইল তালিকা অকার্যকর অবস্থায় রয়েছে।',
    validationInvalidBusy: 'ফাইল তালিকা ব্যস্ত।',
    validationInvalidEmpty: {
        template: 'অনুগ্রহ করে {{files}} নির্বাচন করুন।',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'একটি ফাইল',
                    true: 'এক বা একাধিক ফাইল',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'প্রয়োজনীয়',
    ariaNoEntries: {
        template: 'কোনো {{files}} নির্বাচিত নয়',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'ফাইল',
                    false: 'ফাইল',
                },
            },
        },
    },
    ariaSingleEntry: 'নির্বাচিত {{name}}',
    ariaMultipleEntries: '{{count}}টি ফাইল নির্বাচিত',
    ariaItemRoleDescription: 'সাজানো যায়',
    ariaDragDescription:
        'একটি আইটেম তুলতে এবং ফেলতে স্পেস চাপুন। নতুন অবস্থানে নিতে উপরের এবং নিচের তীর কী ব্যবহার করুন।',
    ariaDragStateDrop: '{{position}} অবস্থানে {{name}} ফেলা হয়েছে',
    ariaDragStateGrab: '{{position}} অবস্থান থেকে {{name}} তোলা হয়েছে',
    ariaDragStateSort: '{{total}} এর মধ্যে {{position}} অবস্থানে {{name}} সরানো হয়েছে',
};

export const media = {
    mediaEdit: 'সম্পাদনা',
    mediaPlay: 'প্লে',
    mediaPause: 'বিরতি',
    mediaSilent: 'নিঃশব্দ',
    mediaUnmute: 'শব্দ চালু',
    mediaMute: 'শব্দ বন্ধ',
    mediaFullscreen: 'পূর্ণস্ক্রীন',
    mediaLoadError: '{{fileMainType}} লোড করা যায়নি।',
    mediaPlayError: 'ভিডিও চালানো যায়নি।',
};

export const store = {
    storeRestoreProgress: '{{progress}}% লোড হচ্ছে',

    storeStorageQueued: 'আপলোডের জন্য অপেক্ষা',
    storeStorageProgress: 'আপলোড হচ্ছে {{progress}}%',
    storeStorageComplete: 'আপলোড সম্পূর্ণ',

    storeError: 'ফাইল সংরক্ষণ করা যায়নি।',

    storeAwaitingCompletion: 'সব ফাইল সংরক্ষণ করা হয়নি।',
};

export const transform = {
    transformEditBusy: 'ফাইল ডেটা সম্পাদনা হচ্ছে',
    transformError: 'ফাইল ডেটা সম্পাদনা করা যায়নি। আবার চেষ্টা করুন।',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'এই ফাইলের ধরন অনুমোদিত নয়। {{details}}।',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'ফাইলের ধরন অবশ্যই {{accept}} হতে হবে',
                    else: 'অনুমোদিত ধরন: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'এই ফাইল এক্সটেনশন অনুমোদিত নয়। {{details}}।',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'ফাইলের এক্সটেনশন অবশ্যই {{accept}} হতে হবে',
                    else: 'অনুমোদিত এক্সটেনশনগুলো: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'ফাইলের নাম অনুপস্থিত',
    validationFileNameMismatch: 'ফাইলের নাম অকার্যকর।',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'ফাইলটি খুব ছোট। সর্বনিম্ন {{minSize}}।',
    validationFileSizeOverflow: 'ফাইলটি খুব বড়। সর্বোচ্চ {{maxSize}}।',
};

export const validationListSize = {
    validationListSizeUnderflow: 'মোট ফাইল সাইজ খুব ছোট। সর্বনিম্ন {{minListSize}}।',
    validationListSizeOverflow: 'মোট ফাইল সাইজ খুব বড়। সর্বোচ্চ {{maxListSize}}।',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'মিডিয়ার আকার পড়া যায়নি।',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} এর প্রস্থ অকার্যকর। {{minWidth}} থেকে {{maxWidth}} পিক্সেলের মধ্যে হতে হবে।',

    validationMediaWidthUnderflow:
        '{{fileMainType}} খুব ছোট। সর্বনিম্ন প্রস্থ {{minWidth}} পিক্সেল।',
    validationMediaWidthOverflow: '{{fileMainType}} খুব বড়। সর্বোচ্চ প্রস্থ {{maxWidth}} পিক্সেল।',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} এর উচ্চতা অকার্যকর। {{minHeight}} থেকে {{maxHeight}} পিক্সেলের মধ্যে হতে হবে।',

    validationMediaHeightUnderflow:
        '{{fileMainType}} খুব ছোট। সর্বনিম্ন উচ্চতা {{minHeight}} পিক্সেল।',
    validationMediaHeightOverflow:
        '{{fileMainType}} খুব বড়। সর্বোচ্চ উচ্চতা {{maxHeight}} পিক্সেল।',

    validationMediaResolutionRangeMismatch:
        'রেজোলিউশন অকার্যকর। {{minResolution}}MP থেকে {{maxResolution}}MP এর মধ্যে হতে হবে।',

    validationMediaResolutionUnderflow: 'রেজোলিউশন খুব কম। সর্বনিম্ন {{minResolution}}MP।',
    validationMediaResolutionOverflow: 'রেজোলিউশন খুব বেশি। সর্বোচ্চ {{maxResolution}}MP।',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'তালিকায় খুব কম ফাইল। সর্বনিম্ন {{minFiles}} {{files}}।',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'ফাইল',
                    else: 'ফাইল',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'তালিকায় খুব বেশি ফাইল। সর্বোচ্চ {{maxFiles}} {{files}}।',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'ফাইল',
                    else: 'ফাইল',
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
