/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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

    // units
    unitB: {
        1: 'बाइट',
        else: 'बाइट',
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
        1: 'पिक्सेल',
        else: 'पिक्सेल',
    },
    unitFiles: {
        1: 'फ़ाइल',
        else: 'फ़ाइलें',
    },

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
    // browse button labels
    browse: '{{maxFilesUnit}} चुनें',
    browseAndDrop: '{{maxFilesUnit}} यहां छोड़ें, या <u>ब्राउज़</u> करें',

    loadError: 'फ़ाइल लोड नहीं हो सकी।',

    loadDataTransferProgress: 'फ़ाइलें लोड हो रही हैं',
    loadDataTransferInfo: '{{processedFiles}} / {{totalFiles}} फ़ाइलें प्रोसेस हुईं',

    validationInvalid: 'अमान्य फ़ाइल।',
    validationFileNameMissing: 'फ़ाइल नाम गायब है',

    validationInvalidEntries: 'सूची में अमान्य आइटम हैं।',
    validationInvalidState: 'फ़ाइल सूची अमान्य स्थिति में है।',
    validationInvalidBusy: 'फ़ाइल सूची व्यस्त है।',
    validationInvalidEmpty: {
        template: 'कृपया {{files}} चुनें।',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'एक फ़ाइल',
                    true: 'एक या अधिक फ़ाइलें',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'आवश्यक',
    ariaNoEntries: 'कोई {{maxFilesUnit}} चयनित नहीं है',
    ariaSingleEntry: 'चयनित {{name}}',
    ariaMultipleEntries: '{{count}} फाइलें चयनित',
    ariaItemRoleDescription: 'क्रमबद्ध करने योग्य',
    ariaDragDescription:
        'किसी आइटम को उठाने और छोड़ने के लिए स्पेस दबाएं। इसे नई स्थिति में ले जाने के लिए ऊपर और नीचे तीर कुंजियों का उपयोग करें।',
    ariaDragStateDrop: '{{name}} को {{position}} स्थान पर छोड़ा गया',
    ariaDragStateGrab: '{{name}} को {{position}} स्थान से उठाया गया',
    ariaDragStateSort: '{{name}} को {{total}} में से {{position}} स्थान पर ले जाया गया',
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
    storeRestoreError: 'फ़ाइल लोड नहीं हो सकी।',
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
    validationFileSizeUnderflow:
        'यह फ़ाइल बहुत छोटी है। न्यूनतम आकार {{minSize}} {{minSizeUnit}} है।',
    validationFileSizeOverflow:
        'यह फ़ाइल बहुत बड़ी है। अधिकतम आकार {{maxSize}} {{maxSizeUnit}} है।',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'फ़ाइलों का कुल आकार बहुत छोटा है। न्यूनतम कुल आकार {{minSize}} {{minSizeUnit}} है।',
    validationListSizeOverflow:
        'फ़ाइलों का कुल आकार बहुत बड़ा है। अधिकतम कुल आकार {{maxSize}} {{maxSizeUnit}} है।',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'मीडिया का आकार पढ़ा नहीं जा सका।',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} की चौड़ाई अमान्य है। चौड़ाई {{minWidth}} और {{maxWidth}} {{maxWidthUnit}} के बीच होनी चाहिए।',

    validationMediaWidthUnderflow:
        '{{fileMainType}} बहुत छोटा है। न्यूनतम चौड़ाई {{minWidth}} {{minWidthUnit}} है।',
    validationMediaWidthOverflow:
        '{{fileMainType}} बहुत बड़ा है। अधिकतम चौड़ाई {{maxWidth}} {{maxWidthUnit}} है।',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} की ऊंचाई अमान्य है। ऊंचाई {{minHeight}} और {{maxHeight}} {{maxHeightUnit}} के बीच होनी चाहिए।',

    validationMediaHeightUnderflow:
        '{{fileMainType}} बहुत छोटा है। न्यूनतम ऊंचाई {{minHeight}} {{minHeightUnit}} है।',
    validationMediaHeightOverflow:
        '{{fileMainType}} बहुत बड़ा है। अधिकतम ऊंचाई {{maxHeight}} {{maxHeightUnit}} है।',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} का रिज़ॉल्यूशन मान्य नहीं है। रिज़ॉल्यूशन {{minResolution}}MP और {{maxResolution}}MP के बीच होना चाहिए।',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} का रिज़ॉल्यूशन मान्य नहीं है। न्यूनतम रिज़ॉल्यूशन {{minResolution}}MP है।',

    validationMediaResolutionOverflow:
        '{{fileMainType}} का रिज़ॉल्यूशन मान्य नहीं है। अधिकतम रिज़ॉल्यूशन {{maxResolution}}MP है।',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'सूची में फ़ाइलें बहुत कम हैं। न्यूनतम {{minFiles}} {{minFilesUnit}} है।',
    validationListEntryCountOverflow:
        'सूची में फ़ाइलें बहुत अधिक हैं। अधिकतम {{maxFiles}} {{maxFilesUnit}} है।',
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
