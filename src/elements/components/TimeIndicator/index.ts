export { default as TimeIndicator } from './index.svelte';

import { extendShadowRootStyles } from '../../common/extendStyles.js';
import styles from './index.css?inline';
extendShadowRootStyles(styles, 'entry-list');
