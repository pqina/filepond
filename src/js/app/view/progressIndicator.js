import { createView } from '../frame/index';
import { createElement } from '../frame/utils/createElement';
import { attr } from '../../utils/attr';
import { percentageArc } from '../../utils/percentageArc';

const create = ({ root, props }) => {
    // start at 0
    props.spin = false;
    props.progress = 0;
    props.opacity = 0;

    // svg
    const svg = createElement('svg');
    root.ref.path = createElement('path', {
        'stroke-width': 2,
        'stroke-linecap': 'round'
    });
    svg.appendChild(root.ref.path);

    root.ref.svg = svg;

    root.appendChild(svg);
};

const write = ({ root, props }) => {

    if (props.opacity === 0) {
        return;
    }

    if (props.align) {
        root.element.dataset.align = props.align;
    }

    // get width of stroke
    const ringStrokeWidth = parseInt(attr(root.ref.path, 'stroke-width'), 10);

    // calculate size of ring
    const size = root.rect.element.width * 0.5;

    // ring state
    let ringFrom = 0;
    let ringTo = 0;

    // now in busy mode
    if (props.spin) {
        ringFrom = 0;
        ringTo = 0.5;
    } else {
        ringFrom = 0;
        ringTo = props.progress;
    }

    // get arc path
    const coordinates = percentageArc(
        size,
        size,
        size - ringStrokeWidth,
        ringFrom,
        ringTo
    );

    // update progress bar
    attr(root.ref.path, 'd', coordinates);

    // hide while contains 0 value
    attr(
        root.ref.path,
        'stroke-opacity',
        props.spin || props.progress > 0 ? 1 : 0
    );
};

export const progressIndicator = createView({
    tag: 'div',
    name: 'progress-indicator',
    ignoreRectUpdate: true,
    ignoreRect: true,
    create,
    write,
    mixins: {
        apis: ['progress', 'spin', 'align'],
        styles: ['opacity'],
        animations: {
            opacity: { type: 'tween', duration: 500 },
            progress: {
                type: 'spring',
                stiffness: 0.95,
                damping: 0.65,
                mass: 10
            }
        }
    }
});
