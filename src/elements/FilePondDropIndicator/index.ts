import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import FilePondDropIndicatorApp from './index.svelte';
import styles from './index.css?inline';
import elementPaneStyles from '../components/ElementPane/index.css?inline';
import type { Rect } from '../../utils/rect.js';

export class FilePondDropIndicatorElement extends FilePondSvelteComponentElement {
    constructor() {
        super(FilePondDropIndicatorApp, { styles: [styles, elementPaneStyles] });
    }

    set indicatorRect(rect: Rect) {
        if (!this._app) {
            return;
        }

        this._app.setIndicatorRect(rect);
    }
}
