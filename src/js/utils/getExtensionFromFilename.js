export const getExtensionFromFilename = name => {
    const fileExt=name.split('.');
    return fileExt.length >= 2 ? fileExt.pop() : '';
}
