import { createView, createRoute } from '../frame/index';
import { attr } from '../../utils/attr';
import { createElement } from '../../utils/createElement';
import { Key } from '../enum/Key';

const create = ({ root, props }) => {
    // create the label and link it to the file browser
    const label = createElement('label');
    attr(label, 'for', `filepond--browser-${props.id}`);

    // use for labeling file input (aria-labelledby on file input)
    attr(label, 'id', `filepond--drop-label-${props.id}`);

    // handle keys
    root.ref.handleKeyDown = e => {
        const isActivationKey = e.keyCode === Key.ENTER || e.keyCode === Key.SPACE;
        if (!isActivationKey) return;
        // stops from triggering the element a second time
        e.preventDefault();

        // click link (will then in turn activate file input)
        root.ref.label.click();
    };

    root.ref.handleClick = e => {
        const isLabelClick = e.target === label || label.contains(e.target);

        // don't want to click twice
        if (isLabelClick) return;

        // click link (will then in turn activate file input)
        root.ref.label.click();
    };

    // attach events
    label.addEventListener('keydown', root.ref.handleKeyDown);
    root.element.addEventListener('click', root.ref.handleClick);

    // update
    updateLabelValue(label, props.caption);

    // add!
    root.appendChild(label);
    root.ref.label = label;
};

const updateLabelValue = (label, value) => {
    label.innerHTML = value;
    const clickable = label.querySelector('.filepond--label-action');
    if (clickable) {
        attr(clickable, 'tabindex', '0');
    }
    return value;
};

export const dropLabel = createView({
    name: 'drop-label',
    ignoreRect: true,
    create,
    destroy: ({ root }) => {
        root.ref.label.addEventListener('keydown', root.ref.handleKeyDown);
        root.element.removeEventListener('click', root.ref.handleClick);
    },
    write: createRoute({
        DID_SET_LABEL_IDLE: ({ root, action }) => {
            updateLabelValue(root.ref.label, action.value);
        },
    }),
    mixins: {
        styles: ['opacity', 'translateX', 'translateY'],
        animations: {
            opacity: { type: 'tween', duration: 150 },
            translateX: 'spring',
            translateY: 'spring',
        },
    },
});
