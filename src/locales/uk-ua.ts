/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Скасувати',
    remove: 'Видалити',
    reset: 'Скинути',
    undo: 'Повернути',
    cancel: 'Скасувати',
    store: 'Зберегти',
    revert: 'Відновити',
    busy: 'Зайнято',
    loading: 'Завантаження',

    // units
    unitB: {
        1: 'байт',
        else: 'байти',
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
        1: 'піксель',
        else: 'пікселі',
    },
    unitFiles: {
        1: 'файл',
        else: 'файли',
    },

    error: 'Помилка',
    warning: 'Попередження',
    success: 'Успіх',
    info: 'Інформація',
    system: 'Система',

    fileMainTypeImage: 'зображення',
    fileMainTypeVideo: 'відео',
    fileMainTypeAudio: 'аудіо',
    fileMainTypeApplication: 'файл',

    assistAbort: 'Натисніть, щоб скасувати',
    assistUndo: 'Натисніть, щоб повернути',
    // browse button labels
    browse: 'Вибрати {{maxFilesUnit}}',
    browseAndDrop: 'Перетягніть сюди {{maxFilesUnit}} або <u>перегляньте</u>',

    loadError: 'Не вдалося завантажити файл.',

    loadDataTranserProgress: 'Завантаження файлів',
    loadDataTranserInfo: 'Оброблено {{processedFiles}} із {{totalFiles}} файлів',

    validationInvalid: 'Недійсний файл.',
    validationFileNameMissing: 'Відсутня назва файлу',

    validationInvalidEntries: 'Список файлів містить недійсні елементи.',
    validationInvalidState: 'Список файлів у недійсному стані.',
    validationInvalidBusy: 'Список файлів зайнятий.',
    validationInvalidEmpty: {
        template: 'Виберіть {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'файл',
                    true: 'один або кілька файлів',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'обовязково',
    ariaNoEntries: 'Не вибрано {{maxFilesUnit}}',
    ariaSingleEntry: 'Вибрано {{name}}',
    ariaMultipleEntries: 'Вибрано {{count}} файлів',
    ariaItemRoleDescription: 'Можна сортувати',
    ariaDragDescription:
        'Натисніть пробіл, щоб підхопити й відпустити елемент. Використовуйте стрілки вгору та вниз, щоб перемістити його на нову позицію.',
    ariaDragStateDrop: '{{name}} відпущено на позиції {{position}}',
    ariaDragStateGrab: '{{name}} підхоплено на позиції {{position}}',
    ariaDragStateSort: '{{name}} переміщено на позицію {{position}} з {{total}}',
};

export const media = {
    mediaEdit: 'Редагувати',
    mediaPlay: 'Відтворити',
    mediaPause: 'Пауза',
    mediaSilent: 'Без звуку',
    mediaUnmute: 'Увімкнути звук',
    mediaMute: 'Вимкнути звук',
    mediaFullscreen: 'На весь екран',
    mediaLoadError: 'Не вдалося завантажити {{fileMainType}}.',
    mediaPlayError: 'Не вдалося відтворити відео.',
};

export const store = {
    storeRestoreProgress: 'Завантаження {{progress}}%',

    storeStorageQueued: 'Очікування завантаження',
    storeStorageProgress: 'Завантаження {{progress}}%',
    storeStorageComplete: 'Завантаження завершено',

    storeError: 'Не вдалося зберегти файл.',

    storeAwaitingCompletion: 'Не всі файли збережено.',
};

export const transform = {
    transformEditBusy: 'Редагування даних файлу',
    transformError: 'Не вдалося відредагувати дані файлу. Спробуйте ще раз.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Цей тип файлу не дозволено. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Файл повинен бути типу {{accept}}',
                    else: 'Дозволені типи: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Це розширення файлу не дозволено. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Файл повинен мати розширення {{accept}}',
                    else: 'Дозволені розширення: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Відсутня назва файлу',
    validationFileNameMismatch: 'Недійсна назва файлу.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Цей файл замалий. Мінімальний розмір: {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow: 'Цей файл завеликий. Максимальний розмір: {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Загальний розмір файлів замалий. Мінімальний загальний розмір: {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow: 'Загальний розмір файлів завеликий. Максимальний загальний розмір: {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Не вдалося прочитати розмір медіа.',

    validationMediaWidthRangeMismatch: 'Ширина {{fileMainType}} недійсна. Ширина має бути від {{minWidth}} до {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow: '{{fileMainType}} замалий. Мінімальна ширина: {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow: '{{fileMainType}} завеликий. Максимальна ширина: {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch: 'Висота {{fileMainType}} недійсна. Висота має бути від {{minHeight}} до {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow: '{{fileMainType}} замалий. Мінімальна висота: {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow: '{{fileMainType}} завеликий. Максимальна висота: {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Недійсна роздільна здатність. Має бути від {{minResolution}}MP до {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Роздільна здатність надто низька. Мінімум {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        'Роздільна здатність надто висока. Максимум {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'У списку замало файлів. Мінімум: {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'У списку забагато файлів. Максимум: {{maxFiles}} {{maxFilesUnit}}.',
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
