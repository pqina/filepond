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
    browse: {
        template: 'Вибрати {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'файли',
                    false: 'файл',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Перетягніть сюди {{files}} або <u>перегляньте</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'файли',
                    false: 'файл',
                },
            },
        },
    },

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
    ariaNoEntries: {
        template: 'Не вибрано {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'файлів',
                    false: 'файл',
                },
            },
        },
    },
    ariaSingleEntry: 'Вибрано {{name}}',
    ariaMultipleEntries: 'Вибрано {{count}} файлів',
    ariaItemRoleDescription: 'Можна сортувати',
    ariaDragDescription:
        'Натисніть пробіл, щоб підхопити й відпустити цей елемент. Використовуйте стрілки вгору та вниз, щоб перемістити його на нову позицію.',
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
    validationFileSizeUnderflow: 'Файл надто малий. Мінімум {{minSize}}.',
    validationFileSizeOverflow: 'Файл надто великий. Максимум {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Загальний розмір файлів надто малий. Мінімум {{minListSize}}.',
    validationListSizeOverflow: 'Загальний розмір файлів надто великий. Максимум {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Не вдалося прочитати розмір медіа.',

    validationMediaWidthRangeMismatch:
        'Ширина {{fileMainType}} недійсна. Має бути від {{minWidth}} до {{maxWidth}} пікселів.',

    validationMediaWidthUnderflow:
        '{{fileMainType}} надто малий. Мінімальна ширина {{minWidth}} пікселів.',
    validationMediaWidthOverflow:
        '{{fileMainType}} надто великий. Максимальна ширина {{maxWidth}} пікселів.',

    validationMediaHeightRangeMismatch:
        'Висота {{fileMainType}} недійсна. Має бути від {{minHeight}} до {{maxHeight}} пікселів.',

    validationMediaHeightUnderflow:
        '{{fileMainType}} надто малий. Мінімальна висота {{minHeight}} пікселів.',
    validationMediaHeightOverflow:
        '{{fileMainType}} надто великий. Максимальна висота {{maxHeight}} пікселів.',

    validationMediaResolutionRangeMismatch:
        'Недійсна роздільна здатність. Має бути від {{minResolution}}MP до {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Роздільна здатність надто низька. Мінімум {{minResolution}}MP.',
    validationMediaResolutionOverflow:
        'Роздільна здатність надто висока. Максимум {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'У списку надто мало файлів. Мінімум {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'файл',
                    else: 'файлів',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'У списку надто багато файлів. Максимум {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'файл',
                    else: 'файлів',
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
