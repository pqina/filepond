export const isFile = value => !!(value instanceof File || (value instanceof Blob && value.name));
