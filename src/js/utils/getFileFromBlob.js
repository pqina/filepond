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
    
    // copy relative path
    if (blob._relativePath) file._relativePath = blob._relativePath;

    // if blob has name property, use as filename if no filename supplied
    if (!isString(filename)) {
        filename = getDateString();
    }

    // if filename already carries an extension keep it as is, otherwise fall
    // through and append a guessed one. `getExtensionFromFilename` returns the
    // whole name for dotless names like "avatar", so also check for a dot.
    if (
        filename &&
        extension === null &&
        filename.includes('.') &&
        getExtensionFromFilename(filename)
    ) {
        file.name = filename;
    }
    else {
        extension = extension || guesstimateExtension(file.type);
        file.name = filename + (extension ? '.' + extension : '');
    }

    return file;
};
