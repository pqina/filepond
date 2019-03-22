import { getMimeTypeFromBase64DataURI } from '../../utils/getMimeTypeFromBase64DataURI';
import { getFilenameFromURL } from '../../utils/getFilenameFromURL';
import { isBase64DataURI } from '../../utils/isBase64DataURI';
import { isString } from '../../utils/isString';
import { getDateString } from '../../utils/getDateString';

export const createFileStub = source => {
    let data = [source.name, source.size, source.type];

    // is blob or base64, then we need to set the name
    if (source instanceof Blob || isBase64DataURI(source)) {
        data[0] = source.name || getDateString();
    } else if (isBase64DataURI(source)) {
        // if is base64 data uri we need to determine the average size and type
        data[1] = source.length;
        data[2] = getMimeTypeFromBase64DataURI(source);
    } else if (isString(source)) {
        // url
        data[0] = getFilenameFromURL(source);
        data[1] = 0;
        data[2] = 'application/octet-stream';
    }

    return {
        name: data[0],
        size: data[1],
        type: data[2]
    };
};
