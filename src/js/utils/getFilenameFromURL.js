export const getFilenameFromURL = url =>
    url
        .split('/')
        .pop()
        .split('?')
        .shift();
