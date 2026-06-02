/**
 * This locale file was generated using automated translation tools. It may contain inaccuracies or unnatural phrasing.
 *
 * If you're a native speaker, a pull request to improve these translations is very welcome.
 */

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
        1: 'píxel',
        else: 'píxeles',
    },
    unitFiles: {
        1: 'archivo',
        else: 'archivos',
    },

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
    // browse button labels
    browse: 'Elegir {{maxFilesUnit}}',
    browseAndDrop: 'Suelta {{maxFilesUnit}} aquí o <u>explora</u>',

    loadError: 'No se pudo cargar el archivo.',

    loadDataTransferProgress: 'Cargando archivos',
    loadDataTransferInfo: '{{processedFiles}} de {{totalFiles}} archivos procesados',

    validationInvalid: 'Archivo no válido.',
    validationFileNameMissing: 'Falta el nombre del archivo',

    validationInvalidEntries: 'La lista contiene elementos no válidos.',
    validationInvalidState: 'La lista de archivos está en un estado no válido.',
    validationInvalidBusy: 'La lista de archivos está ocupada.',
    validationInvalidEmpty: {
        template: 'Selecciona {{files}}.',
        variables: {
            files: {
                context: 'multiple',
                map: {
                    false: 'un archivo',
                    true: 'uno o más archivos',
                },
            },
        },
    },

    // screenreader accessibility
    ariaRequired: 'requerido',
    ariaNoEntries: 'No se han seleccionado {{maxFilesUnit}}',
    ariaSingleEntry: 'Seleccionado {{name}}',
    ariaMultipleEntries: '{{count}} archivos seleccionados',
    ariaItemRoleDescription: 'Ordenable',
    ariaDragDescription:
        'Pulsa espacio para recoger y soltar un elemento. Usa las teclas de flecha arriba y abajo para moverlo a una nueva posición.',
    ariaDragStateDrop: 'Se soltó {{name}} en la posición {{position}}',
    ariaDragStateGrab: 'Se recogió {{name}} en la posición {{position}}',
    ariaDragStateSort: 'Se movió {{name}} a la posición {{position}} de {{total}}',
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
    storeRestoreError: 'No se pudo cargar el archivo.',
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
        'Este archivo es demasiado pequeño. El tamaño mínimo es {{minSize}} {{minSizeUnit}}.',
    validationFileSizeOverflow:
        'Este archivo es demasiado grande. El tamaño máximo es {{maxSize}} {{maxSizeUnit}}.',
};

export const validationListSize = {
    validationListSizeUnderflow:
        'El tamaño total de los archivos es demasiado pequeño. El tamaño total mínimo es {{minSize}} {{minSizeUnit}}.',
    validationListSizeOverflow:
        'El tamaño total de los archivos es demasiado grande. El tamaño total máximo es {{maxSize}} {{maxSizeUnit}}.',
};

export const validationMediaResolution = {
    validationMediaSizeUnavailable: 'No se pudo leer el tamaño del archivo.',

    validationMediaWidthRangeMismatch:
        'El ancho del {{fileMainType}} no es válido. El ancho debe estar entre {{minWidth}} y {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaWidthUnderflow:
        'El {{fileMainType}} es demasiado pequeño. El ancho mínimo es {{minWidth}} {{minWidthUnit}}.',
    validationMediaWidthOverflow:
        'El {{fileMainType}} es demasiado grande. El ancho máximo es {{maxWidth}} {{maxWidthUnit}}.',

    validationMediaHeightRangeMismatch:
        'La altura del {{fileMainType}} no es válida. La altura debe estar entre {{minHeight}} y {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaHeightUnderflow:
        'El {{fileMainType}} es demasiado pequeño. La altura mínima es {{minHeight}} {{minHeightUnit}}.',
    validationMediaHeightOverflow:
        'El {{fileMainType}} es demasiado grande. La altura máxima es {{maxHeight}} {{maxHeightUnit}}.',

    validationMediaResolutionRangeMismatch:
        'La resolución del {{fileMainType}} no es válida. Debe estar entre {{minResolution}}MP y {{maxResolution}}MP.',

    validationMediaResolutionUnderflow:
        'La resolución del {{fileMainType}} no es válida. La resolución mínima es {{minResolution}}MP.',

    validationMediaResolutionOverflow:
        'La resolución del {{fileMainType}} no es válida. La resolución máxima es {{maxResolution}}MP.',
};

export const validationListCount = {
    validationListEntryCountUnderflow:
        'Muy pocos archivos en la lista. El mínimo es {{minFiles}} {{minFilesUnit}}.',
    validationListEntryCountOverflow:
        'Demasiados archivos en la lista. El máximo es {{maxFiles}} {{maxFilesUnit}}.',
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
