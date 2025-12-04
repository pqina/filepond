import { isBrowser } from '../../utils/test.js';
import { createStyleSheet } from '../../utils/dom.js';

// stylesheets to adopt by the file-pond-item custom element
const styleSheets: CSSStyleSheet[] = [];

// file pond items shadow roots
const registeredShadowRoots: {
    shadowRoot: ShadowRoot;
    styleSheet: CSSStyleSheet;
}[] = [];

// we track if we're already about to sync styles, if so, we don't run this code multiple times
let syncStylesQueued = false;

function syncStyles() {
    if (syncStylesQueued) {
        return;
    }

    syncStylesQueued = true;
    queueMicrotask(sync);

    function sync() {
        for (const { shadowRoot, styleSheet: shadowRootStyles } of registeredShadowRoots) {
            // merge shadowroot stylesheet with component stylesheets
            shadowRoot.adoptedStyleSheets.push(
                // my styles
                shadowRootStyles,

                // additional styles received from components
                ...styleSheets
            );
        }

        syncStylesQueued = false;
    }
}

export function extendShadowRootStyles(text: string) {
    if (!isBrowser()) {
        return;
    }
    styleSheets.push(createStyleSheet(text));
    syncStyles();
}

export function registerShadowRoot(shadowRoot: ShadowRoot, rootStyles: string) {
    const styleSheet = createStyleSheet(rootStyles);
    registeredShadowRoots.push({ shadowRoot, styleSheet });
    syncStyles();
}
