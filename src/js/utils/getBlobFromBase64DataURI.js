import { getBlobFromByteStringWithMimeType } from './getBlobFromByteStringWithMimeType';
import { getMimeTypeFromBase64DataURI } from './getMimeTypeFromBase64DataURI';
import { getByteStringFromBase64DataURI } from './getByteStringFromBase64DataURI';

export const getBlobFromBase64DataURI = dataURI => {
    const mimeType = getMimeTypeFromBase64DataURI(dataURI);
    const byteString = getByteStringFromBase64DataURI(dataURI);

    return getBlobFromByteStringWithMimeType(byteString, mimeType);
};
