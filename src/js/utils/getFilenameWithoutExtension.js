export const getFilenameWithoutExtension = name =>
    name.substr(0, name.lastIndexOf('.')) || name;
