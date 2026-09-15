import { isBrowser } from '../../utils/test.js';
import { createStyleSheet } from '../../utils/dom.js';

// stylesheets to adopt by the file-pond-item custom element
const styleSheets: { styleSheet: CSSStyleSheet; rootKeys: string[] }[] = [];

// file pond items shadow roots
const registeredShadowRoots: {
    key: string;
    shadowRoot: ShadowRoot;
    styleSheet: CSSStyleSheet;
}[] = [];

function syncStyles() {
    for (const { shadowRoot, styleSheet: shadowRootStyles, key } of registeredShadowRoots) {
        // merge shadowroot stylesheet with component stylesheets
        shadowRoot.adoptedStyleSheets.push(
            // my styles
            shadowRootStyles,

            // additional styles received from components
            ...styleSheets
                .filter((sheet) => !sheet.rootKeys.length || sheet.rootKeys.includes(key))
                .map((sheet) => sheet.styleSheet)
        );
    }
}

export function extendShadowRootStyles(text: string, ...rootKeys: string[]) {
    if (!isBrowser()) {
        return;
    }
    styleSheets.push({ styleSheet: createStyleSheet(text), rootKeys });
    syncStyles();
}

export function registerShadowRoot(shadowRoot: ShadowRoot, key: string, rootStyles: string) {
    const styleSheet = createStyleSheet(rootStyles);
    registeredShadowRoots.push({ key, shadowRoot, styleSheet });
    syncStyles();
}
