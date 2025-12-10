export const core = {
    abort: 'रद्द करें',
    remove: 'हटाएं',
    reset: 'रीसेट करें',
    undo: 'पूर्ववत करें',
    cancel: 'रद्द करें',
    store: 'सहेजें',
    revert: 'वापस लें',
    busy: 'प्रक्रिया में',
    loading: 'लोड हो रहा है',

    error: 'त्रुटि',
    warning: 'चेतावनी',
    success: 'सफल',
    info: 'जानकारी',
    system: 'सिस्टम',

    fileMainTypeImage: 'छवि',
    fileMainTypeVideo: 'वीडियो',
    fileMainTypeAudio: 'ऑडियो',
    fileMainTypeApplication: 'फ़ाइल',

    assistAbort: 'रद्द करने के लिए टैप करें',
    assistUndo: 'पूर्ववत करने के लिए टैप करें',

    loadError: 'फ़ाइल लोड नहीं हो सकी।',

    loadDataTranserProgress: 'फ़ाइलें लोड हो रही हैं',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} फ़ाइलें प्रोसेस हुईं',

    validationInvalid: 'अमान्य फ़ाइल।',
    validationFileNameMissing: 'फ़ाइल नाम गायब है',

    validationInvalidEntries: 'सूची में अमान्य आइटम हैं।',
    validationInvalidState: 'फ़ाइल सूची अमान्य स्थिति में है।',
    validationInvalidBusy: 'फ़ाइल सूची व्यस्त है।',
    validationInvalidEmpty: 'यह फ़ील्ड भरें।',
};

export const media = {
    mediaEdit: 'संपादित करें',
    mediaPlay: 'चलाएं',
    mediaPause: 'रोकें',
    mediaSilent: 'कोई ऑडियो नहीं',
    mediaUnmute: 'आवाज़ चालू करें',
    mediaMute: 'म्यूट करें',
    mediaFullscreen: 'पूर्ण स्क्रीन',
    mediaLoadError: '{{fileMainType}} लोड नहीं हो सकी।',
    mediaPlayError: 'वीडियो चलाया नहीं जा सका।',
};

export const store = {
    storeRestoreProgress: '{{progress}}% लोड हो रहा है',

    storeStorageQueued: 'अपलोड की प्रतीक्षा में',
    storeStorageProgress: '{{progress}}% अपलोड हो रहा है',
    storeStorageComplete: 'अपलोड पूरा हुआ',

    storeError: 'फ़ाइल सहेजी नहीं जा सकी।',
    storeAwaitingCompletion: 'सभी फ़ाइलें अभी तक सहेजी नहीं गई हैं।',
};

export const transform = {
    transformEditBusy: 'फ़ाइल संपादन जारी है',
    transformError: 'फ़ाइल संपादित नहीं हो सकी। कृपया पुनः प्रयास करें।',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'यह फ़ाइल प्रकार अनुमति नहीं है। {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'फ़ाइल का प्रकार {{accept}} होना चाहिए',
                    else: 'अनुमत प्रकार: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'यह फ़ाइल एक्सटेंशन अनुमति नहीं है। {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'फ़ाइल में {{accept}} एक्सटेंशन होना चाहिए',
                    else: 'अनुमत एक्सटेंशन: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'फ़ाइल नाम गायब है',
    validationFileNameMismatch: 'यह फ़ाइल नाम अमान्य है।',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'यह फ़ाइल बहुत छोटी है। न्यूनतम आकार {{minSize}} है।',
    validationFileSizeOverflow: 'यह फ़ाइल बहुत बड़ी है। अधिकतम आकार {{maxSize}} है।',
};

export const validationListSize = {
    validationListSizeUnderflow: 'कुल फ़ाइल आकार बहुत कम है। न्यूनतम आवश्यक {{minListSize}} है।',
    validationListSizeOverflow: 'कुल फ़ाइल आकार बहुत अधिक है। अधिकतम अनुमत {{maxListSize}} है।',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'मीडिया का आकार पढ़ा नहीं जा सका।',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} की चौड़ाई मान्य नहीं है। चौड़ाई {{minWidth}} और {{maxWidth}} पिक्सल के बीच होनी चाहिए।',

    validationMediaWidthUnderflow:
        '{{fileMainType}} बहुत छोटा है। न्यूनतम चौड़ाई {{minWidth}} पिक्सल है।',
    validationMediaWidthOverflow:
        '{{fileMainType}} बहुत बड़ा है। अधिकतम चौड़ाई {{maxWidth}} पिक्सल है।',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} की ऊंचाई मान्य नहीं है। ऊंचाई {{minHeight}} और {{maxHeight}} पिक्सल के बीच होनी चाहिए।',

    validationMediaHeightUnderflow:
        '{{fileMainType}} बहुत छोटा है। न्यूनतम ऊंचाई {{minHeight}} पिक्सल है।',
    validationMediaHeightOverflow:
        '{{fileMainType}} बहुत बड़ा है। अधिकतम ऊंचाई {{maxHeight}} पिक्सल है।',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} का रिज़ॉल्यूशन मान्य नहीं है। रिज़ॉल्यूशन {{minResolution}}MP और {{maxResolution}}MP के बीच होना चाहिए।',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} का रिज़ॉल्यूशन मान्य नहीं है। न्यूनतम रिज़ॉल्यूशन {{minResolution}}MP है।',

    validationMediaResolutionOverflow:
        '{{fileMainType}} का रिज़ॉल्यूशन मान्य नहीं है। अधिकतम रिज़ॉल्यूशन {{maxResolution}}MP है।',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'फ़ाइलें बहुत कम हैं। न्यूनतम {{minFiles}} {{files}} आवश्यक हैं।',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'फ़ाइल', else: 'फ़ाइलें' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'बहुत अधिक फ़ाइलें। अधिकतम {{maxFiles}} {{files}} अनुमत हैं।',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'फ़ाइल', else: 'फ़ाइलें' },
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
