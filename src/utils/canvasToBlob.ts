export function canvasToBlob(
    canvas: HTMLCanvasElement,
    { type, quality }: { type?: string; quality?: number }
): Promise<Blob> {
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
