import { arrayAddUnique, arrayRemove } from '../../utils/array.js';
import { pubsub } from '../../utils/pubsub.js';

export function createAnimationGuard() {
    const { on, pub } = pubsub();

    let testResult = true;

    let preventRunAnimations: string[] = [];

    return {
        on,

        register(key: string) {
            let timerId: ReturnType<typeof setTimeout>;

            return {
                prevent() {
                    // prevent for this key
                    preventRunAnimations = arrayAddUnique(preventRunAnimations, key);

                    // currently can't run animations as we just pushed a new key to the array, so if we could run animations previously we should fire event
                    if (testResult) {
                        testResult = false;
                        pub('change', testResult);
                    }

                    // we prevent animation for one "frame"
                    // using timeout instead of requestAnimationFrame works better when combined with ResizeObserver
                    clearTimeout(timerId);
                    timerId = setTimeout(() => {
                        // remove key
                        preventRunAnimations = arrayRemove(
                            preventRunAnimations,
                            (item: any) => item === key
                        );

                        // can run animations if array is empty
                        const result = preventRunAnimations.length === 0;
                        if (result !== testResult) {
                            testResult = result;
                            pub('change', testResult);
                        }
                    }, 100);
                },
            };
        },
    };
}
