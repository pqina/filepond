import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import { type Rect } from '../../utils/rect.js';
import FilePondDropArea from './index.svelte';
import { roundPrecision } from '../../utils/math.js';
import styles from './index.css?inline';
import elementPaneStyles from '../components/ElementPane/index.css?inline';
import type { Bounds } from '../../utils/bounds.js';

export interface FilePondDropAreaElementEventMap {
    rectchange: CustomEvent<Bounds>;
}

interface FilePondDropAreaElementEvents {
    addEventListener<K extends keyof FilePondDropAreaElementEventMap>(
        type: K,
        listener: (
            this: FilePondDropAreaElement,
            event: FilePondDropAreaElementEventMap[K]
        ) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
}

/**
 * FilePondDropAreaElement
 *
 * @event {CustomEvent<Bounds>} 'rectchange' - Fired when the drop area element rect is updated.
 */
export class FilePondDropAreaElement
    extends FilePondSvelteComponentElement
    implements FilePondDropAreaElementEvents
{
    constructor() {
        super(FilePondDropArea, {
            styles: [styles, elementPaneStyles],
        });
    }

    connectedCallback() {
        super.connectedCallback();

        let lastHeight: number | null;
        let lastWidth: number | null;

        this._app.setComputeRectCallback((rect: Rect | undefined) => {
            if (!rect) {
                return;
            }
            this.dispatchEvent(new CustomEvent('rectcompute', { detail: rect }));
        });

        this._app.setUpdateRectCallback((rect: Rect | undefined) => {
            if (!rect) {
                return;
            }

            // so we not too many events are fired only on .1 change
            const width = rect ? roundPrecision(rect.width, 1) : null;
            const height = rect ? roundPrecision(rect.height, 1) : null;
            if (width === lastWidth && height === lastHeight) {
                return;
            }
            lastWidth = width;
            lastHeight = height;

            this.dispatchEvent(new CustomEvent('rectchange', { detail: rect }));
        });
    }
}
