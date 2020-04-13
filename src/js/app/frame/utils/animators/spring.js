import { createObject } from '../../../../utils/createObject';
import { isNumber } from '../../../../utils/isNumber';

/**
 * Determines if position is at destination
 * @param position
 * @param destination
 * @param velocity
 * @param errorMargin
 * @returns {boolean}
 */
const thereYet = (position, destination, velocity, errorMargin = 0.001) => {
    return (
        Math.abs(position - destination) < errorMargin &&
        Math.abs(velocity) < errorMargin
    );
};

/**
 * Spring animation
 */
export const spring =
    // default options
    ({ stiffness = 0.5, damping = 0.75, mass = 10 } = {}) =>
        // method definition
        {
            let target = null;
            let position = null;
            let velocity = 0;
            let resting = false;

            // updates spring state
            const interpolate = (ts, skipToEndState) => {

                // in rest, don't animate
                if (resting) return;

                // need at least a target or position to do springy things
                if (!(isNumber(target) && isNumber(position))) {
                    resting = true;
                    velocity = 0;
                    return;
                }

                // calculate spring force
                const f = -(position - target) * stiffness;

                // update velocity by adding force based on mass
                velocity += f / mass;

                // update position by adding velocity
                position += velocity;

                // slow down based on amount of damping
                velocity *= damping;

                // we've arrived if we're near target and our velocity is near zero
                if (thereYet(position, target, velocity) || skipToEndState) {
                    position = target;
                    velocity = 0;
                    resting = true;

                    // we done
                    api.onupdate(position);
                    api.oncomplete(position);
                } else {
                    // progress update
                    api.onupdate(position);
                }
            };

            /**
             * Set new target value
             * @param value
             */
            const setTarget = value => {

                // if currently has no position, set target and position to this value
                if (isNumber(value) && !isNumber(position)) {
                    position = value;
                }

                // next target value will not be animated to
                if (target === null) {
                    target = value;
                    position = value;
                }

                // let start moving to target
                target = value;

                // already at target
                if (position === target || typeof target === 'undefined') {
                    // now resting as target is current position, stop moving
                    resting = true;
                    velocity = 0;

                    // done!
                    api.onupdate(position);
                    api.oncomplete(position);

                    return;
                }

                resting = false;
            };

            // need 'api' to call onupdate callback
            const api = createObject({
                interpolate,
                target: {
                    set: setTarget,
                    get: () => target
                },
                resting: {
                    get: () => resting
                },
                onupdate: value => {},
                oncomplete: value => {}
            });

            return api;
        };
