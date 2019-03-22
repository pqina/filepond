import { spring } from './animators/spring';
import { tween } from './animators/tween';

const animator = {
    spring,
    tween
};

/*
 { type: 'spring', stiffness: .5, damping: .75, mass: 10 };
 { translation: { type: 'spring', ... }, ... }
 { translation: { x: { type: 'spring', ... } } }
*/
export const createAnimator = (definition, category, property) => {
    // default is single definition
    // we check if transform is set, if so, we check if property is set
    const def =
        definition[category] &&
        typeof definition[category][property] === 'object'
            ? definition[category][property]
            : definition[category] || definition;

    const type = typeof def === 'string' ? def : def.type;
    const props = typeof def === 'object' ? { ...def } : {};

    return animator[type] ? animator[type](props) : null;
};
