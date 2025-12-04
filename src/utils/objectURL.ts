export function createObjectURL(v: Blob | MediaSource) {
    return URL.createObjectURL(v);
}

export function revokeObjectURL(v: string) {
    URL.revokeObjectURL(v);
}
