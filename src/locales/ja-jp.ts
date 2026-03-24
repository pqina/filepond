/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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

    // units
    unitB: {
        1: 'バイト',
        else: 'バイト',
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
        1: 'ピクセル',
        else: 'ピクセル',
    },
    unitFiles: {
        1: 'ファイル',
        else: 'ファイル',
    },

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
    // browse button labels
    browse: '{{maxFilesUnit}}を選択',
    browseAndDrop: 'ここに{{maxFilesUnit}}をドロップ、または<u>参照</u>',

    loadError: 'ファイルを読み込めませんでした。',

    loadDataTranserProgress: 'ファイルを読み込み中',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} 個のファイルを処理しました',

    validationInvalid: '無効なファイルです。',
    validationFileNameMissing: 'ファイル名がありません',

    validationInvalidEntries: 'リストに無効な項目があります。',
    validationInvalidState: 'ファイルリストが無効な状態です。',
    validationInvalidBusy: 'ファイルリストは使用中です。',
    validationInvalidEmpty: {
        template: '{{files}}を選択してください。',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'ファイル',
                    true: '1つ以上のファイル',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: '必須',
    ariaNoEntries: '{{maxFilesUnit}}が選択されていません',
    ariaSingleEntry: '{{name}} を選択しました',
    ariaMultipleEntries: '{{count}} 個のファイルを選択しました',
    ariaItemRoleDescription: '並べ替え可能',
    ariaDragDescription:
        '項目を持ち上げてドロップするにはスペースキーを押します。上下の矢印キーで新しい位置に移動します。',
    ariaDragStateDrop: '位置 {{position}} に {{name}} をドロップしました',
    ariaDragStateGrab: '位置 {{position}} で {{name}} を持ち上げました',
    ariaDragStateSort: '{{name}} を {{total}} 個中 {{position}} 番目に移動しました',
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
    validationFileSizeUnderflow: 'このファイルは小さすぎます。最小サイズは {{minSize}} {{minSizeUnit}} です。',
    validationFileSizeOverflow: 'このファイルは大きすぎます。最大サイズは {{maxSize}} {{maxSizeUnit}} です。',
};

export const validationListSize = {
    validationListSizeUnderflow: 'ファイルの合計サイズが小さすぎます。最小合計サイズは {{minSize}} {{minSizeUnit}} です。',
    validationListSizeOverflow: 'ファイルの合計サイズが大きすぎます。最大合計サイズは {{maxSize}} {{maxSizeUnit}} です。',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'メディアサイズを読み取れませんでした。',

    validationMediaWidthRangeMismatch: '{{fileMainType}} の幅が無効です。幅は {{minWidth}} 〜 {{maxWidth}} {{maxWidthUnit}} である必要があります。',

    validationMediaWidthUnderflow: '{{fileMainType}} が小さすぎます。最小幅は {{minWidth}} {{minWidthUnit}} です。',
    validationMediaWidthOverflow: '{{fileMainType}} が大きすぎます。最大幅は {{maxWidth}} {{maxWidthUnit}} です。',

    validationMediaHeightRangeMismatch: '{{fileMainType}} の高さが無効です。高さは {{minHeight}} 〜 {{maxHeight}} {{maxHeightUnit}} である必要があります。',

    validationMediaHeightUnderflow: '{{fileMainType}} が小さすぎます。最小高さは {{minHeight}} {{minHeightUnit}} です。',
    validationMediaHeightOverflow: '{{fileMainType}} が大きすぎます。最大高さは {{maxHeight}} {{maxHeightUnit}} です。',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}} の解像度が無効です。解像度は {{minResolution}}MP 〜 {{maxResolution}}MP の範囲である必要があります。',

    validationMediaResolutionUnderflow:
        '{{fileMainType}} の解像度が無効です。最小解像度は {{minResolution}}MP です。',

    validationMediaResolutionOverflow:
        '{{fileMainType}} の解像度が無効です。最大解像度は {{maxResolution}}MP です。',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'リスト内のファイル数が少なすぎます。最小数は {{minFiles}} {{minFilesUnit}} です。',
    validationListEntryCountOverflow:
        'リスト内のファイル数が多すぎます。最大数は {{maxFiles}} {{maxFilesUnit}} です。',
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
