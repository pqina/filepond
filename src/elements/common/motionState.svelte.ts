import type { ReducedMotionPreference } from '../../types/index.js';
import { addListener } from '../../utils/dom.js';
import { pubsub } from '../../utils/pubsub.js';
import { isBrowser } from '../../utils/test.js';
import { createMotionGuard } from './motionGuard.js';

export interface MotionStateObserver {
    destroy: () => void;
    getState: () => MotionState;
    shouldReduceMotion: (preference: ReducedMotionPreference) => boolean;
}

export interface MotionState {
    prefersReducedMotion: boolean | undefined;
    reduceMotion: boolean;
}

const state: MotionState = $state({
    prefersReducedMotion: undefined,
    reduceMotion: false,
});

const motionGuard = createMotionGuard({ timeout: 100 });
motionGuard.on('change', (reduceMotion) => {
    state.reduceMotion = reduceMotion;
});

// window resizing interaction
let unsubResize: () => void;
const windowGuard = motionGuard.register('window');
function handleWindowInteraction() {
    windowGuard.prevent();
}

// media queries
let reducedMotionMediaQuery: MediaQueryList | null = null;
function handleReduceMotionMediaQueryChange() {
    if (!reducedMotionMediaQuery) {
        return;
    }

    state.prefersReducedMotion = reducedMotionMediaQuery.matches;
}

// start listening
function start() {
    if (!isBrowser()) {
        return;
    }

    // window resizing
    unsubResize = addListener(window, 'resize', handleWindowInteraction);

    // reduce motion media query
    reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionMediaQuery.addEventListener('change', handleReduceMotionMediaQueryChange);
    handleReduceMotionMediaQueryChange();
}

// stop listening
function stop() {
    // window resizing
    unsubResize?.();

    // reduce motion media query
    reducedMotionMediaQuery?.removeEventListener('change', handleReduceMotionMediaQueryChange);
    reducedMotionMediaQuery = null;
}

let activeObservers = 0;
export function createMotionStateObserver() {
    if (activeObservers === 0) {
        start();
    }

    activeObservers++;

    return {
        get current() {
            return state;
        },
        destroy() {
            activeObservers--;
            if (activeObservers === 0) {
                stop();
            }
        },
    };
}

export function shouldReduceMotion(
    state: MotionState,
    preference: ReducedMotionPreference = 'auto'
) {
    if (preference === 'on' || preference === '') {
        return true;
    }

    if (preference === 'off') {
        return state.reduceMotion;
    }

    // assume is 'auto'
    return state.prefersReducedMotion || state.reduceMotion;
}
