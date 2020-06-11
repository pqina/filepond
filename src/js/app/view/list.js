import { createView, createRoute } from '../frame/index';
import { InteractionMethod } from '../enum/InteractionMethod';
import { item } from './item';
import { attr } from '../../utils/attr';
import { getItemIndexByPosition } from '../utils/getItemIndexByPosition';
import { dropAreaDimensions } from '../utils/dropAreaDimensions';

const create = ({ root }) => {
    // need to set role to list as otherwise it won't be read as a list by VoiceOver
    attr(root.element, 'role', 'list');

    root.ref.lastItemSpanwDate = Date.now();
};

/**
 * Inserts a new item
 * @param root
 * @param action
 */
const addItemView = ({ root, action }) => {
    const { id, index, interactionMethod } = action;

    root.ref.addIndex = index;

    const now = Date.now();
    let spawnDate = now;
    let opacity = 1;

    if (interactionMethod !== InteractionMethod.NONE) {
        opacity = 0;
        const cooldown = root.query('GET_ITEM_INSERT_INTERVAL');
        const dist = now - root.ref.lastItemSpanwDate;
        spawnDate = dist < cooldown ? now + (cooldown - dist) : now;
    }

    root.ref.lastItemSpanwDate = spawnDate;

    root.appendChildView(
        root.createChildView(
            // view type
            item,

            // props
            {
                spawnDate,
                id,
                opacity,
                interactionMethod
            }
        ),
        index
    );
};

const moveItem = (item, x, y, vx = 0, vy = 1) => {

    // set to null to remove animation while dragging
    if (item.dragOffset) {
        item.translateX = null;
        item.translateY = null;
        item.translateX = item.dragOrigin.x + item.dragOffset.x;
        item.translateY = item.dragOrigin.y + item.dragOffset.y;
        item.scaleX = 1.025;
        item.scaleY = 1.025;
    }
    else {
        item.translateX = x;
        item.translateY = y;

        if (Date.now() > item.spawnDate) {

            // reveal element
            if (item.opacity === 0) {
                introItemView(item, x, y, vx, vy);
            }

            // make sure is default scale every frame
            item.scaleX = 1;
            item.scaleY = 1;
            item.opacity = 1;

        }
    }

}

const introItemView = (item, x, y, vx, vy) => {

    if (item.interactionMethod === InteractionMethod.NONE) {
        item.translateX = null;
        item.translateX = x;
        item.translateY = null;
        item.translateY = y;
    }

    else if (item.interactionMethod === InteractionMethod.DROP) {

        item.translateX = null;
        item.translateX = x - (vx * 20);

        item.translateY = null;
        item.translateY = y - (vy * 10);

        item.scaleX = .8;
        item.scaleY = .8;
    }

    else if (item.interactionMethod === InteractionMethod.BROWSE) {
        item.translateY = null;
        item.translateY = y - 30;
    }

    else if (item.interactionMethod === InteractionMethod.API) {
        item.translateX = null;
        item.translateX = x - 30;
        item.translateY = null;
    }

}

/**
 * Removes an existing item
 * @param root
 * @param action
 */
const removeItemView = ({ root, action }) => {
    const { id } = action;

    // get the view matching the given id
    const view = root.childViews.find(child => child.id === id);

    // if no view found, exit
    if (!view) {
        return;
    }

    // animate view out of view
    view.scaleX = 0.9;
    view.scaleY = 0.9;
    view.opacity = 0;

    // mark for removal
    view.markedForRemoval = true;
};

const getItemHeight = child => child.rect.element.height + (child.rect.element.marginBottom * .5) + (child.rect.element.marginTop * .5);
const getItemWidth = child => child.rect.element.width + (child.rect.element.marginLeft * .5) + (child.rect.element.marginRight * .5);

const dragItem = ({ root, action }) => {

    const { id, dragState } = action;

    // reference to item
    const item = root.query('GET_ITEM', { id });

    // get the view matching the given id
    const view = root.childViews.find(child => child.id === id);

    const numItems = root.childViews.length;
    const oldIndex = dragState.getItemIndex(item);

    // if no view found, exit
    if (!view) return;

    const dragPosition = {
        x: view.dragOrigin.x + view.dragOffset.x + view.dragCenter.x,
        y: view.dragOrigin.y + view.dragOffset.y + view.dragCenter.y
    }

    // get drag area dimensions
    const dragHeight = getItemHeight(view);
    const dragWidth = getItemWidth(view);

    // get rows and columns (There will always be at least one row and one column if a file is present)
    let cols = Math.floor(root.rect.outer.width / dragWidth);
    if (cols > numItems) cols = numItems;

    // rows are used to find when we have left the preview area bounding box
    const rows = Math.floor(numItems / cols + 1);

    dropAreaDimensions.setHeight = dragHeight * rows;
    dropAreaDimensions.setWidth = dragWidth * cols;

    // get new index of dragged item
	var location = {
		y: Math.floor(dragPosition.y / dragHeight),
		x: Math.floor(dragPosition.x / dragWidth),
		getGridIndex: function getGridIndex() {
			if (dragPosition.y > dropAreaDimensions.getHeight ||
                dragPosition.y < 0 ||
                dragPosition.x > dropAreaDimensions.getWidth ||
                dragPosition.x < 0) return oldIndex;
            return this.y * cols + this.x;
		},
		getColIndex: function getColIndex() {
            const items = root.query('GET_ACTIVE_ITEMS');
            const visibleChildren = root.childViews.filter(child => child.rect.element.height);
            const children = items.map(item => visibleChildren.find(childView => childView.id === item.id));
            const currentIndex = children.findIndex(child => child === view);
			const dragHeight = getItemHeight(view);
            const l = children.length;
			let idx = l;
            let childHeight = 0;
			let childBottom = 0;
			let childTop = 0;
            for (let i = 0; i < l; i++) {
                childHeight = getItemHeight(children[i]);
                childTop = childBottom;
                childBottom = childTop + childHeight;
                if (dragPosition.y < childBottom) {
                    if (currentIndex > i) {
                        if (dragPosition.y < childTop + dragHeight) {
                            idx = i;
                            break;
                        }
                        continue;
                    }
                    idx = i;
                    break;
                }
            }
			return idx;
		}
    }
    
    // get new index
	const index = cols > 1 ? location.getGridIndex() : location.getColIndex();
    root.dispatch('MOVE_ITEM', { query: view, index });

    // if the index of the item changed, dispatch reorder action
    const currentIndex = dragState.getIndex();

    if (currentIndex === undefined || currentIndex !== index) {
        
        dragState.setIndex(index);
        
        if (currentIndex === undefined) return;

        root.dispatch('DID_REORDER_ITEMS', { items: root.query('GET_ACTIVE_ITEMS'), origin: oldIndex, target: index });
    }
};

/**
 * Setup action routes
 */
const route = createRoute({
    DID_ADD_ITEM: addItemView,
    DID_REMOVE_ITEM: removeItemView,
    DID_DRAG_ITEM: dragItem
});


/**
 * Write to view
 * @param root
 * @param actions
 * @param props
 */
const write = ({ root, props, actions, shouldOptimize }) => {

    // route actions
    route({ root, props, actions });

    const { dragCoordinates } = props;

    // available space on horizontal axis
    const horizontalSpace = root.rect.element.width;

    // only draw children that have dimensions
    const visibleChildren = root.childViews.filter(child => child.rect.element.height);

    // sort based on current active items
    const children = root.query('GET_ACTIVE_ITEMS').map(item => visibleChildren.find(child => child.id === item.id)).filter(item => item);

    // get index
    const dragIndex = dragCoordinates ? getItemIndexByPosition(root, children, dragCoordinates) : null;

    // add index is used to reserve the dropped/added item index till the actual item is rendered
    const addIndex = root.ref.addIndex || null;

    // add index no longer needed till possibly next draw
    root.ref.addIndex = null;

    let dragIndexOffset = 0;
    let removeIndexOffset = 0;
    let addIndexOffset = 0;

    if (children.length === 0) return;

    const childRect = children[0].rect.element;
    const itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
    const itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;
    const itemWidth = childRect.width + itemHorizontalMargin;
    const itemHeight = childRect.height + itemVerticalMargin;
    const itemsPerRow = Math.round(horizontalSpace / itemWidth);

    // stack
    if (itemsPerRow === 1) {

        let offsetY = 0;
        let dragOffset = 0;

        children.forEach((child, index) => {

            if (dragIndex) {
                let dist = index - dragIndex;
                if (dist === -2) {
                    dragOffset = -itemVerticalMargin * .25;
                }
                else if (dist === -1) {
                    dragOffset = -itemVerticalMargin * .75;
                }
                else if (dist === 0) {
                    dragOffset = itemVerticalMargin * .75;
                }
                else if (dist === 1) {
                    dragOffset = itemVerticalMargin * .25;
                }
                else {
                    dragOffset = 0;
                }
            }

            if (shouldOptimize) {
                child.translateX = null;
                child.translateY = null;
            }

            if (!child.markedForRemoval) {
                moveItem(child, 0, offsetY + dragOffset);
            }

            let itemHeight = child.rect.element.height + itemVerticalMargin;

            let visualHeight = itemHeight * (child.markedForRemoval ? child.opacity : 1);

            offsetY += visualHeight;

        });
    }
    // grid
    else {

        let prevX = 0;
        let prevY = 0;

        children.forEach((child, index) => {

            if (index === dragIndex) {
                dragIndexOffset = 1;
            }

            if (index === addIndex) {
                addIndexOffset += 1;
            }

            if (child.markedForRemoval && child.opacity < .5) {
                removeIndexOffset -= 1;
            }

            const visualIndex = index + addIndexOffset + dragIndexOffset + removeIndexOffset;

            const indexX = (visualIndex % itemsPerRow);
            const indexY = Math.floor(visualIndex / itemsPerRow);

            const offsetX = indexX * itemWidth;
            const offsetY = indexY * itemHeight;

            const vectorX = Math.sign(offsetX - prevX);
            const vectorY = Math.sign(offsetY - prevY);

            prevX = offsetX;
            prevY = offsetY;

            if (child.markedForRemoval) return;

            if (shouldOptimize) {
                child.translateX = null;
                child.translateY = null;
            }

            moveItem(child, offsetX, offsetY, vectorX, vectorY);
        });
    }

};

/**
 * Filters actions that are meant specifically for a certain child of the list
 * @param child
 * @param actions
 */
const filterSetItemActions = (child, actions) =>
    actions.filter(action => {

        // if action has an id, filter out actions that don't have this child id
        if (action.data && action.data.id) {
            return child.id === action.data.id;
        }

        // allow all other actions
        return true;
    });

export const list = createView({
    create,
    write,
    tag: 'ul',
    name: 'list',
    didWriteView: ({ root }) => {
        root.childViews
            .filter(view => view.markedForRemoval && view.opacity === 0 && view.resting)
            .forEach(view => {
                view._destroy();
                root.removeChildView(view);
            });
    },
    filterFrameActionsForChild: filterSetItemActions,
    mixins: {
        apis: ['dragCoordinates']
    }
});
