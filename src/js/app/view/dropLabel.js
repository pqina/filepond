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

    // hide the label for screenreaders, the input element will read the contents of the label when it's focussed. If we don't set aria-hidden the screenreader will also navigate the contents of the label separately from the input.
    attr(label, 'aria-hidden', 'true');

    // handle keys
    const handleKeydown = e => {
        const isActivationKey = e.keyCode === Key.ENTER || e.keyCode === Key.SPACE;
        if (!isActivationKey) return;
        // stops from triggering the element a second time
        e.preventDefault();

        // click link (will then in turn activate file input)
        root.ref.label.click();
    }
    label.addEventListener('keydown', handleKeydown);

    const handleClick = e => {
        const isLabelClick = e.target === label || label.contains(e.target);

        // don't want to click twice
        if (isLabelClick) return;

        // click link (will then in turn activate file input)
        root.ref.label.click();
    }
    root.element.addEventListener('click', handleClick);
    
    // TODO: call this destroy method when the parent is destroyed.
    label.destroy = () => {
        label.removeEventListener('keydown', handleKeydown);
        root.element.removeEventListener('click', handleKeydown);
    }

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
    write: createRoute({
        DID_SET_LABEL_IDLE: ({ root, action }) => {
            updateLabelValue(root.ref.label, action.value);
        }
    }),
    mixins: {
        styles: ['opacity', 'translateX', 'translateY'],
        animations: {
            opacity: { type: 'tween', duration: 150 },
            translateX: 'spring',
            translateY: 'spring'
        }
    }
});
