/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: '中止',
    remove: '删除',
    reset: '重置',
    undo: '撤销',
    cancel: '取消',
    store: '保存',
    revert: '还原',
    busy: '处理中',
    loading: '正在加载',

    error: '错误',
    warning: '警告',
    success: '完成',
    info: '信息',
    system: '系统',

    fileMainTypeImage: '图片',
    fileMainTypeVideo: '视频',
    fileMainTypeAudio: '音频',
    fileMainTypeApplication: '文件',

    assistAbort: '点击取消',
    assistUndo: '点击撤销',
    browse: {
        template: '选择{{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: '文件',
                    false: '文件',
                },
            },
        },
    },
    browseAndDrop: {
        template: '将{{files}}拖到此处，或<u>浏览</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: '文件',
                    false: '一个文件',
                },
            },
        },
    },

    loadError: '无法加载文件。',

    loadDataTranserProgress: '正在加载文件',
    loadDataTranserInfo: '已处理 {{processedFiles}} / {{totalFiles}} 个文件',

    validationInvalid: '文件无效。',
    validationFileNameMissing: '缺少文件名',

    validationInvalidEntries: '列表中包含无效项目。',
    validationInvalidState: '文件列表处于无效状态。',
    validationInvalidBusy: '文件列表正忙。',
    validationInvalidEmpty: {
        template: '请选择{{files}}。',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: '一个文件',
                    true: '一个或多个文件',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: '必填',
    ariaNoEntries: {
        template: '未选择{{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: '文件',
                    false: '文件',
                },
            },
        },
    },
    ariaSingleEntry: '已选择 {{name}}',
    ariaMultipleEntries: '已选择 {{count}} 个文件',
    ariaItemRoleDescription: '可排序',
    ariaDragDescription: '按空格键可拾取并放下一个项目。使用上下方向键将其移动到新位置。',
    ariaDragStateDrop: '已将 {{name}} 放到位置 {{position}}',
    ariaDragStateGrab: '已在位置 {{position}} 拾取 {{name}}',
    ariaDragStateSort: '已将 {{name}} 移动到第 {{position}} 位，共 {{total}} 项',
};

export const media = {
    mediaEdit: '编辑',
    mediaPlay: '播放',
    mediaPause: '暂停',
    mediaSilent: '无音频',
    mediaUnmute: '开启声音',
    mediaMute: '静音',
    mediaFullscreen: '全屏',
    mediaLoadError: '无法加载 {{fileMainType}}。',
    mediaPlayError: '无法播放视频。',
};

export const store = {
    storeRestoreProgress: '正在加载 {{progress}}%',

    storeStorageQueued: '等待上传',
    storeStorageProgress: '正在上传 {{progress}}%',
    storeStorageComplete: '上传完成',

    storeError: '无法保存文件。',
    storeAwaitingCompletion: '并非所有文件都已保存。',
};

export const transform = {
    transformEditBusy: '正在编辑文件',
    transformError: '无法编辑文件，请重试。',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: '不允许此文件类型。{{details}}。',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: '文件类型必须为 {{accept}}',
                    else: '允许的类型为：{{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: '不允许此文件扩展名。{{details}}。',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: '文件扩展名必须为 {{accept}}',
                    else: '允许的扩展名为：{{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: '缺少文件名',
    validationFileNameMismatch: '此文件名无效。',
};

export const validationFileSize = {
    validationFileSizeUnderflow: '文件太小。最小大小为 {{minSize}}。',
    validationFileSizeOverflow: '文件太大。最大大小为 {{maxSize}}。',
};

export const validationListSize = {
    validationListSizeUnderflow: '文件总大小太小。最小要求为 {{minListSize}}。',
    validationListSizeOverflow: '文件总大小太大。最大允许为 {{maxListSize}}。',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: '无法读取媒体尺寸。',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} 的宽度无效。宽度必须介于 {{minWidth}} 和 {{maxWidth}} 像素之间。',

    validationMediaWidthUnderflow: '{{fileMainType}} 太小。最小宽度为 {{minWidth}} 像素。',
    validationMediaWidthOverflow: '{{fileMainType}} 太大。最大宽度为 {{maxWidth}} 像素。',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} 的高度无效。高度必须介于 {{minHeight}} 和 {{maxHeight}} 像素之间。',

    validationMediaHeightUnderflow: '{{fileMainType}} 太小。最小高度为 {{minHeight}} 像素。',
    validationMediaHeightOverflow: '{{fileMainType}} 太大。最大高度为 {{maxHeight}} 像素。',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} 的分辨率无效。必须介于 {{minResolution}}MP 和 {{maxResolution}}MP 之间。',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} 的分辨率无效。最小分辨率为 {{minResolution}}MP。',

    validationMediaResolutionOverflow:
        '{{fileMainType}} 的分辨率无效。最大分辨率为 {{maxResolution}}MP。',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: '文件过少。至少需要 {{minFiles}} 个{{files}}。',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: '文件', else: '文件' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: '文件过多。最多允许 {{maxFiles}} 个{{files}}。',
        variables: {
            files: {
                context: 'maxFiles',
                map: { 1: '文件', else: '文件' },
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
