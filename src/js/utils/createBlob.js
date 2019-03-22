import { getBlobBuilder } from './getBlobBuilder';

export const createBlob = (arrayBuffer, mimeType) => {
    const BB = getBlobBuilder();

    if (BB) {
        const bb = new BB();
        bb.append(arrayBuffer);
        return bb.getBlob(mimeType);
    }

    return new Blob([arrayBuffer], {
        type: mimeType
    });
};
