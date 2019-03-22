import { getFileFromBlob } from './getFileFromBlob';
import { getBlobFromBase64DataURI } from './getBlobFromBase64DataURI';

export const getFileFromBase64DataURI = (dataURI, filename, extension) => {
    return getFileFromBlob(
        getBlobFromBase64DataURI(dataURI),
        filename,
        null,
        extension
    );
};
