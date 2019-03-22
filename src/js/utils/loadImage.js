export const loadImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = e => {
            reject(e);
        };
        img.src = url;
    });
