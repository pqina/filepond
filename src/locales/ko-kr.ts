export const core = {
    abort: '중단',
    remove: '제거',
    reset: '초기화',
    undo: '실행 취소',
    cancel: '취소',
    store: '저장',
    revert: '되돌리기',
    busy: '처리 중',
    loading: '불러오는 중',

    error: '오류',
    warning: '경고',
    success: '완료',
    info: '정보',
    system: '시스템',

    fileMainTypeImage: '이미지',
    fileMainTypeVideo: '비디오',
    fileMainTypeAudio: '오디오',
    fileMainTypeApplication: '파일',

    assistAbort: '탭하여 취소',
    assistUndo: '탭하여 실행 취소',

    browseAndDrop: '파일을 여기에 놓거나 <u>찾아보기</u>',

    loadError: '파일을 불러올 수 없습니다.',

    loadDataTranserProgress: '파일을 불러오는 중',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} 파일 처리됨',

    validationInvalid: '유효하지 않은 파일입니다.',
    validationFileNameMissing: '파일 이름이 없습니다',

    validationInvalidEntries: '목록에 유효하지 않은 항목이 있습니다.',
    validationInvalidState: '파일 목록 상태가 유효하지 않습니다.',
    validationInvalidBusy: '파일 목록이 사용 중입니다.',
    validationInvalidEmpty: '이 필드를 입력해 주세요.',

    // screenreader accessibility
    ariaRequired: 'required',
    ariaNoEntries: {
        template: 'No {{files}} selected',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'files',
                    false: 'file',
                },
            },
        },
    },
    ariaSingleEntry: 'Selected {{name}}',
    ariaMultipleEntries: '{{count}} files selected',
    ariaItemRoleDescription: 'Sortable',
    ariaDragDescription:
        'Press space to pick up and drop this item. Use the up and down arrow keys to move it to a new position.',
    ariaDragStateDrop: 'Dropped {{name}} at position {{position}}',
    ariaDragStateGrab: 'Picked up {{name}} at position {{position}}',
    ariaDragStateSort: 'Moved {{name}} to position {{position}} of {{total}}',
};

export const media = {
    mediaEdit: '편집',
    mediaPlay: '재생',
    mediaPause: '일시 정지',
    mediaSilent: '소리 없음',
    mediaUnmute: '소리 켜기',
    mediaMute: '음소거',
    mediaFullscreen: '전체 화면',
    mediaLoadError: '{{fileMainType}}를 불러올 수 없습니다.',
    mediaPlayError: '비디오를 재생할 수 없습니다.',
};

export const store = {
    storeRestoreProgress: '{{progress}}% 불러오는 중',

    storeStorageQueued: '업로드 대기 중',
    storeStorageProgress: '{{progress}}% 업로드 중',
    storeStorageComplete: '업로드 완료',

    storeError: '파일을 저장할 수 없습니다.',
    storeAwaitingCompletion: '모든 파일이 아직 저장되지 않았습니다.',
};

export const transform = {
    transformEditBusy: '파일 편집 중',
    transformError: '파일을 편집할 수 없습니다. 다시 시도해 주세요.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: '이 파일 형식은 허용되지 않습니다. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: '파일 형식은 {{accept}}이어야 합니다',
                    else: '허용되는 형식: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: '이 파일 확장자는 허용되지 않습니다. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: '파일은 {{accept}} 확장자여야 합니다',
                    else: '허용되는 확장자: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: '파일 이름이 없습니다',
    validationFileNameMismatch: '이 파일 이름은 유효하지 않습니다.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: '파일 크기가 너무 작습니다. 최소 크기는 {{minSize}}입니다.',
    validationFileSizeOverflow: '파일 크기가 너무 큽니다. 최대 크기는 {{maxSize}}입니다.',
};

export const validationListSize = {
    validationListSizeUnderflow: '전체 파일 크기가 너무 작습니다. 최소값은 {{minListSize}}입니다.',
    validationListSizeOverflow: '전체 파일 크기가 너무 큽니다. 최대값은 {{maxListSize}}입니다.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: '미디어 크기를 읽을 수 없습니다.',

    validationMediaWidthRangeMismatch:
        '{{fileMainType}}의 너비가 잘못되었습니다. 너비는 {{minWidth}}에서 {{maxWidth}} 픽셀 사이여야 합니다.',

    validationMediaWidthUnderflow:
        '{{fileMainType}}가 너무 작습니다. 최소 너비는 {{minWidth}} 픽셀입니다.',
    validationMediaWidthOverflow:
        '{{fileMainType}}가 너무 큽니다. 최대 너비는 {{maxWidth}} 픽셀입니다.',

    validationMediaHeightRangeMismatch:
        '{{fileMainType}}의 높이가 잘못되었습니다. 높이는 {{minHeight}}에서 {{maxHeight}} 픽셀 사이여야 합니다.',

    validationMediaHeightUnderflow:
        '{{fileMainType}}가 너무 작습니다. 최소 높이는 {{minHeight}} 픽셀입니다.',
    validationMediaHeightOverflow:
        '{{fileMainType}}가 너무 큽니다. 최대 높이는 {{maxHeight}} 픽셀입니다.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}}의 해상도가 잘못되었습니다. 해상도는 {{minResolution}}MP에서 {{maxResolution}}MP 사이여야 합니다.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}}의 해상도가 잘못되었습니다. 최소 해상도는 {{minResolution}}MP입니다.',

    validationMediaResolutionOverflow:
        '{{fileMainType}}의 해상도가 잘못되었습니다. 최대 해상도는 {{maxResolution}}MP입니다.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: '파일이 너무 적습니다. 최소 {{minFiles}} {{files}}가 필요합니다.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: '파일', else: '파일' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: '파일이 너무 많습니다. 최대 {{maxFiles}} {{files}}까지 허용됩니다.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: '파일', else: '파일' },
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
