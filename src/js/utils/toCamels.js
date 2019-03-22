export const toCamels = (string, separator = '-') =>
    string.replace(new RegExp(`${separator}.`, 'g'), sub =>
        sub.charAt(1).toUpperCase()
    );
