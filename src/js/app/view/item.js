import { createView, createRoute } from '../frame/index';
import { fileWrapper } from './fileWrapper';
import { panel } from './panel';
import { createDragHelper } from '../utils/createDragHelper';

// ... (previous code remains unchanged)

const create = ({ root, props }) => {
    // ... (previous code remains unchanged)

    const grab = e => {
        if (!e.isPrimary) return;

        let removedActivateListener = false;

        const origin = {
            x: e.pageX,
            y: e.pageY,
        };

        props.dragOrigin = {
            x: root.translateX,
            y: root.translateY,
        };

        props.dragCenter = {
            x: e.offsetX,
            y: e.offsetY,
        };

        const dragState = createDragHelper(root.query('GET_ACTIVE_ITEMS'));

        root.dispatch('DID_GRAB_ITEM', { id: props.id, dragState });

        const drag = e => {
            if (!e.isPrimary) return;

            e.stopPropagation();
            e.preventDefault();

            props.dragOffset = {
                x: e.pageX - origin.x,
                y: e.pageY - origin.y,
            };

            // if dragged stop listening to clicks, will re-add when done dragging
            const dist =
                props.dragOffset.x * props.dragOffset.x + props.dragOffset.y * props.dragOffset.y;
            if (dist > 16 && !removedActivateListener) {
                removedActivateListener = true;
                root.element.removeEventListener('click', root.ref.handleClick);
            }

            root.dispatch('DID_DRAG_ITEM', { id: props.id, dragState });
        };

        const drop = e => {
            if (!e.isPrimary) return;

            props.dragOffset = {
                x: e.pageX - origin.x,
                y: e.pageY - origin.y,
            };

            dragState.resetDragging();
            reset();
        };

        const cancel = () => {
            dragState.resetDragging();
            reset();
        };

        const reset = () => {
            document.removeEventListener('pointercancel', cancel);
            document.removeEventListener('pointermove', drag);
            document.removeEventListener('pointerup', drop);

            root.dispatch('DID_DROP_ITEM', { id: props.id, dragState });

            // start listening to clicks again
            if (removedActivateListener) {
                setTimeout(() => root.element.addEventListener('click', root.ref.handleClick), 0);
            }
        };

        document.addEventListener('pointercancel', cancel);
        document.addEventListener('pointermove', drag);
        document.addEventListener('pointerup', drop);
    };

    root.element.addEventListener('pointerdown', grab);
};

// ... (rest of the code remains unchanged)