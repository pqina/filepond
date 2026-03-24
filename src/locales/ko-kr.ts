/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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

    // units
    unitB: {
        1: '바이트',
        else: '바이트',
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
        1: '픽셀',
        else: '픽셀',
    },
    unitFiles: {
        1: '파일',
        else: '파일',
    },

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
    // browse button labels
    browse: '{{maxFilesUnit}} 선택',
    browseAndDrop: '{{maxFilesUnit}}을(를) 여기에 놓거나 <u>찾아보기</u>',

    loadError: '파일을 불러올 수 없습니다.',

    loadDataTranserProgress: '파일을 불러오는 중',
    loadDataTranserInfo: '{{processedFiles}} / {{totalFiles}} 파일 처리됨',

    validationInvalid: '유효하지 않은 파일입니다.',
    validationFileNameMissing: '파일 이름이 없습니다',

    validationInvalidEntries: '목록에 유효하지 않은 항목이 있습니다.',
    validationInvalidState: '파일 목록 상태가 유효하지 않습니다.',
    validationInvalidBusy: '파일 목록이 사용 중입니다.',
    validationInvalidEmpty: {
        template: '{{files}}을(를) 선택해 주세요.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: '파일',
                    true: '하나 이상의 파일',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: '필수',
    ariaNoEntries: '선택된 {{maxFilesUnit}}이(가) 없습니다',
    ariaSingleEntry: '{{name}} 선택됨',
    ariaMultipleEntries: '{{count}}개 파일 선택됨',
    ariaItemRoleDescription: '정렬 가능',
    ariaDragDescription:
        '항목을 집어서 놓으려면 스페이스 키를 누르세요. 위쪽 및 아래쪽 화살표 키로 새 위치로 이동할 수 있습니다.',
    ariaDragStateDrop: '{{name}}을(를) {{position}} 위치에 놓았습니다',
    ariaDragStateGrab: '{{name}}을(를) {{position}} 위치에서 집었습니다',
    ariaDragStateSort: '{{name}}을(를) {{total}}개 중 {{position}} 위치로 이동했습니다',
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
    validationFileSizeUnderflow: '이 파일은 너무 작습니다. 최소 크기는 {{minSize}} {{minSizeUnit}}입니다.',
    validationFileSizeOverflow: '이 파일은 너무 큽니다. 최대 크기는 {{maxSize}} {{maxSizeUnit}}입니다.',
};

export const validationListSize = {
    validationListSizeUnderflow: '전체 파일 크기가 너무 작습니다. 최소 총 크기는 {{minSize}} {{minSizeUnit}}입니다.',
    validationListSizeOverflow: '전체 파일 크기가 너무 큽니다. 최대 총 크기는 {{maxSize}} {{maxSizeUnit}}입니다.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: '미디어 크기를 읽을 수 없습니다.',

    validationMediaWidthRangeMismatch: '{{fileMainType}} 너비가 올바르지 않습니다. 너비는 {{minWidth}}에서 {{maxWidth}} {{maxWidthUnit}} 사이여야 합니다.',

    validationMediaWidthUnderflow: '{{fileMainType}}이(가) 너무 작습니다. 최소 너비는 {{minWidth}} {{minWidthUnit}}입니다.',
    validationMediaWidthOverflow: '{{fileMainType}}이(가) 너무 큽니다. 최대 너비는 {{maxWidth}} {{maxWidthUnit}}입니다.',

    validationMediaHeightRangeMismatch: '{{fileMainType}} 높이가 올바르지 않습니다. 높이는 {{minHeight}}에서 {{maxHeight}} {{maxHeightUnit}} 사이여야 합니다.',

    validationMediaHeightUnderflow: '{{fileMainType}}이(가) 너무 작습니다. 최소 높이는 {{minHeight}} {{minHeightUnit}}입니다.',
    validationMediaHeightOverflow: '{{fileMainType}}이(가) 너무 큽니다. 최대 높이는 {{maxHeight}} {{maxHeightUnit}}입니다.',

    validationMediaResolutionRangeMismatch:
        '{{fileMainType}}의 해상도가 잘못되었습니다. 해상도는 {{minResolution}}MP에서 {{maxResolution}}MP 사이여야 합니다.',

    validationMediaResolutionUnderflow:
        '{{fileMainType}}의 해상도가 잘못되었습니다. 최소 해상도는 {{minResolution}}MP입니다.',

    validationMediaResolutionOverflow:
        '{{fileMainType}}의 해상도가 잘못되었습니다. 최대 해상도는 {{maxResolution}}MP입니다.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        '목록의 파일 수가 너무 적습니다. 최소값은 {{minFiles}} {{minFilesUnit}}입니다.',
    validationListEntryCountOverflow:
        '목록의 파일 수가 너무 많습니다. 최대값은 {{maxFiles}} {{maxFilesUnit}}입니다.',
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
