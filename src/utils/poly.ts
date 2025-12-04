import { noop } from './placeholder.js';
import { isBrowser } from './test.js';

/** So we can use requestIdleCallback on Safari even if it isn't support yet (2024/11) */
export const requestIdleCallback = isBrowser()
    ? window.requestIdleCallback ||
      function requestIdleCallback(cb) {
          setTimeout(cb, 0);
      }
    : noop;
