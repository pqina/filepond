/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

export const core = {
    abort: 'Annuler',
    remove: 'Supprimer',
    reset: 'Réinitialiser',
    undo: 'Annuler',
    cancel: 'Annuler',
    store: 'Enregistrer',
    revert: 'Rétablir',
    busy: 'Occupé',
    loading: 'Chargement',

    // units
    unitB: {
        1: 'octet',
        else: 'octets',
    },
    unitKB: 'Ko',
    unitMB: 'Mo',
    unitGB: 'Go',
    unitTB: 'To',
    unitPB: 'Po',
    unitKiB: 'Kio',
    unitMiB: 'Mio',
    unitGiB: 'Gio',
    unitTiB: 'Tio',
    unitPiB: 'Pio',
    unitPixels: {
        1: 'pixel',
        else: 'pixels',
    },
    unitFiles: {
        1: 'fichier',
        else: 'fichiers',
    },

    error: 'Erreur',
    warning: 'Avertissement',
    success: 'Réussi',
    info: 'Info',
    system: 'Système',

    fileMainTypeImage: 'image',
    fileMainTypeVideo: 'vidéo',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'fichier',

    assistAbort: 'Touchez pour annuler',
    assistUndo: 'Touchez pour annuler l’action',
    // browse button labels
    browse: 'Choisir {{maxFilesUnit}}',
    browseAndDrop: 'Déposez {{maxFilesUnit}} ici ou <u>parcourir</u>',

    loadError: 'Le fichier n’a pas pu être chargé.',

    loadDataTransferProgress: 'Chargement des fichiers',
    loadDataTransferInfo: '{{processedFiles}} fichiers sur {{totalFiles}} traités',

    validationInvalid: 'Fichier invalide.',
    validationFileNameMissing: 'Nom de fichier manquant',

    validationInvalidEntries: 'La liste contient des éléments invalides.',
    validationInvalidState: 'La liste de fichiers est dans un état invalide.',
    validationInvalidBusy: 'La liste de fichiers est occupée.',
    validationInvalidEmpty: {
        template: 'Veuillez sélectionner {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'un fichier',
                    true: 'un ou plusieurs fichiers',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'requis',
    ariaNoEntries: 'Aucun {{maxFilesUnit}} sélectionné',
    ariaSingleEntry: 'Sélectionné {{name}}',
    ariaMultipleEntries: '{{count}} fichiers sélectionnés',
    ariaItemRoleDescription: 'Triable',
    ariaDragDescription:
        'Appuyez sur espace pour prendre et déposer un élément. Utilisez les flèches haut et bas pour le déplacer vers une nouvelle position.',
    ariaDragStateDrop: '{{name}} déposé à la position {{position}}',
    ariaDragStateGrab: '{{name}} pris à la position {{position}}',
    ariaDragStateSort: '{{name}} déplacé à la position {{position}} sur {{total}}',
};

export const media = {
    mediaEdit: 'Modifier',
    mediaPlay: 'Lecture',
    mediaPause: 'Pause',
    mediaSilent: 'Sans audio',
    mediaUnmute: 'Activer le son',
    mediaMute: 'Couper le son',
    mediaFullscreen: 'Plein écran',
    mediaLoadError: '{{fileMainType}} n’a pas pu être chargée.',
    mediaPlayError: 'La vidéo ne peut pas être lue.',
};

export const store = {
    storeRestoreProgress: 'Chargement {{progress}}%',

    storeStorageQueued: 'En attente de téléversement',
    storeStorageProgress: 'Téléversement {{progress}}%',
    storeStorageComplete: 'Téléversement terminé',

    storeError: 'Le fichier n’a pas pu être enregistré.',
    storeAwaitingCompletion: 'Tous les fichiers ne sont pas encore enregistrés.',
};

export const transform = {
    transformEditBusy: 'Modification du fichier en cours',
    transformError: 'Le fichier n’a pas pu être modifié. Veuillez réessayer.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Ce type de fichier n’est pas autorisé. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Le fichier doit être de type {{accept}}',
                    else: 'Les types autorisés sont : {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Cette extension de fichier n’est pas autorisée. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'Le fichier doit avoir l’extension {{accept}}',
                    else: 'Les extensions autorisées sont : {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Nom de fichier manquant',
    validationFileNameMismatch: 'Ce nom de fichier est invalide.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Ce fichier est trop petit. La taille minimale est {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Ce fichier est trop volumineux. La taille maximale est {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'La taille totale des fichiers est trop petite. La taille totale minimale est {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'La taille totale des fichiers est trop grande. La taille totale maximale est {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Impossible de lire la taille du média.',

    validationMediaWidthRangeMismatch:
        'La largeur du {{fileMainType}} est invalide. Elle doit être comprise entre {{minWidth}} et {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        'Le {{fileMainType}} est trop petit. La largeur minimale est de {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'Le {{fileMainType}} est trop grand. La largeur maximale est de {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'La hauteur du {{fileMainType}} est invalide. Elle doit être comprise entre {{minHeight}} et {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        'Le {{fileMainType}} est trop petit. La hauteur minimale est de {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'Le {{fileMainType}} est trop grand. La hauteur maximale est de {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'La résolution du {{fileMainType}} est invalide. Elle doit être comprise entre {{minResolution}}MP et {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'La résolution du {{fileMainType}} est invalide. La résolution minimale est {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'La résolution du {{fileMainType}} est invalide. La résolution maximale est {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Pas assez de fichiers dans la liste. Le minimum est {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Trop de fichiers dans la liste. Le maximum est {{maxFiles}} {{maxFilesUnit}}.',
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
