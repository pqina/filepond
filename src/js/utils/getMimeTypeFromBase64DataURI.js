export const getMimeTypeFromBase64DataURI = dataURI => {
    return (/^data:(.+);/.exec(dataURI) || [])[1] || null;
};
