const hasQS = str => /\?/.test(str);
export const buildURL = (...parts) => {
    let url = '';
    parts.forEach(part => {
        url += hasQS(url) && hasQS(part) ? part.replace(/\?/, '&') : part;
    });
    return url;
}