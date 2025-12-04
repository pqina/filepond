import { isBrowser } from '../utils/test.js';

export const HTMLElementSafe: typeof HTMLElement = isBrowser() ? HTMLElement : (class {} as any);

// export const customElementsSafe: CustomElementRegistry = isBrowser()
//     ? customElements
//     : ({
//           define: noop,
//       } as any);
