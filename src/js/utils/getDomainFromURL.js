export const getDomainFromURL = url => {
    if (url.indexOf('//') === 0) {
        url = location.protocol + url;
    }
    return url
        .toLowerCase()
        .replace('blob:', '')
        .replace(/([a-z])?:\/\//, '$1')
        .split('/')[0];
};
