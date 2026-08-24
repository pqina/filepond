export {
    isBlob,
    isBlobOrFile,
    isDirectoryEntry,
    isFile,
    isFileEntry,
    isImageFile,
    isVideoFile,
} from './test.js';

export { supportsInvokerCommands } from './support.js';

export {
    blobToFile,
    cloneBlob,
    cloneFile,
    cloneFileWithOptions,
    getExtensionFromFilename,
    getExtensionFromMimeType,
    getFilenameWithoutExtension,
    sanitizeFilename,
    updateFilename,
    updateFileType,
} from './file.js';

export {
    h,
    addListener,
    getAsElement,
    defineCustomElement,
    setBooleanAttribute,
    setStringAttribute,
    getAttribute,
    createStyleSheet,
} from './dom.js';
