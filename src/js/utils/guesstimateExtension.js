export const guesstimateExtension = type => {
    // if no extension supplied, exit here
    if (typeof type !== 'string') {
        return '';
    }

    // get subtype
    const subtype = type.split('/').pop();

    // is svg subtype
    if (/svg/.test(subtype)) {
        return 'svg';
    }

    if (/zip|compressed/.test(subtype)) {
        return 'zip';
    }

    if (/plain/.test(subtype)) {
        return 'txt';
    }

    if (/msword/.test(subtype)) {
        return 'doc';
    }

    // if is valid subtype
    if (/[a-z]+/.test(subtype)) {
        // always use jpg extension
        if (subtype === 'jpeg') {
            return 'jpg';
        }

        // return subtype
        return subtype;
    }

    return '';
};
