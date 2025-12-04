import { createAnimationGuard } from './animationGuard.js';
import { isBrowser } from '../../utils/test.js';
import { addListener } from '../../utils/dom.js';

// shared
let globalPreventAnimations: boolean | null = $state(null);

// we track if user is dragging something, if so we still animate while scrolling
const activePointers = new Set();
if (isBrowser()) {
    function addPointer(e: PointerEvent) {
        activePointers.add(e.pointerId);
    }
    function deletePointer(e: PointerEvent) {
        activePointers.delete(e.pointerId);
    }
    addListener(window, 'pointerdown', addPointer);
    addListener(window, 'pointerup', deletePointer);
    addListener(window, 'pointercancel', deletePointer);
}

// this global animation guard halts animations when the window is interacted with
const animationGuard = createAnimationGuard();
animationGuard.on('change', handleAnimationGuardStateChange);
function handleAnimationGuardStateChange(allowAnimations: boolean) {
    globalPreventAnimations = !allowAnimations;
}

const windowGuard = animationGuard.register('window');
function handleWindowInteraction() {
    windowGuard.prevent();
}

// we need two scroll to prevent animations, otherwise a content change in the window while a scrollbar is active (for example when removing an item) will stop animations from running
let scrollCounter = 0;
function handleScrollInteraction() {
    if (activePointers.size > 0) {
        return;
    }
    scrollCounter++;
    if (scrollCounter > 1) {
        scrollCounter = 0;
        windowGuard.prevent();
    }
}

// global listeners
let shouldReduceMotion = $state(false);
if (isBrowser()) {
    window.addEventListener('scroll', handleScrollInteraction);
    window.addEventListener('resize', handleWindowInteraction);

    // listen for reduce motion changes
    const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    shouldReduceMotion = reducedMotionMediaQuery.matches;
    reducedMotionMediaQuery.addEventListener('change', () => {
        shouldReduceMotion = reducedMotionMediaQuery.matches;
    });
}

export function createAnimationState(initial: 'auto' | 'always' | 'never' = 'auto') {
    // current perference
    let preference = $state(initial);

    // determines if should animate
    const animationState = $derived.by(() => {
        const shouldAnimate = !globalPreventAnimations;
        const mayAnimate = !shouldReduceMotion;

        // auto
        if (preference === 'auto') {
            return mayAnimate && shouldAnimate;
        }
        // always
        else if (preference === 'always') {
            return shouldAnimate;
        }

        // never
        return false;
    });

    return {
        setPreference(value: 'auto' | 'always' | 'never') {
            preference = value;
        },
        get current() {
            return animationState;
        },
    };
}
