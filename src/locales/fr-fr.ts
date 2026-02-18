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
    browse: {
        template: 'Choisir {{files}}',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'fichiers',
                    false: 'fichier',
                },
            },
        },
    },
    browseAndDrop: {
        template: 'Déposez {{files}} ici ou <u>parcourir</u>',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'des fichiers',
                    false: 'un fichier',
                },
            },
        },
    },

    loadError: 'Le fichier n’a pas pu être chargé.',

    loadDataTranserProgress: 'Chargement des fichiers',
    loadDataTranserInfo: '{{processedFiles}} fichiers sur {{totalFiles}} traités',

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
    ariaNoEntries: {
        template: 'Aucun {{files}} sélectionné',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    true: 'fichiers',
                    false: 'fichier',
                },
            },
        },
    },
    ariaSingleEntry: 'Sélectionné {{name}}',
    ariaMultipleEntries: '{{count}} fichiers sélectionnés',
    ariaItemRoleDescription: 'Triable',
    ariaDragDescription:
        'Appuyez sur espace pour prendre et déposer cet élément. Utilisez les flèches haut et bas pour le déplacer vers une nouvelle position.',
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
    validationFileSizeUnderflow: 'Ce fichier est trop petit. La taille minimale est {{minSize}}.',
    validationFileSizeOverflow:
        'Ce fichier est trop volumineux. La taille maximale est {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'La taille totale des fichiers est trop petite. Le minimum requis est {{minListSize}}.',
    validationListSizeOverflow:
        'La taille totale des fichiers est trop grande. Le maximum autorisé est {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Impossible de lire la taille du média.',

    validationMediaWidthRangeMismatch:
        'La largeur du {{fileMainType}} est invalide. Elle doit être comprise entre {{minWidth}} et {{maxWidth}} pixels.',

    validationMediaWidthUnderflow:
        'Le {{fileMainType}} est trop petit. La largeur minimale est de {{minWidth}} pixels.',
    validationMediaWidthOverflow:
        'Le {{fileMainType}} est trop grand. La largeur maximale est de {{maxWidth}} pixels.',

    validationMediaHeightRangeMismatch:
        'La hauteur du {{fileMainType}} est invalide. Elle doit être comprise entre {{minHeight}} et {{maxHeight}} pixels.',

    validationMediaHeightUnderflow:
        'Le {{fileMainType}} est trop petit. La hauteur minimale est de {{minHeight}} pixels.',
    validationMediaHeightOverflow:
        'Le {{fileMainType}} est trop grand. La hauteur maximale est de {{maxHeight}} pixels.',

    validationMediaResolutionRangeMismatch:
        'La résolution du {{fileMainType}} est invalide. Elle doit être comprise entre {{minResolution}}MP et {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'La résolution du {{fileMainType}} est invalide. La résolution minimale est {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'La résolution du {{fileMainType}} est invalide. La résolution maximale est {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Pas assez de fichiers. Le minimum requis est {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'fichier', else: 'fichiers' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Trop de fichiers. Le maximum autorisé est {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'fichier', else: 'fichiers' },
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
