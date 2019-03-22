export const fromCamels = (string, separator = '-') =>
    string
        .split(/(?=[A-Z])/)
        .map(part => part.toLowerCase())
        .join(separator);
