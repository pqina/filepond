import { createAnimator } from '../utils/createAnimator';
import { forin } from '../../../utils/forin';
import { addGetSet } from './utils/addGetSet';

// add to state,
// add getters and setters to internal and external api (if not set)
// setup animators

export const animations = ({
    mixinConfig,
    viewProps,
    viewInternalAPI,
    viewExternalAPI
}) => {
    // initial properties
    const initialProps = { ...viewProps };

    // list of all active animations
    const animations = [];

    // setup animators
    forin(mixinConfig, (property, animation) => {
        const animator = createAnimator(animation);
        if (!animator) {
            return;
        }

        // when the animator updates, update the view state value
        animator.onupdate = value => {
            viewProps[property] = value;
        };

        // set animator target
        animator.target = initialProps[property];

        // when value is set, set the animator target value
        const prop = {
            key: property,
            setter: value => {

                // if already at target, we done!
                if (animator.target === value) {
                    return;
                }

                animator.target = value;
            },
            getter: () => viewProps[property]
        };

        // add getters and setters
        addGetSet([prop], [viewInternalAPI, viewExternalAPI], viewProps, true);

        // add it to the list for easy updating from the _write method
        animations.push(animator);
    });

    // expose internal write api
    return {
        write: ts => {
            let skipToEndState = document.hidden;
            let resting = true;
            animations.forEach(animation => {
                if (!animation.resting) resting = false;
                animation.interpolate(ts, skipToEndState);
            });
            return resting;
        },
        destroy: () => {}
    };
};
