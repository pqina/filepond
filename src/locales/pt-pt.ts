export const core = {
    abort: 'Abortar',
    remove: 'Remover',
    reset: 'Repor',
    undo: 'Anular',
    cancel: 'Cancelar',
    store: 'Guardar',
    revert: 'Reverter',
    busy: 'Ocupado',
    loading: 'A carregar',

    error: 'Erro',
    warning: 'Aviso',
    success: 'Concluído',
    info: 'Info',
    system: 'Sistema',

    fileMainTypeImage: 'imagem',
    fileMainTypeVideo: 'vídeo',
    fileMainTypeAudio: 'áudio',
    fileMainTypeApplication: 'ficheiro',

    assistAbort: 'Toque para cancelar',
    assistUndo: 'Toque para anular',

    browseAndDrop: 'Largue ficheiros aqui ou <u>procurar</u>',

    loadError: 'Não foi possível carregar o ficheiro.',

    loadDataTranserProgress: 'A carregar ficheiros',
    loadDataTranserInfo: '{{processedFiles}} de {{totalFiles}} ficheiros processados',

    validationInvalid: 'Ficheiro inválido.',
    validationFileNameMissing: 'Nome do ficheiro em falta',

    validationInvalidEntries: 'A lista contém itens inválidos.',
    validationInvalidState: 'A lista de ficheiros está num estado inválido.',
    validationInvalidBusy: 'A lista de ficheiros está ocupada.',
    validationInvalidEmpty: 'Preencha este campo.',

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
    mediaEdit: 'Editar',
    mediaPlay: 'Reproduzir',
    mediaPause: 'Pausa',
    mediaSilent: 'Sem áudio',
    mediaUnmute: 'Ativar som',
    mediaMute: 'Silenciar',
    mediaFullscreen: 'Ecrã inteiro',
    mediaLoadError: 'Não foi possível carregar a {{fileMainType}}.',
    mediaPlayError: 'Não foi possível reproduzir o vídeo.',
};

export const store = {
    storeRestoreProgress: 'A carregar {{progress}}%',

    storeStorageQueued: 'A aguardar envio',
    storeStorageProgress: 'A enviar {{progress}}%',
    storeStorageComplete: 'Envio concluído',

    storeError: 'Não foi possível guardar o ficheiro.',
    storeAwaitingCompletion: 'Nem todos os ficheiros foram guardados.',
};

export const transform = {
    transformEditBusy: 'A editar ficheiro',
    transformError: 'Não foi possível editar o ficheiro. Tente novamente.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Este tipo de ficheiro não é permitido. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'O ficheiro tem de ser do tipo {{accept}}',
                    else: 'Os tipos permitidos são: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Esta extensão de ficheiro não é permitida. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'O ficheiro tem de ter a extensão {{accept}}',
                    else: 'As extensões permitidas são: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Nome do ficheiro em falta',
    validationFileNameMismatch: 'Este nome de ficheiro é inválido.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Este ficheiro é demasiado pequeno. O tamanho mínimo é {{minSize}}.',
    validationFileSizeOverflow: 'Este ficheiro é demasiado grande. O tamanho máximo é {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'O tamanho total dos ficheiros é demasiado pequeno. O mínimo necessário é {{minListSize}}.',
    validationListSizeOverflow:
        'O tamanho total dos ficheiros é demasiado grande. O máximo permitido é {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Não foi possível ler o tamanho do ficheiro.',

    validationMediaWidthRangeMismatch:
        'A largura do {{fileMainType}} é inválida. A largura deve estar entre {{minWidth}} e {{maxWidth}} píxeis.',

    validationMediaWidthUnderflow:
        'O {{fileMainType}} é demasiado pequeno. A largura mínima é {{minWidth}} píxeis.',
    validationMediaWidthOverflow:
        'O {{fileMainType}} é demasiado grande. A largura máxima é {{maxWidth}} píxeis.',

    validationMediaHeightRangeMismatch:
        'A altura do {{fileMainType}} é inválida. A altura deve estar entre {{minHeight}} e {{maxHeight}} píxeis.',

    validationMediaHeightUnderflow:
        'O {{fileMainType}} é demasiado pequeno. A altura mínima é {{minHeight}} píxeis.',
    validationMediaHeightOverflow:
        'O {{fileMainType}} é demasiado grande. A altura máxima é {{maxHeight}} píxeis.',

    validationMediaResolutionRangeMismatch:
        'A resolução do {{fileMainType}} é inválida. Deve estar entre {{minResolution}}MP e {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'A resolução do {{fileMainType}} é inválida. A resolução mínima é {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'A resolução do {{fileMainType}} é inválida. A resolução máxima é {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Poucos ficheiros. O mínimo necessário é {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'ficheiro', else: 'ficheiros' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Demasiados ficheiros. O máximo permitido é {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'ficheiro', else: 'ficheiros' },
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
