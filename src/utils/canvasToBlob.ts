export function canvasToBlob(
    canvas: HTMLCanvasElement,
    options?: { type?: string; quality?: number }
): Promise<Blob> {
    const { type, quality } = options || {};
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob === null) {
                    return reject();
                }
                resolve(blob);
            },
            type,
            quality
        );
    });
}
