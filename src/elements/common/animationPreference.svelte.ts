import { createAnimationGuard } from './animationGuard.js';
import { isBrowser } from '../../utils/test.js';
import { addListener } from '../../utils/dom.js';

// shared
let globalPreventAnimations: { current: boolean | null } = $state({ current: null });

// we track if user is dragging something, if so we still animate while scrolling
const pointerUnsubs: (() => void)[] = [];
const activePointers = new Set();
function addPointer(e: PointerEvent) {
    activePointers.add(e.pointerId);
}

function deletePointer(e: PointerEvent) {
    activePointers.delete(e.pointerId);
}

// this global animation guard halts animations when the window is interacted with
const animationGuard = createAnimationGuard();
animationGuard.on('change', handleAnimationGuardStateChange);
function handleAnimationGuardStateChange(allowAnimations: boolean) {
    globalPreventAnimations.current = !allowAnimations;
}

const windowGuard = animationGuard.register('window');
function handleWindowInteraction() {
    windowGuard.prevent();
}

// we need two scroll to prevent animations, otherwise a content change in the window while a scrollbar is active (for example when removing an item) will stop animations from running
// currently disabled because this causes some issues with images not fading in when scrolling into view
// let scrollCounter = 0;
// function handleScrollInteraction() {
//     if (activePointers.size > 0) {
//         return;
//     }
//     scrollCounter++;
//     if (scrollCounter > 1) {
//         scrollCounter = 0;
//         windowGuard.prevent();
//     }
// }

// window resizing
let unsubResize: () => void;

// media queries
let reducedMotionMediaQuery: MediaQueryList | null = null;
let shouldReduceMotion = $state({ current: false });
function handleReduceMotionMediaQueryChange() {
    if (!reducedMotionMediaQuery) {
        return;
    }
    shouldReduceMotion.current = reducedMotionMediaQuery.matches;
}

// start listening
function start() {
    if (!isBrowser()) {
        return;
    }

    // tracking pointers
    pointerUnsubs.push(
        addListener(window, 'pointerdown', addPointer),
        addListener(window, 'pointerup', deletePointer),
        addListener(window, 'pointercancel', deletePointer)
    );

    // listen for reduce motion changes
    reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionMediaQuery.addEventListener('change', handleReduceMotionMediaQueryChange);
    handleReduceMotionMediaQueryChange();

    // window resizing
    unsubResize = addListener(window, 'resize', handleWindowInteraction);
}

// stop listening
function stop() {
    pointerUnsubs.forEach((unsub) => unsub());
    pointerUnsubs.length = 0;
    unsubResize?.();
    reducedMotionMediaQuery?.removeEventListener('change', handleReduceMotionMediaQueryChange);
    reducedMotionMediaQuery = null;
}

// AnimationModeObserver object
let activeAnimationModeObservers = 0;
export function createAnimationModeObserver() {
    if (activeAnimationModeObservers === 0) {
        start();
    }

    activeAnimationModeObservers++;
    let currentPreference = $state({ current: 'auto' });

    const state = $derived.by(() => {
        const shouldAnimate = !globalPreventAnimations.current;
        const mayAnimate = !shouldReduceMotion.current;

        // auto
        if (currentPreference.current === 'auto') {
            return { current: mayAnimate && shouldAnimate };
        }
        // always
        else if (currentPreference.current === 'always') {
            return { current: shouldAnimate };
        }

        // never
        return { current: false };
    });

    return {
        get current() {
            return state.current;
        },
        setPreference(value: 'auto' | 'always' | 'never' = 'auto') {
            currentPreference = { current: value };
        },
        destroy() {
            activeAnimationModeObservers--;
            if (activeAnimationModeObservers === 0) {
                stop();
            }
        },
    };
}
