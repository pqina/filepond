import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import FilePondDropIndicatorApp from './index.svelte';
import styles from './index.css?inline';
import elementPaneStyles from '../components/ElementPane/index.css?inline';
import type { Rect } from '../../utils/rect.js';
import { setBooleanAttribute } from '../../utils/dom.js';

export class FilePondDropIndicatorElement extends FilePondSvelteComponentElement {
    constructor() {
        super(FilePondDropIndicatorApp, { styles: [styles, elementPaneStyles] });
    }

    connectedCallback(): void {
        super.connectedCallback();

        this.addListener('indicatorenter', () => {
            setBooleanAttribute(this, 'indicating', true);
        });

        this.addListener('indicatorleave', () => {
            setBooleanAttribute(this, 'indicating', false);
        });
    }

    /** Updates the current location of the drop indicator */
    set indicatorRect(rect: Rect | null) {
        if (!this._app) {
            return;
        }

        this._app.setIndicatorRect(rect);
    }
}
