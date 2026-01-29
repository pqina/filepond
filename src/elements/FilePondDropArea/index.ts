import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import { type Rect } from '../../utils/rect.js';
import FilePondDropArea from './index.svelte';
import { roundPrecision } from '../../utils/math.js';
import styles from './index.css?inline';
import elementPaneStyles from '../components/ElementPane/index.css?inline';

export class FilePondDropAreaElement extends FilePondSvelteComponentElement {
    constructor() {
        super(FilePondDropArea, {
            styles: [styles, elementPaneStyles],
        });
    }

    connectedCallback() {
        super.connectedCallback();

        // const didRunConnect = super.connectedCallback();
        // if (didRunConnect === false) {
        //     return false;
        // }

        let lastHeight: number | null;
        let lastWidth: number | null;

        this._app.setComputeRectCallback((rect: Rect | undefined) => {
            if (!rect) {
                return;
            }
            this.dispatchEvent(new CustomEvent('computerect', { detail: rect }));
        });

        this._app.setUpdateRectCallback((rect: Rect | undefined) => {
            if (!rect) {
                return;
            }
            const width = rect ? roundPrecision(rect.width, 1) : null;
            const height = rect ? roundPrecision(rect.height, 1) : null;
            if (width === lastWidth && height === lastHeight) {
                return;
            }
            lastWidth = width;
            lastHeight = height;
            this.dispatchEvent(new CustomEvent('updaterect', { detail: rect }));
        });
    }
}
