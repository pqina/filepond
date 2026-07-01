import type { Snippet } from 'svelte';
import type { Bounds, Rect, SpringOptions } from '../../../types/index.js';
import type { Vector } from '../../../utils/vector.js';
import type { Size } from '../../../utils/size.js';

export { default as SpringElement } from './index.svelte';

export interface SpringElementOptions {
    /** Defaults to 'div' */
    tag?: string;

    /** Defaults to 'div' */
    subtag?: string;

    /** Part to assign to root element */
    part?: string;

    /** Defaults to {} */
    attrs?: { [key: string]: string | boolean | number | undefined };

    /** Defaults to {} */
    subattrs?: { [key: string]: string | boolean | number | undefined };

    /** Defaults to {} */
    dataset?: { [key: string]: string | boolean | number | undefined };

    /** Defaults to {} */
    styles?: { [key: string]: string | number };

    /** Class to use on outer element */
    class?: string;

    /** Class to use on inner element */
    subclass?: string;

    /** Element translation */
    translation?: Vector;
    /** Element translation origin */
    translationFrom?: Vector;
    /** Element origin scalar */
    scaleFrom?: number;
    /** Element scalar */
    scale?: number;
    /** Element origin opacity */
    opacityFrom?: number;
    /** Element opacity */
    opacity?: number;

    /** Set to `true` if can't be interacted with */
    inert?: boolean | null;

    enableAnimations?: boolean;
    springDefaults?: SpringOptions;
    scaleSpringOptions?: SpringOptions;
    opacitySpringOptions?: SpringOptions;
    translationSpringOptions?: SpringOptions;

    /** Called when root element created */
    onroot?: (root: HTMLElement) => void;

    /** Called on element measure */
    onelementmeasure?: (rect: Rect) => void;

    /** Called on root element measure */
    onmeasure?: (bounds: Bounds) => void;

    /** Called when spring animation ends */
    onspringcomplete?: (state: { opacity: number; scale: number }) => void;

    /** Called when children render state changes */
    onchangerendercontent?: (shouldRenderContent: boolean) => void;

    /** Called before rendering content */
    shouldRenderContent?: (rect: Rect) => boolean;

    /** Spring element children */
    children: Snippet<
        [
            {
                currentSize: Size;
                targetRect: Rect;
                clientRect: Rect | null;
                visualRect: Rect | null;
            },
        ]
    >;
}
