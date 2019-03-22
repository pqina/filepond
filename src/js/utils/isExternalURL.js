import { getDomainFromURL } from './getDomainFromURL';
export const isExternalURL = url =>
    (url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
    getDomainFromURL(location.href) !== getDomainFromURL(url);
