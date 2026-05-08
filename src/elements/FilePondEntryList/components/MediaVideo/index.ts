export { default as MediaVideo } from './index.svelte';

import { type Snippet } from 'svelte';

export interface MediaVideoOptions {
    class?: string;

    /** The amount the video should overflow when we move it around */
    overflowAmount?: number;

    /** How to present image in viewer, defaults to 'cover', alternative is 'contain' */
    objectFit?: 'cover' | 'contain';

    /** Enable parallax on media */
    enableParallax?: boolean;

    /** Set to false to enable audio by default */
    mute?: boolean;

    /** Children to render on top of the video */
    children?: Snippet;
}

import { extendShadowRootStyles } from '../../../common/extendStyles.js';
import styles from './index.css?inline';
extendShadowRootStyles(styles);
