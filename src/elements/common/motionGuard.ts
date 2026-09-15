import { arrayAddUnique, arrayRemove } from '../../utils/array.js';
import { pubsub } from '../../utils/pubsub.js';

export function createMotionGuard({ timeout = 100 }) {
    const { on, pub } = pubsub();

    let testResult = true;

    let reduceMotion: string[] = [];

    return {
        on,

        register(key: string) {
            let timerId: ReturnType<typeof setTimeout>;

            return {
                prevent() {
                    // prevent for this key
                    reduceMotion = arrayAddUnique(reduceMotion, key);

                    // currently can't run animations as we just pushed a new key to the array, so if we could run animations previously we should fire event
                    if (testResult) {
                        testResult = false;
                        pub('change', !testResult);
                    }

                    // using timeout instead of requestAnimationFrame works better when combined with ResizeObserver
                    clearTimeout(timerId);
                    timerId = setTimeout(() => {
                        // remove key
                        reduceMotion = arrayRemove(reduceMotion, (item: any) => item === key);

                        // can do motion if array is empty
                        const result = reduceMotion.length === 0;
                        if (result !== testResult) {
                            testResult = result;
                            pub('change', !testResult);
                        }
                    }, timeout);
                },
            };
        },
    };
}
