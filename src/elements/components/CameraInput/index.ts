export { default as CameraInput } from './index.svelte';

import type { SpringOptions } from '../../../types/index.js';

import { extendShadowRootStyles } from '../../common/extendStyles.js';
import styles from './index.css?inline';
extendShadowRootStyles(styles);

export interface CameraInputOptions {
    name: string;
    required?: boolean;

    reduceMotion?: boolean;
    springOptions?: SpringOptions;

    labelCapture?: string;
    labelReset?: string;

    onerror?: (err: Error) => void;
    oncapture?: (file: File) => void;

    filename?: ((blob: Blob) => string) | string | undefined;
    blobOptions?: {
        type?: string;
        quality?: number;
    };
}
