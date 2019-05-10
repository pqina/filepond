import { createView } from '../frame/index';
import { isBoolean } from '../../utils/isBoolean';

const PANEL_SPRING_PROPS = { type: 'spring', damping: 0.6, mass: 7 };

const create = ({ root, props }) => {
    [
        {
            name: 'top'
        },
        {
            name: 'center',
            props: {
                translateY: null,
                scaleY: null
            },
            mixins: {
                animations: {
                    scaleY: PANEL_SPRING_PROPS
                },
                styles: ['translateY', 'scaleY']
            }
        },
        {
            name: 'bottom',
            props: {
                translateY: null
            },
            mixins: {
                animations: {
                    translateY: PANEL_SPRING_PROPS
                },
                styles: ['translateY']
            }
        }
    ].forEach(section => {
        createSection(root, section, props.name);
    });

    root.element.classList.add(`filepond--${props.name}`);

    root.ref.scalable = null;
};

const createSection = (root, section, className) => {

    const viewConstructor = createView({
        name: `panel-${section.name} filepond--${className}`,
        mixins: section.mixins,
        ignoreRectUpdate: true
    });

    const view = root.createChildView(viewConstructor, section.props);

    root.ref[section.name] = root.appendChildView(view);
};

const write = ({ root, props }) => {

    // update scalable state
    if (root.ref.scalable === null || props.scalable !== root.ref.scalable) {
        root.ref.scalable = isBoolean(props.scalable)
            ? props.scalable
            : true;
        root.element.dataset.scalable = root.ref.scalable;
    }
    
    // no height, can't set
    if (!props.height) return;

    // get child rects
    const topRect = root.ref.top.rect.element;
    const bottomRect = root.ref.bottom.rect.element;

    // make sure height never is smaller than bottom and top seciton heights combined (will probably never happen, but who knows)
    const height = Math.max(topRect.height + bottomRect.height, props.height);

    // offset center part
    root.ref.center.translateY = topRect.height;

    // scale center part
    // use math ceil to prevent transparent lines because of rounding errors
    root.ref.center.scaleY =
        (height - topRect.height - bottomRect.height) / 100;

    // offset bottom part
    root.ref.bottom.translateY = height - bottomRect.height;
};

export const panel = createView({
    name: 'panel',
    write,
    create,
    ignoreRect: true,
    mixins: {
        apis: ['height', 'scalable']
    }
});
