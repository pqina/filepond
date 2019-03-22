import { getBase64DataFromBase64DataURI } from './getBase64DataFromBase64DataURI';

export const getByteStringFromBase64DataURI = dataURI => {
    return atob(getBase64DataFromBase64DataURI(dataURI));
};
