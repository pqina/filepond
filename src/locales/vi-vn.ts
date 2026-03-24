/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Hủy',
    remove: 'Xóa',
    reset: 'Đặt lại',
    undo: 'Hoàn tác',
    cancel: 'Hủy bỏ',
    store: 'Lưu',
    revert: 'Khôi phục',
    busy: 'Đang bận',
    loading: 'Đang tải',

    // units
    unitB: {
        1: 'byte',
        else: 'byte',
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
        1: 'pixel',
        else: 'pixel',
    },
    unitFiles: {
        1: 'tệp',
        else: 'tệp',
    },

    error: 'Lỗi',
    warning: 'Cảnh báo',
    success: 'Thành công',
    info: 'Thông tin',
    system: 'Hệ thống',

    fileMainTypeImage: 'hình ảnh',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'âm thanh',
    fileMainTypeApplication: 'tệp',

    assistAbort: 'Chạm để hủy',
    assistUndo: 'Chạm để hoàn tác',
    // browse button labels
    browse: 'Chọn {{maxFilesUnit}}',
    browseAndDrop: 'Thả {{maxFilesUnit}} vào đây hoặc <u>duyệt</u>',

    loadError: 'Không thể tải tệp.',

    loadDataTranserProgress: 'Đang tải tệp',
    loadDataTranserInfo: 'Đã xử lý {{processedFiles}} / {{totalFiles}} tệp',

    validationInvalid: 'Tệp không hợp lệ.',
    validationFileNameMissing: 'Thiếu tên tệp',

    validationInvalidEntries: 'Danh sách tệp chứa mục không hợp lệ.',
    validationInvalidState: 'Danh sách tệp không hợp lệ.',
    validationInvalidBusy: 'Danh sách tệp đang bận.',
    validationInvalidEmpty: {
        template: 'Vui lòng chọn {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'một tệp',
                    true: 'một hoặc nhiều tệp',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'bắt buộc',
    ariaNoEntries: 'Chưa chọn {{maxFilesUnit}} nào',
    ariaSingleEntry: 'Đã chọn {{name}}',
    ariaMultipleEntries: 'Đã chọn {{count}} tệp',
    ariaItemRoleDescription: 'Có thể sắp xếp',
    ariaDragDescription:
        'Nhấn phím cách để nhấc và thả một mục. Dùng phím mũi tên lên và xuống để di chuyển nó đến vị trí mới.',
    ariaDragStateDrop: 'Đã thả {{name}} vào vị trí {{position}}',
    ariaDragStateGrab: 'Đã nhấc {{name}} ở vị trí {{position}}',
    ariaDragStateSort: 'Đã di chuyển {{name}} đến vị trí {{position}} trên tổng {{total}}',
};

export const media = {
    mediaEdit: 'Chỉnh sửa',
    mediaPlay: 'Phát',
    mediaPause: 'Tạm dừng',
    mediaSilent: 'Không âm thanh',
    mediaUnmute: 'Bật âm thanh',
    mediaMute: 'Tắt âm thanh',
    mediaFullscreen: 'Toàn màn hình',
    mediaLoadError: 'Không thể tải {{fileMainType}}.',
    mediaPlayError: 'Không thể phát video.',
};

export const store = {
    storeRestoreProgress: 'Đang tải {{progress}}%',

    storeStorageQueued: 'Chờ tải lên',
    storeStorageProgress: 'Đang tải lên {{progress}}%',
    storeStorageComplete: 'Tải lên hoàn tất',

    storeError: 'Không thể lưu tệp.',

    storeAwaitingCompletion: 'Chưa lưu xong tất cả tệp.',
};

export const transform = {
    transformEditBusy: 'Đang chỉnh sửa dữ liệu tệp',
    transformError: 'Không thể chỉnh sửa dữ liệu tệp. Vui lòng thử lại.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Loại tệp không được phép. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Tệp phải thuộc loại {{accept}}',
                    else: 'Các loại được phép: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Phần mở rộng không được phép. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Tệp phải có phần mở rộng {{accept}}',
                    else: 'Các phần mở rộng được phép: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Thiếu tên tệp',
    validationFileNameMismatch: 'Tên tệp không hợp lệ.',
};

export const validationFileSize = {
    validationFileSizeUnderflow: 'Tệp này quá nhỏ. Kích thước tối thiểu là {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow: 'Tệp này quá lớn. Kích thước tối đa là {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow: 'Tổng kích thước tệp quá nhỏ. Tổng kích thước tối thiểu là {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow: 'Tổng kích thước tệp quá lớn. Tổng kích thước tối đa là {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Không đọc được kích thước phương tiện.',

    validationMediaWidthRangeMismatch: 'Chiều rộng của {{fileMainType}} không hợp lệ. Chiều rộng phải nằm trong khoảng từ {{minWidth}} đến {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow: '{{fileMainType}} quá nhỏ. Chiều rộng tối thiểu là {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow: '{{fileMainType}} quá lớn. Chiều rộng tối đa là {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch: 'Chiều cao của {{fileMainType}} không hợp lệ. Chiều cao phải nằm trong khoảng từ {{minHeight}} đến {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow: '{{fileMainType}} quá nhỏ. Chiều cao tối thiểu là {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow: '{{fileMainType}} quá lớn. Chiều cao tối đa là {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Độ phân giải không hợp lệ. Cần trong khoảng {{minResolution}}MP đến {{maxResolution}}MP.',

    validationMediaResolutionUnderflow: 'Độ phân giải quá thấp. Tối thiểu {{minResolution}}MP.',
    validationMediaResolutionOverflow: 'Độ phân giải quá cao. Tối đa {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Có quá ít tệp trong danh sách. Tối thiểu là {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Có quá nhiều tệp trong danh sách. Tối đa là {{maxFiles}} {{maxFilesUnit}}.',
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
