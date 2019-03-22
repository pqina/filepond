import { createBlob } from './createBlob';

export const getBlobFromByteStringWithMimeType = (byteString, mimeType) => {
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return createBlob(ab, mimeType);
};
