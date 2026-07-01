import { type Rect } from '../../utils/rect.js';
import { type Bounds } from '../../utils/bounds.js';
import { FilePondSvelteComponentElement } from '../FilePondSvelteComponent/index.svelte.js';
import { roundPrecision } from '../../utils/math.js';
import FilePondFrame from './index.svelte';
import elementPaneStyles from '../components/ElementPane/index.css?inline';
import styles from './index.css?inline';

export interface FilePondFrameElementEventMap {
    rectchange: CustomEvent<Bounds>;
}

interface FilePondFrameElementEvents {
    addEventListener<K extends keyof FilePondFrameElementEventMap>(
        type: K,
        listener: (this: FilePondFrameElement, event: FilePondFrameElementEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;
}

/**
 * FilePondFrameElement the element that "frames" FilePond
 *
 * @event {CustomEvent<Bounds>} 'rectchange' - Fired when the drop area element rect is updated.
 */
export class FilePondFrameElement
    extends FilePondSvelteComponentElement
    implements FilePondFrameElementEvents
{
    constructor() {
        super(FilePondFrame, {
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
