/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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
        1: 'ficheiro',
        else: 'ficheiros',
    },

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
    // browse button labels
    browse: 'Escolher {{maxFilesUnit}}',
    browseAndDrop: 'Largue {{maxFilesUnit}} aqui ou <u>procure</u>',

    loadError: 'Não foi possível carregar o ficheiro.',

    loadDataTransferProgress: 'A carregar ficheiros',
    loadDataTransferInfo: '{{processedFiles}} de {{totalFiles}} ficheiros processados',

    validationInvalid: 'Ficheiro inválido.',
    validationFileNameMissing: 'Nome do ficheiro em falta',

    validationInvalidEntries: 'A lista contém itens inválidos.',
    validationInvalidState: 'A lista de ficheiros está num estado inválido.',
    validationInvalidBusy: 'A lista de ficheiros está ocupada.',
    validationInvalidEmpty: {
        template: 'Selecione {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'um ficheiro',
                    true: 'um ou mais ficheiros',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'obrigatório',
    ariaNoEntries: 'Nenhum {{maxFilesUnit}} selecionado',
    ariaSingleEntry: 'Selecionado {{name}}',
    ariaMultipleEntries: '{{count}} ficheiros selecionados',
    ariaItemRoleDescription: 'Ordenável',
    ariaDragDescription:
        'Prima espaço para pegar e largar um item. Use as teclas de seta para cima e para baixo para movê-lo para uma nova posição.',
    ariaDragStateDrop: '{{name}} largado na posição {{position}}',
    ariaDragStateGrab: '{{name}} agarrado na posição {{position}}',
    ariaDragStateSort: '{{name}} movido para a posição {{position}} de {{total}}',
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
    storeRestoreError: 'Não foi possível carregar o ficheiro.',
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
        'Este ficheiro é demasiado pequeno. O tamanho mínimo é {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Este ficheiro é demasiado grande. O tamanho máximo é {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'O tamanho total dos ficheiros é demasiado pequeno. O tamanho total mínimo é {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'O tamanho total dos ficheiros é demasiado grande. O tamanho total máximo é {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'Não foi possível ler o tamanho do ficheiro.',

    validationMediaWidthRangeMismatch:
        'A largura do {{fileMainType}} é inválida. A largura deve estar entre {{minWidth}} e {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        'O {{fileMainType}} é demasiado pequeno. A largura mínima é {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'O {{fileMainType}} é demasiado grande. A largura máxima é {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'A altura do {{fileMainType}} é inválida. A altura deve estar entre {{minHeight}} e {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        'O {{fileMainType}} é demasiado pequeno. A altura mínima é {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'O {{fileMainType}} é demasiado grande. A altura máxima é {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'A resolução do {{fileMainType}} é inválida. Deve estar entre {{minResolution}}MP e {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'A resolução do {{fileMainType}} é inválida. A resolução mínima é {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'A resolução do {{fileMainType}} é inválida. A resolução máxima é {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Há poucos ficheiros na lista. O mínimo é {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Há demasiados ficheiros na lista. O máximo é {{maxFiles}} {{maxFilesUnit}}.',
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
