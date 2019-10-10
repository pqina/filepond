import { createView, createRoute } from '../frame/index';
import { fileWrapper } from './fileWrapper';
import { panel } from './panel';

const ITEM_TRANSLATE_SPRING = {
    type: 'spring',
    stiffness: 0.75,
    damping: 0.45,
    mass: 10
}

const ITEM_SCALE_SPRING = 'spring';


const StateMap = {
    DID_START_ITEM_LOAD: 'busy',
    DID_UPDATE_ITEM_LOAD_PROGRESS: 'loading',
    DID_THROW_ITEM_INVALID: 'load-invalid',
    DID_THROW_ITEM_LOAD_ERROR: 'load-error',
    DID_LOAD_ITEM: 'idle',
    DID_THROW_ITEM_REMOVE_ERROR: 'remove-error',
    DID_START_ITEM_REMOVE: 'busy',
    DID_START_ITEM_PROCESSING: 'busy',
    DID_REQUEST_ITEM_PROCESSING: 'busy',
    DID_UPDATE_ITEM_PROCESS_PROGRESS: 'processing',
    DID_COMPLETE_ITEM_PROCESSING: 'processing-complete',
    DID_THROW_ITEM_PROCESSING_ERROR: 'processing-error',
    DID_THROW_ITEM_PROCESSING_REVERT_ERROR: 'processing-revert-error',
    DID_ABORT_ITEM_PROCESSING: 'cancelled',
    DID_REVERT_ITEM_PROCESSING: 'idle'
};

/**
 * Creates the file view
 */
const create = ({ root, props }) => {

    // select
    root.ref.handleClick = () => root.dispatch('DID_ACTIVATE_ITEM', { id: props.id });

    // set id
    root.element.id = `filepond--item-${props.id}`;
    root.element.addEventListener('click', root.ref.handleClick);
    
    // file view
    root.ref.container = root.appendChildView(
        root.createChildView(fileWrapper, { id: props.id })
    );

    // file panel
    root.ref.panel = root.appendChildView(
        root.createChildView(panel, { name: 'item-panel' })
    );

    // default start height
    root.ref.panel.height = null;

    // by default not marked for removal
    props.markedForRemoval = false;

    // is the item currently being dragged
    props.isDragging = false;










    const grab = e => {

        const origin = {
            x: e.pageX,
            y: e.pageY
        };

        root.dispatch('DID_GRAB_ITEM', { id: props.id, offset: origin });

        const drag = e => {
            root.dispatch('DID_DRAG_ITEM', { id: props.id, offset: {
                x: e.pageX - origin.x,
                y: e.pageY - origin.y
            }});
        };
    
        const drop = () => {
    
            root.dispatch('DID_DROP_ITEM', { id: props.id, offset: {
                x: e.pageX - origin.x,
                y: e.pageY - origin.y
            }});
    
            window.removeEventListener('mousemove', drag);
            window.removeEventListener('mouseup', drop);
        };
    
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', drop);
    }

    root.element.addEventListener('mousedown', grab);
};

const route = createRoute({
    DID_UPDATE_PANEL_HEIGHT: ({ root, action }) => {
        root.height = action.height;
    }
});

const write = createRoute({
    DID_GRAB_ITEM: ({ root, action, props }) => {
        // set is dragging to true so the position of the item is no longer updated in the list  view
        props.isDragging = true;

        // remember the item offset at the start of dragging so we can correctly position the item while dragging
        root.ref.offsetX = root.translateX;
        root.ref.offsetY = root.translateY;
    },
    DID_DRAG_ITEM: ({ root, action, props }) => {
        // we use the original offset and the action offset to calculate the new drag position
        root.translateX = root.ref.offsetX + action.offset.x;
        root.translateY = root.ref.offsetY + action.offset.y;
    },
    DID_DROP_ITEM: ({ root, action, props }) => {
        // item is dropped, the list view may now position it
        props.isDragging = false;
    }
}, ({ root, actions, props, shouldOptimize }) => {

    // select last state change action
    let action = actions.concat()
        .filter(action => /^DID_/.test(action.type))
        .reverse()
        .find(action => StateMap[action.type]);

    // no need to set same state twice
    if (action && action.type !== props.currentState) {
            
        // set current state
        props.currentState = action.type;

        // set state
        root.element.dataset.filepondItemState = StateMap[props.currentState] || '';
    }

    // route actions
    const aspectRatio = root.query('GET_ITEM_PANEL_ASPECT_RATIO') || root.query('GET_PANEL_ASPECT_RATIO');
    if (!aspectRatio) {
        route({ root, actions, props });
        if (!root.height && root.ref.container.rect.element.height > 0) {
            root.height = root.ref.container.rect.element.height;
        }
    }
    else if (!shouldOptimize) {
        root.height = root.rect.element.width * aspectRatio;
    }
    
    // sync panel height with item height
    if (shouldOptimize) {
        root.ref.panel.height = null;
    }

    root.ref.panel.height = root.height;
    // // select last state change action
    // let action = actions.concat()
    //     .filter(action => /^DID_/.test(action.type))
    //     .reverse()
    //     .find(action => StateMap[action.type]);

    // // no need to set same state twice
    // if (!action || (action && action.type === props.currentState)) return;
    
    // // set current state
    // props.currentState = action.type;

    // // set state
    // root.element.dataset.filepondItemState = StateMap[props.currentState] || '';
});

export const item = createView({
    create,
    write,
    destroy: ({ root, props }) => {
        root.element.removeEventListener('click', root.ref.handleClick);
        root.dispatch('RELEASE_ITEM', { query: props.id });
    },
    tag: 'li',
    name: 'item',
    mixins: {
        apis: ['id', 'interactionMethod', 'markedForRemoval', 'isDragging', 'spawnDate'],
        styles: [
            'translateX',
            'translateY',
            'scaleX',
            'scaleY',
            'opacity',
            'height'
        ],
        animations: {
            scaleX: ITEM_SCALE_SPRING,
            scaleY: ITEM_SCALE_SPRING,
            translateX: ITEM_TRANSLATE_SPRING,
            translateY: ITEM_TRANSLATE_SPRING,
            opacity: { type: 'tween', duration: 150 }
        }
    }
});
