export const getBase64DataFromBase64DataURI = dataURI => {
    // get data part of string (remove data:image/jpeg...,)
    const data = dataURI.split(',')[1];

    // remove any whitespace as that causes InvalidCharacterError in IE
    return data.replace(/\s/g, '');
};
