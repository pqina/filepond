import { createView } from '../frame/index';

export const blob = createView({
    name: 'drip-blob',
    ignoreRect: true,
    mixins: {
        styles: ['translateX', 'translateY', 'scaleX', 'scaleY', 'opacity'],
        animations: {
            scaleX: 'spring',
            scaleY: 'spring',
            translateX: 'spring',
            translateY: 'spring',
            opacity: { type: 'tween', duration: 250 }
        }
    }
});
