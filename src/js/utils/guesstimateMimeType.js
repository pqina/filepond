const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
const text = ['css', 'csv', 'html', 'txt'];
const map = {
    zip: 'zip|compressed',
    epub: 'application/epub+zip'
};

export const guesstimateMimeType = (extension = '') => {
    extension = extension.toLowerCase();
    if (images.includes(extension)) {
        return (
            'image/' +
            (extension === 'jpg'
                ? 'jpeg'
                : extension === 'svg' ? 'svg+xml' : extension)
        );
    }
    if (text.includes(extension)) {
        return 'text/' + extension;
    }

    return map[extension] || '';
};
