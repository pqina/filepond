import { createView, createRoute } from '../frame/index';
import { list } from './list';

const create = ({ root, props }) => {
    root.ref.list = root.appendChildView(root.createChildView(list));
    props.dragCoordinates = null;
    props.overflowing = false;
};

const storeDragCoordinates = ({ root, props, action }) => {
    if (!root.query('GET_ITEM_INSERT_LOCATION_FREEDOM')) return;
    props.dragCoordinates = {
        left: action.position.scopeLeft - root.ref.list.rect.element.left,
        top: action.position.scopeTop - (root.rect.outer.top + root.rect.element.marginTop + root.rect.element.scrollTop)
    };
};

const clearDragCoordinates = ({ props }) => {
    props.dragCoordinates = null;
};

const route = createRoute({
    DID_DRAG: storeDragCoordinates,
    DID_END_DRAG: clearDragCoordinates
});

const write = ({ root, props, actions }) => {

    // route actions
    route({ root, props, actions });

    // current drag position
    root.ref.list.dragCoordinates = props.dragCoordinates;
    
    // if currently overflowing but no longer received overflow
    if (props.overflowing && !props.overflow) {
        props.overflowing = false;

        // reset overflow state
        root.element.dataset.state = '';
        root.height = null;
    }

    // if is not overflowing currently but does receive overflow value
    if (props.overflow) {
        const newHeight = Math.round(props.overflow);
        if (newHeight !== root.height) {
            props.overflowing = true;
            root.element.dataset.state = 'overflow';
            root.height = newHeight;
        }
    }

};

export const listScroller = createView({
    create,
    write,
    name: 'list-scroller',
    mixins: {
        apis: ['overflow' , 'dragCoordinates'],
        styles: ['height', 'translateY'],
        animations: {
            translateY: 'spring'
        }
    }
});
