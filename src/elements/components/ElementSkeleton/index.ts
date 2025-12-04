export { default as ElementSkeleton } from './index.svelte';

// used to auto-offset skeleton pulse animation
let instanceCounter = 0;
export function getSkeletonInstanceIndex() {
    return instanceCounter++;
}

import { extendShadowRootStyles } from '../../common/extendStyles.js';
import styles from './index.css?inline';
extendShadowRootStyles(styles);
