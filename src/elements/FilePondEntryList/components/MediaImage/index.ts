export { default as MediaImage } from './index.svelte';

export type MediaResizeQuality = 'pixelated' | 'low' | 'medium' | 'high';

export interface MediaImageOptions {
    /** Class to set on root */
    class?: string;

    /** Image maximum size in pixels */
    maximumPixels?: number;

    /** Media height in pixels */
    resizeQuality?: MediaResizeQuality;

    /** How to present image in viewer, defaults to 'cover', alternative is 'contain' */
    objectFit?: 'cover' | 'contain';

    /** The amount we should overflowAmount the image when we move it around */
    overflowAmount?: number;

    /** Enable parralax effects while dragging images */
    enableParallax?: boolean;
}

import { extendShadowRootStyles } from '../../../common/extendStyles.js';
import styles from './index.css?inline';
extendShadowRootStyles(styles);
