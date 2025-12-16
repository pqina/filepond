export const core = {
    abort: 'Cancelar',
    remove: 'Eliminar',
    reset: 'Restablecer',
    undo: 'Deshacer',
    cancel: 'Cancelar',
    store: 'Guardar',
    revert: 'Revertir',
    busy: 'Ocupado',
    loading: 'Cargando',

    error: 'Error',
    warning: 'Advertencia',
    success: 'Correcto',
    info: 'Info',
    system: 'Sistema',

    fileMainTypeImage: 'imagen',
    fileMainTypeVideo: 'video',
    fileMainTypeAudio: 'audio',
    fileMainTypeApplication: 'archivo',

    assistAbort: 'Toca para cancelar',
    assistUndo: 'Toca para deshacer',

    dropAreaLabel: 'Suelta archivos aquí o <u>explora</u>',

    loadError: 'No se pudo cargar el archivo.',

    loadDataTranserProgress: 'Cargando archivos',
    loadDataTranserInfo: '{{processedFiles}} de {{totalFiles}} archivos procesados',

    validationInvalid: 'Archivo no válido.',
    validationFileNameMissing: 'Falta el nombre del archivo',

    validationInvalidEntries: 'La lista contiene elementos no válidos.',
    validationInvalidState: 'La lista de archivos está en un estado no válido.',
    validationInvalidBusy: 'La lista de archivos está ocupada.',
    validationInvalidEmpty: 'Completa este campo.',
};

export const media = {
    mediaEdit: 'Editar',
    mediaPlay: 'Reproducir',
    mediaPause: 'Pausar',
    mediaSilent: 'Sin audio',
    mediaUnmute: 'Activar sonido',
    mediaMute: 'Silenciar',
    mediaFullscreen: 'Pantalla completa',
    mediaLoadError: 'No se pudo cargar la {{fileMainType}}.',
    mediaPlayError: 'No se pudo reproducir el video.',
};

export const store = {
    storeRestoreProgress: 'Cargando {{progress}}%',

    storeStorageQueued: 'En espera de subir',
    storeStorageProgress: 'Subiendo {{progress}}%',
    storeStorageComplete: 'Carga completada',

    storeError: 'No se pudo guardar el archivo.',
    storeAwaitingCompletion: 'No se han guardado todos los archivos.',
};

export const transform = {
    transformEditBusy: 'Editando archivo',
    transformError: 'No se pudo editar el archivo. Inténtalo de nuevo.',
};

export const validationFileMimeType = {
    validationFileMimeTypeMismatch: {
        template: 'Este tipo de archivo no está permitido. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'El archivo debe ser del tipo {{accept}}',
                    else: 'Los tipos permitidos son: {{accept}}',
                },
            },
        },
    },
};

export const validationFileExtension = {
    validationFileExtensionMismatch: {
        template: 'Esta extensión de archivo no está permitida. {{details}}.',
        variables: {
            details: {
                context: 'count',
                map: {
                    1: 'El archivo debe tener la extensión {{accept}}',
                    else: 'Las extensiones permitidas son: {{accept}}',
                },
            },
        },
    },
};

export const validationFileName = {
    validationFileNameMissing: 'Falta el nombre del archivo',
    validationFileNameMismatch: 'Este nombre de archivo no es válido.',
};

export const validationFileSize = {
    validationFileSizeUnderflow:
        'Este archivo es demasiado pequeño. El tamaño mínimo es {{minSize}}.',
    validationFileSizeOverflow:
        'Este archivo es demasiado grande. El tamaño máximo es {{maxSize}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'El tamaño total de los archivos es demasiado pequeño. El mínimo requerido es {{minListSize}}.',
    validationListSizeOverflow:
        'El tamaño total de los archivos es demasiado grande. El máximo permitido es {{maxListSize}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'No se pudo leer el tamaño del archivo.',

    validationMediaWidthRangeMismatch:
        'El ancho del {{fileMainType}} no es válido. El ancho debe estar entre {{minWidth}} y {{maxWidth}} píxeles.',

    validationMediaWidthUnderflow:
        'El {{fileMainType}} es demasiado pequeño. El ancho mínimo es {{minWidth}} píxeles.',
    validationMediaWidthOverflow:
        'El {{fileMainType}} es demasiado grande. El ancho máximo es {{maxWidth}} píxeles.',

    validationMediaHeightRangeMismatch:
        'La altura del {{fileMainType}} no es válida. La altura debe estar entre {{minHeight}} y {{maxHeight}} píxeles.',

    validationMediaHeightUnderflow:
        'El {{fileMainType}} es demasiado pequeño. La altura mínima es {{minHeight}} píxeles.',
    validationMediaHeightOverflow:
        'El {{fileMainType}} es demasiado grande. La altura máxima es {{maxHeight}} píxeles.',

    validationMediaResolutionRangeMismatch:
        'La resolución del {{fileMainType}} no es válida. Debe estar entre {{minResolution}}MP y {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'La resolución del {{fileMainType}} no es válida. La resolución mínima es {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'La resolución del {{fileMainType}} no es válida. La resolución máxima es {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow: {
        template: 'Muy pocos archivos. El mínimo requerido es {{minFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'archivo', else: 'archivos' },
            },
        },
    },

    validationListEntryCountOverflow: {
        template: 'Demasiados archivos. El máximo permitido es {{maxFiles}} {{files}}.',
        variables: {
            files: {
                context: 'minFiles',
                map: { 1: 'archivo', else: 'archivos' },
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
