const IS_BROWSER = (() => typeof window !== 'undefined' && typeof window.document !== 'undefined')();
export const isBrowser = () => IS_BROWSER;