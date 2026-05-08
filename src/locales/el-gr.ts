/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Ακύρωση',
    remove: 'Αφαίρεση',
    reset: 'Επαναφορά',
    undo: 'Αναίρεση',
    cancel: 'Ακύρωση',
    store: 'Αποθήκευση',
    revert: 'Επαναφορά',
    busy: 'Απασχολημένο',
    loading: 'Φόρτωση',

    // units
    unitB: {
        1: 'byte',
        else: 'bytes',
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
        else: 'pixels',
    },
    unitFiles: {
        1: 'αρχείο',
        else: 'αρχεία',
    },

    error: 'Σφάλμα',
    warning: 'Προειδοποίηση',
    success: 'Επιτυχία',
    info: 'Πληροφορία',
    system: 'Σύστημα',

    fileMainTypeImage: 'εικόνα',
    fileMainTypeVideo: 'βίντεο',
    fileMainTypeAudio: 'ήχος',
    fileMainTypeApplication: 'αρχείο',

    assistAbort: 'Πατήστε για ακύρωση',
    assistUndo: 'Πατήστε για αναίρεση',
    // browse button labels
    browse: 'Επιλέξτε {{maxFilesUnit}}',
    browseAndDrop: 'Αποθέστε {{maxFilesUnit}} εδώ ή <u>περιηγηθείτε</u>',

    loadError: 'Αποτυχία φόρτωσης αρχείου.',

    loadDataTransferProgress: 'Φόρτωση αρχείων',
    loadDataTransferInfo: 'Επεξεργάστηκαν {{processedFiles}} από {{totalFiles}} αρχεία',

    validationInvalid: 'Μη έγκυρο αρχείο.',
    validationFileNameMissing: 'Λείπει το όνομα αρχείου',

    validationInvalidEntries: 'Η λίστα αρχείων περιέχει μη έγκυρα στοιχεία.',
    validationInvalidState: 'Η λίστα αρχείων βρίσκεται σε μη έγκυρη κατάσταση.',
    validationInvalidBusy: 'Η λίστα αρχείων είναι απασχολημένη.',
    validationInvalidEmpty: {
        template: 'Επιλέξτε {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'ένα αρχείο',
                    true: 'ένα ή περισσότερα αρχεία',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'υποχρεωτικό',
    ariaNoEntries: 'Δεν έχουν επιλεγεί {{maxFilesUnit}}',
    ariaSingleEntry: 'Επιλέχθηκε το {{name}}',
    ariaMultipleEntries: 'Επιλέχθηκαν {{count}} αρχεία',
    ariaItemRoleDescription: 'Δυνατότητα ταξινόμησης',
    ariaDragDescription:
        'Πατήστε το κενό για να σηκώσετε και να αποθέσετε ένα στοιχείο. Χρησιμοποιήστε τα πλήκτρα πάνω και κάτω βέλους για να το μετακινήσετε σε νέα θέση.',
    ariaDragStateDrop: 'Το {{name}} αποτέθηκε στη θέση {{position}}',
    ariaDragStateGrab: 'Το {{name}} σηκώθηκε από τη θέση {{position}}',
    ariaDragStateSort: 'Το {{name}} μετακινήθηκε στη θέση {{position}} από {{total}}',
};

export const media = {
    mediaEdit: 'Επεξεργασία',
    mediaPlay: 'Αναπαραγωγή',
    mediaPause: 'Παύση',
    mediaSilent: 'Χωρίς ήχο',
    mediaUnmute: 'Ενεργοποίηση ήχου',
    mediaMute: 'Σίγαση',
    mediaFullscreen: 'Πλήρης οθόνη',
    mediaLoadError: 'Αποτυχία φόρτωσης {{fileMainType}}.',
    mediaPlayError: 'Αποτυχία αναπαραγωγής βίντεο.',
};

export const store = {
    storeRestoreProgress: 'Φόρτωση {{progress}}%',

    storeStorageQueued: 'Αναμονή για μεταφόρτωση',
    storeStorageProgress: 'Μεταφόρτωση {{progress}}%',
    storeStorageComplete: 'Η μεταφόρτωση ολοκληρώθηκε',

    storeError: 'Αποτυχία αποθήκευσης αρχείου.',

    storeAwaitingCompletion: 'Δεν έχουν αποθηκευτεί όλα τα αρχεία.',
};

export const transform = {
    transformEditBusy: 'Επεξεργασία δεδομένων αρχείου',
    transformError: 'Αποτυχία επεξεργασίας δεδομένων. Προσπαθήστε ξανά.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Αυτός ο τύπος αρχείου δεν επιτρέπεται. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Το αρχείο πρέπει να είναι τύπου {{accept}}',
                    else: 'Επιτρεπόμενοι τύποι: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Αυτή η επέκταση αρχείου δεν επιτρέπεται. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Το αρχείο πρέπει να έχει επέκταση {{accept}}',
                    else: 'Επιτρεπόμενες επεκτάσεις: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Λείπει το όνομα αρχείου',
    validationFileNameMismatch: 'Μη έγκυρο όνομα αρχείου.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Αυτό το αρχείο είναι πολύ μικρό. Το ελάχιστο μέγεθος είναι {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Αυτό το αρχείο είναι πολύ μεγάλο. Το μέγιστο μέγεθος είναι {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Το συνολικό μέγεθος αρχείων είναι πολύ μικρό. Το ελάχιστο συνολικό μέγεθος είναι {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'Το συνολικό μέγεθος αρχείων είναι πολύ μεγάλο. Το μέγιστο συνολικό μέγεθος είναι {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Αδύνατη η ανάγνωση μεγέθους πολυμέσων.',

    validationMediaWidthRangeMismatch:
        'Το πλάτος του {{fileMainType}} δεν είναι έγκυρο. Το πλάτος πρέπει να είναι μεταξύ {{minWidth}} και {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        'Το {{fileMainType}} είναι πολύ μικρό. Το ελάχιστο πλάτος είναι {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'Το {{fileMainType}} είναι πολύ μεγάλο. Το μέγιστο πλάτος είναι {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'Το ύψος του {{fileMainType}} δεν είναι έγκυρο. Το ύψος πρέπει να είναι μεταξύ {{minHeight}} και {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        'Το {{fileMainType}} είναι πολύ μικρό. Το ελάχιστο ύψος είναι {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'Το {{fileMainType}} είναι πολύ μεγάλο. Το μέγιστο ύψος είναι {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'Η ανάλυση δεν είναι έγκυρη. Πρέπει να είναι μεταξύ {{minResolution}}MP και {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Η ανάλυση είναι πολύ χαμηλή. Ελάχιστο {{minResolution}}MP.',
    validationMediaResolutionOverflow: 'Η ανάλυση είναι πολύ υψηλή. Μέγιστο {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Υπάρχουν πολύ λίγα αρχεία στη λίστα. Το ελάχιστο είναι {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Υπάρχουν πάρα πολλά αρχεία στη λίστα. Το μέγιστο είναι {{maxFiles}} {{maxFilesUnit}}.',
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
