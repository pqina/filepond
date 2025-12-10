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

    loadError: 'Αποτυχία φόρτωσης αρχείου.',

    loadDataTranserProgress: 'Φόρτωση αρχείων',
    loadDataTranserInfo: 'Επεξεργάστηκαν {{processedFiles}} από {{totalFiles}} αρχεία',

    validationInvalid: 'Μη έγκυρο αρχείο.',
    validationFileNameMissing: 'Λείπει το όνομα αρχείου',

    validationInvalidEntries: 'Η λίστα αρχείων περιέχει μη έγκυρα στοιχεία.',
    validationInvalidState: 'Η λίστα αρχείων βρίσκεται σε μη έγκυρη κατάσταση.',
    validationInvalidBusy: 'Η λίστα αρχείων είναι απασχολημένη.',
    validationInvalidEmpty: 'Συμπληρώστε αυτό το πεδίο.',
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
    validationFileSizeUnderflow: 'Το αρχείο είναι πολύ μικρό. Ελάχιστο {{minSize}}.',
    validationFileSizeOverflow: 'Το αρχείο είναι πολύ μεγάλο. Μέγιστο {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'Το συνολικό μέγεθος αρχείων είναι πολύ μικρό. Ελάχιστο {{minListSize}}.',
    validationListSizeOverflow:
        'Το συνολικό μέγεθος αρχείων είναι πολύ μεγάλο. Μέγιστο {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Αδύνατη η ανάγνωση μεγέθους πολυμέσων.',

    validationMediaWidthRangeMismatch:
        'Το πλάτος του {{fileMainType}} δεν είναι έγκυρο. Πρέπει να είναι μεταξύ {{minWidth}} και {{maxWidth}} px.',

    validationMediaWidthUnderflow:
        'Το {{fileMainType}} είναι πολύ μικρό. Ελάχιστο πλάτος {{minWidth}} px.',
    validationMediaWidthOverflow:
        'Το {{fileMainType}} είναι πολύ μεγάλο. Μέγιστο πλάτος {{maxWidth}} px.',

    validationMediaHeightRangeMismatch:
        'Το ύψος του {{fileMainType}} δεν είναι έγκυρο. Πρέπει να είναι μεταξύ {{minHeight}} και {{maxHeight}} px.',

    validationMediaHeightUnderflow:
        'Το {{fileMainType}} είναι πολύ μικρό. Ελάχιστο ύψος {{minHeight}} px.',
    validationMediaHeightOverflow:
        'Το {{fileMainType}} είναι πολύ μεγάλο. Μέγιστο ύψος {{maxHeight}} px.',

    validationMediaResolutionRangeMismatch:
        'Η ανάλυση δεν είναι έγκυρη. Πρέπει να είναι μεταξύ {{minResolution}}MP και {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'Η ανάλυση είναι πολύ χαμηλή. Ελάχιστο {{minResolution}}MP.',
    validationMediaResolutionOverflow: 'Η ανάλυση είναι πολύ υψηλή. Μέγιστο {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Πολύ λίγα αρχεία στη λίστα. Ελάχιστο {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'αρχείο',
                    else: 'αρχεία',
                },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Πάρα πολλά αρχεία στη λίστα. Μέγιστο {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: {
                    1: 'αρχείο',
                    else: 'αρχεία',
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
