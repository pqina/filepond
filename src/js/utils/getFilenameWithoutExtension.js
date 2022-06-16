export const getFilenameWithoutExtension = name =>
    name.substring(0, name.lastIndexOf('.')) || name;
