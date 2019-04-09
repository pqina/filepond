import { createView } from '../frame/index';
import { attr } from '../../utils/attr';

const create = ({ root, props }) => {
    root.element.innerHTML = (props.icon || '') + `<span>${props.label}</span>`;

    props.isDisabled = false;
};

const write = ({ root, props }) => {

    const { isDisabled } = props;
    const shouldDisable = root.query('GET_DISABLED') || props.opacity === 0;

    if (shouldDisable && !isDisabled) {
        props.isDisabled = true;
        attr(root.element, 'disabled', 'disabled');
    }
    else if (!shouldDisable && isDisabled) {
        props.isDisabled = false;
        root.element.removeAttribute('disabled');
    }
};

export const fileActionButton = createView({
    tag: 'button',
    attributes: {
        type: 'button'
    },
    ignoreRect: true,
    ignoreRectUpdate: true,
    name: 'file-action-button',
    mixins: {
        apis: ['label'],
        styles: ['translateX', 'translateY', 'scaleX', 'scaleY', 'opacity'],
        animations: {
            scaleX: 'spring',
            scaleY: 'spring',
            translateX: 'spring',
            translateY: 'spring',
            opacity: { type: 'tween', duration: 250 }
        },
        listeners: true
    },
    create,
    write
});
