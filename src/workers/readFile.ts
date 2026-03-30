/** File encoding function that can run in a separate thread */
export function readFile(
    file: File,
    cb: (error: ProgressEvent | null, res?: { dataURL: string }) => void,
    { onprogress }: { onprogress: (e: ProgressEvent) => void }
) {
    const reader = new FileReader();
    reader.onprogress = onprogress;
    reader.onloadend = () => cb(null, { dataURL: reader.result as string });
    reader.onerror = (error) => cb(error);
    reader.readAsDataURL(file);
}

readFile.fileName = 'readFile';
