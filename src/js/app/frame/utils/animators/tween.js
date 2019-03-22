import { createObject } from '../../../../utils/createObject';
import { easeInOutQuad } from './easing';

export const tween =
    // default values
    ({ duration = 500, easing = easeInOutQuad, delay = 0 } = {}) =>
        // method definition
        {
            let start = null;
            let t;
            let p;
            let resting = true;
            let reverse = false;
            let target = null;

            const interpolate = ts => {
                if (resting || target === null) {
                    return;
                }

                if (start === null) {
                    start = ts;
                }

                if (ts - start < delay) {
                    return;
                }

                t = ts - start - delay;

                if (t < duration) {
                    p = t / duration;
                    api.onupdate(
                        (t >= 0 ? easing(reverse ? 1 - p : p) : 0) * target
                    );
                } else {
                    t = 1;
                    p = reverse ? 0 : 1;
                    api.onupdate(p * target);
                    api.oncomplete(p * target);
                    resting = true;
                }
            };

            // need 'api' to call onupdate callback
            const api = createObject({
                interpolate,
                target: {
                    get: () => (reverse ? 0 : target),
                    set: value => {
                        // is initial value
                        if (target === null) {
                            target = value;
                            api.onupdate(value);
                            api.oncomplete(value);
                            return;
                        }

                        // want to tween to a smaller value and have a current value
                        if (value < target) {
                            target = 1;
                            reverse = true;
                        } else {
                            // not tweening to a smaller value
                            reverse = false;
                            target = value;
                        }

                        // let's go!
                        resting = false;
                        start = null;
                    }
                },
                resting: {
                    get: () => resting
                },
                onupdate: value => {},
                oncomplete: value => {}
            });

            return api;
        };
