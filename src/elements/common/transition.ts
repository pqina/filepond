import { passthrough } from '../../utils/placeholder.js';

export function fade(
    node: HTMLElement,
    options?: { duration?: number; easing?: (t: number) => number }
) {
    const { duration = 500, easing = passthrough } = options ?? {};
    return {
        duration,
        easing,
        tick: (t: number) => (node.style.opacity = `${t}`),
    };
}
