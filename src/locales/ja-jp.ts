export const core = {
    abort: '中止',
    remove: '削除',
    reset: 'リセット',
    undo: '元に戻す',
    cancel: 'キャンセル',
    store: '保存',
    revert: '戻す',
    busy: '処理中',
    loading: '読み込み中',

    error: 'エラー',
    warning: '警告',
    success: '完了',
    info: '情報',
    system: 'システム',

    fileMainTypeImage: '画像',
    fileMainTypeVideo: '動画',
    fileMainTypeAudio: '音声',
    fileMainTypeApplication: 'ファイル',

    assistAbort: 'タップして中止',
    assistUndo: 'タップして元に戻す',

    loadError: 'ファイルを読み込めませんでした。',

    loadDataTranserProgress: 'ファイルを読み込み中',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} 個のファイルを処理しました',

    validationInvalid: '無効なファイルです。',
    validationFileNameMissing: 'ファイル名がありません',

    validationInvalidEntries: 'リストに無効な項目があります。',
    validationInvalidState: 'ファイルリストが無効な状態です。',
    validationInvalidBusy: 'ファイルリストは使用中です。',
    validationInvalidEmpty: 'このフィールドを入力してください。',
};

export const media = {
    mediaEdit: '編集',
    mediaPlay: '再生',
    mediaPause: '一時停止',
    mediaSilent: '音声なし',
    mediaUnmute: 'ミュート解除',
    mediaMute: 'ミュート',
    mediaFullscreen: '全画面表示',
    mediaLoadError: '{{fileMainType}}を読み込めませんでした。',
    mediaPlayError: '動画を再生できません。',
};

export const store = {
    storeRestoreProgress: '{{progress}}% を読み込み中',

    storeStorageQueued: 'アップロード待機中',
    storeStorageProgress: '{{progress}}% アップロード中',
    storeStorageComplete: 'アップロード完了',

    storeError: 'ファイルを保存できませんでした。',
    storeAwaitingCompletion: 'すべてのファイルはまだ保存されていません。',
};

export const transform = {
    transformEditBusy: 'ファイル編集中',
    transformError: 'ファイルを編集できませんでした。もう一度お試しください。',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'このファイル形式は許可されていません。{{details}}。',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'ファイル形式は {{accept}} である必要があります',
                    else: '許可されている形式: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'このファイル拡張子は許可されていません。{{details}}。',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'ファイル拡張子は {{accept}} である必要があります',
                    else: '許可されている拡張子: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'ファイル名がありません',
    validationFileNameMismatch: 'このファイル名は無効です。',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'このファイルは小さすぎます。最小サイズは {{minSize}} です。',
    validationFileSizeOverflow: 'このファイルは大きすぎます。最大サイズは {{maxSize}} です。',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'ファイルの合計サイズが小さすぎます。最小値は {minListSize} です。',
    validationListSizeOverflow: 'ファイルの合計サイズが大きすぎます。最大値は {maxListSize} です。',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'メディアサイズを読み取れませんでした。',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}} の幅が無効です。{{minWidth}} から {{maxWidth}} の間である必要があります。',
    validationMediaWidthUnderflow:
        '{{fileMainType}} の幅が小さすぎます。最小幅は {{minWidth}} です。',
    validationMediaWidthOverflow:
        '{{fileMainType}} の幅が大きすぎます。最大幅は {{maxWidth}} です。',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}} の高さが無効です。{{minHeight}} から {{maxHeight}} の間である必要があります。',
    validationMediaHeightUnderflow:
        '{{fileMainType}} の高さが低すぎます。最小高さは {{minHeight}} です。',
    validationMediaHeightOverflow:
        '{{fileMainType}} の高さが高すぎます。最大高さは {{maxHeight}} です。',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} の解像度が無効です。{{minResolution}} から {maxResolution} の間である必要があります。',
    validationMediaResolutionUnderflow:
        '{{fileMainType}} の解像度が無効です。最小解像度は {{minResolution}} です。',
    validationMediaResolutionOverflow:
        '{{fileMainType}} の解像度が無効です。最大解像度は {{maxResolution}} です。',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'ファイル数が少なすぎます。最低 {{minFiles}} {{files}} が必要です。',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'ファイル', else: 'ファイル' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'ファイル数が多すぎます。最大 {{maxFiles}} {{files}} までです。',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'ファイル', else: 'ファイル' },
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
