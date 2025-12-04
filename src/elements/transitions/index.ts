import { linear } from 'svelte/easing';

/** We fade with tick instead of css so svelte doesn't generate a style tag */
export function prop(
    node: HTMLElement,
    options: { prop?: string; duration?: number; easing?: (t: number) => number }
) {
    const { prop = '--progress', duration = 1000, easing = linear } = options ?? {};

    /** Animates a property from 0 to 1 */
    const tick = (t: number) => {
        node.style.setProperty(prop, `${t}`);
    };

    return {
        duration,
        easing,
        tick,
    };
}
