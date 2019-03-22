import { getExtensionFromFilename } from './getExtensionFromFilename';
import { guesstimateExtension } from './guesstimateExtension';
import { isString } from './isString';
import { getDateString } from './getDateString';

export const getFileFromBlob = (
    blob,
    filename,
    type = null,
    extension = null
) => {
    const file =
        typeof type === 'string'
            ? blob.slice(0, blob.size, type)
            : blob.slice(0, blob.size, blob.type);
    file.lastModifiedDate = new Date();

    // if blob has name property, use as filename if no filename supplied
    if (!isString(filename)) {
        filename = getDateString();
    }

    // if filename supplied but no extension and filename has extension
    if (filename && extension === null && getExtensionFromFilename(filename)) {
        file.name = filename;
    }
    else {
        extension = extension || guesstimateExtension(file.type);
        file.name = filename + (extension ? '.' + extension : '');
    }

    return file;
};
