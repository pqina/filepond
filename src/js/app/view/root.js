import { createView, createRoute } from '../frame/index';
import { applyFilterChain, applyFilters } from '../../filter';
import { listScroller } from './listScroller';
import { panel } from './panel';
import { browser } from './browser';
import { dropLabel } from './dropLabel';
import { drip } from './drip';
import { data } from './data';
import { createHopper } from '../utils/createHopper';
import { createPaster } from '../utils/createPaster';
import { InteractionMethod } from '../enum/InteractionMethod';
import { getItemIndexByPosition } from '../utils/getItemIndexByPosition';
import { isInt } from '../../utils/isInt';
import { isEmpty } from '../../utils/isEmpty';
import { assistant } from './assistant';
import { toCamels } from '../../utils/toCamels';
import { createElement } from '../../utils/createElement';
import { createResponse } from '../../utils/createResponse';
import { debounce } from '../../utils/debounce';
import { isFile } from '../../utils/isFile';

const MAX_FILES_LIMIT = 1000000;

const prevent = e => e.preventDefault();

const create = ({ root, props }) => {

    // Add id
    const id = root.query('GET_ID');
    if (id) {
        root.element.id = id;
    }

    // Add className
    const className = root.query('GET_CLASS_NAME');
    if (className) {
        className.split(' ').filter(name => name.length).forEach(name => {
            root.element.classList.add(name);
        });
    }

    // Field label
    root.ref.label = root.appendChildView(
        root.createChildView(dropLabel, {
            ...props, 
            translateY: null,
            caption: root.query('GET_LABEL_IDLE')
        })
    );

    // List of items
    root.ref.list = root.appendChildView(
        root.createChildView(listScroller, { translateY: null })
    );

    // Background panel
    root.ref.panel = root.appendChildView(
        root.createChildView(panel, { name: 'panel-root' })
    );

    // Assistant notifies assistive tech when content changes
    root.ref.assistant = root.appendChildView(
        root.createChildView(assistant, { ...props })
    );

    // Data
    root.ref.data = root.appendChildView(
        root.createChildView(data, { ...props })
    );

    // Measure (tests if fixed height was set)
    // DOCTYPE needs to be set for this to work
    root.ref.measure = createElement('div');
    root.ref.measure.style.height = '100%';
    root.element.appendChild(root.ref.measure);

    // information on the root height or fixed height status
    root.ref.bounds = null;

    // apply initial style properties
    root.query('GET_STYLES').filter(style => !isEmpty(style.value))
        .map(({ name, value }) => {
            root.element.dataset[name] = value;
        });

    // determine if width changed
    root.ref.widthPrevious = null;
    root.ref.widthUpdated = debounce(() => {
        root.ref.updateHistory = [];
        root.dispatch('DID_RESIZE_ROOT');
    }, 250);

    // history of updates
    root.ref.previousAspectRatio = null;
    root.ref.updateHistory = [];

    // prevent scrolling and zooming on iOS (only if supports pointer events, for then we can enable reorder)
    const canHover = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const hasPointerEvents = 'PointerEvent' in window;
    if (root.query('GET_ALLOW_REORDER') && hasPointerEvents && !canHover) {
        root.element.addEventListener('touchmove', prevent, { passive: false });
        root.element.addEventListener('gesturestart', prevent);
    }

    // add credits
    const credits = root.query('GET_CREDITS');
    const hasCredits = credits.length === 2;
    if (hasCredits) {
        const frag = document.createElement('a');
        frag.className = 'filepond--credits';
        frag.setAttribute('aria-hidden', 'true');
        frag.href = credits[0];
        frag.tabindex = -1;
        frag.target = '_blank';
        frag.rel = 'noopener noreferrer';
        frag.textContent = credits[1];
        root.element.appendChild(frag);
        root.ref.credits = frag;
    }
};

const write = ({ root, props, actions }) => {

    // route actions
    route({ root, props, actions });

    // apply style properties
    actions
        .filter(action => /^DID_SET_STYLE_/.test(action.type))
        .filter(action => !isEmpty(action.data.value))
        .map(({ type, data }) => {
            const name = toCamels(type.substr(8).toLowerCase(), '_');
            root.element.dataset[name] = data.value;
            root.invalidateLayout();
        });

    if (root.rect.element.hidden) return;

    if (root.rect.element.width !== root.ref.widthPrevious) {
        root.ref.widthPrevious = root.rect.element.width;
        root.ref.widthUpdated();
    }

    // get box bounds, we do this only once
    let bounds = root.ref.bounds;
    if (!bounds) {
        bounds = root.ref.bounds = calculateRootBoundingBoxHeight(root);
        
        // destroy measure element
        root.element.removeChild(root.ref.measure);
        root.ref.measure = null;
    }

    // get quick references to various high level parts of the upload tool
    const { hopper, label, list, panel } = root.ref;

    // sets correct state to hopper scope
    if (hopper) {
        hopper.updateHopperState();
    }

    // bool to indicate if we're full or not
    const aspectRatio = root.query('GET_PANEL_ASPECT_RATIO');
    const isMultiItem = root.query('GET_ALLOW_MULTIPLE');
    const totalItems = root.query('GET_TOTAL_ITEMS');
    const maxItems = isMultiItem ? root.query('GET_MAX_FILES') || MAX_FILES_LIMIT : 1;
    const atMaxCapacity = totalItems === maxItems;

    // action used to add item
    const addAction = actions.find(action => action.type === 'DID_ADD_ITEM');

    // if reached max capacity and we've just reached it
    if (atMaxCapacity && addAction) {

        // get interaction type
        const interactionMethod = addAction.data.interactionMethod;

        // hide label
        label.opacity = 0;

        if (isMultiItem) {
            label.translateY = -40;
        }
        else {
            if (interactionMethod === InteractionMethod.API) {
                label.translateX = 40;
            } 
            else if (interactionMethod === InteractionMethod.BROWSE) {
                label.translateY = 40;
            } 
            else {
                label.translateY = 30;
            }
        }

    }
    else if (!atMaxCapacity) {
        label.opacity = 1;
        label.translateX = 0;
        label.translateY = 0;
    }

    const listItemMargin = calculateListItemMargin(root);
    
    const listHeight = calculateListHeight(root);
    
    const labelHeight = label.rect.element.height;
    const currentLabelHeight = !isMultiItem || atMaxCapacity ? 0 : labelHeight;

    const listMarginTop = atMaxCapacity ? list.rect.element.marginTop : 0;
    const listMarginBottom = totalItems === 0 ? 0 : list.rect.element.marginBottom;
    
    const visualHeight = currentLabelHeight + listMarginTop + listHeight.visual + listMarginBottom;
    const boundsHeight = currentLabelHeight + listMarginTop + listHeight.bounds + listMarginBottom;
    
    // link list to label bottom position
    list.translateY = Math.max(0, currentLabelHeight - list.rect.element.marginTop) - listItemMargin.top;

    if (aspectRatio) { // fixed aspect ratio

        // calculate height based on width
        const width = root.rect.element.width;
        const height = width * aspectRatio;

        // clear history if aspect ratio has changed
        if (aspectRatio !== root.ref.previousAspectRatio) {
            root.ref.previousAspectRatio = aspectRatio;
            root.ref.updateHistory = [];
        }
        
        // remember this width
        const history = root.ref.updateHistory;
        history.push(width);

        const MAX_BOUNCES = 2;
        if (history.length > MAX_BOUNCES * 2) {
            const l = history.length;
            const bottom = l - 10;
            let bounces = 0;
            for (let i=l;i>=bottom;i--) {

                if (history[i] === history[i-2]) {
                    bounces++;
                }

                if (bounces >= MAX_BOUNCES) {
                    // dont adjust height
                    return;
                }
            }
        }

        // fix height of panel so it adheres to aspect ratio
        panel.scalable = false;
        panel.height = height;
        
        // available height for list
        const listAvailableHeight = 
            // the height of the panel minus the label height
            height - currentLabelHeight
            // the room we leave open between the end of the list and the panel bottom
            - (listMarginBottom - listItemMargin.bottom)
            // if we're full we need to leave some room between the top of the panel and the list
            - (atMaxCapacity ? listMarginTop : 0);
        
        if (listHeight.visual > listAvailableHeight) {
            list.overflow = listAvailableHeight;
        }
        else {
            list.overflow = null;
        }

        // set container bounds (so pushes siblings downwards)
        root.height = height;
    }
    else if (bounds.fixedHeight) { // fixed height

        // fix height of panel
        panel.scalable = false;

        // available height for list
        const listAvailableHeight = 
            // the height of the panel minus the label height
            bounds.fixedHeight - currentLabelHeight
            // the room we leave open between the end of the list and the panel bottom
            - (listMarginBottom - listItemMargin.bottom)
            // if we're full we need to leave some room between the top of the panel and the list
            - (atMaxCapacity ? listMarginTop : 0);
        
        // set list height
        if (listHeight.visual > listAvailableHeight) {
            list.overflow = listAvailableHeight;
        }
        else {
            list.overflow = null;
        }
        
        // no need to set container bounds as these are handles by CSS fixed height
        
    }
    else if (bounds.cappedHeight) { // max-height

        // not a fixed height panel
        const isCappedHeight = visualHeight >= bounds.cappedHeight;
        const panelHeight = Math.min(bounds.cappedHeight, visualHeight);
        panel.scalable = true;
        panel.height = isCappedHeight ? panelHeight : panelHeight - listItemMargin.top - listItemMargin.bottom;

        // available height for list
        const listAvailableHeight = 
            // the height of the panel minus the label height
            panelHeight - currentLabelHeight
            // the room we leave open between the end of the list and the panel bottom
            - (listMarginBottom - listItemMargin.bottom)
            // if we're full we need to leave some room between the top of the panel and the list
            - (atMaxCapacity ? listMarginTop : 0);
        
        // set list height (if is overflowing)
        if (visualHeight > bounds.cappedHeight && listHeight.visual > listAvailableHeight) {
            list.overflow = listAvailableHeight;
        }
        else {
            list.overflow = null;
        }
        
        // set container bounds (so pushes siblings downwards)
        root.height = Math.min(
            bounds.cappedHeight,
            boundsHeight - listItemMargin.top - listItemMargin.bottom
        );
        
    }
    else { // flexible height

        // not a fixed height panel
        const itemMargin = totalItems > 0 ? listItemMargin.top + listItemMargin.bottom : 0;
        panel.scalable = true;
        panel.height = Math.max(labelHeight, visualHeight - itemMargin);

        // set container bounds (so pushes siblings downwards)
        root.height = Math.max(labelHeight, boundsHeight - itemMargin);
    }
    
    // move credits to bottom
    if (root.ref.credits && panel.heightCurrent) root.ref.credits.style.transform = `translateY(${panel.heightCurrent}px)`;
};

const calculateListItemMargin = (root) => {
    const item = root.ref.list.childViews[0].childViews[0];
    return item ? {
        top: item.rect.element.marginTop,
        bottom: item.rect.element.marginBottom
    } : {
        top: 0,
        bottom: 0
    }
}

const calculateListHeight = (root) => {

    let visual = 0;
    let bounds = 0;

    // get file list reference
    const scrollList = root.ref.list;
    const itemList = scrollList.childViews[0];
    const visibleChildren = itemList.childViews.filter(child => child.rect.element.height);
    const children = root.query('GET_ACTIVE_ITEMS').map(item => visibleChildren.find(child => child.id === item.id)).filter(item => item);
   
    // no children, done!
    if (children.length === 0) return { visual, bounds };

    const horizontalSpace = itemList.rect.element.width;
    const dragIndex = getItemIndexByPosition(itemList, children, scrollList.dragCoordinates);

    const childRect = children[0].rect.element;

    const itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
    const itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;

    const itemWidth = childRect.width + itemHorizontalMargin;
    const itemHeight = childRect.height + itemVerticalMargin;

    const newItem = (typeof dragIndex !== 'undefined' && dragIndex >= 0 ? 1 : 0);
    const removedItem = children.find(child => child.markedForRemoval && child.opacity < .45) ? -1 : 0;
    const verticalItemCount = children.length + newItem + removedItem;
    const itemsPerRow = Math.round(horizontalSpace / itemWidth);

    // stack
    if (itemsPerRow === 1) {
        children.forEach(item => {
            const height = item.rect.element.height + itemVerticalMargin;
            bounds += height;
            visual += height * item.opacity;
        });
    }
    // grid
    else {
        bounds = Math.ceil(verticalItemCount / itemsPerRow) * itemHeight;
        visual = bounds;
    }

    return { visual, bounds }
}

const calculateRootBoundingBoxHeight = (root) => {

    const height = root.ref.measureHeight || null;
    const cappedHeight = parseInt(root.style.maxHeight, 10) || null;
    const fixedHeight = height === 0 ? null : height;

    return {
        cappedHeight,
        fixedHeight
    };
};

const exceedsMaxFiles = (root, items) => {

    const allowReplace = root.query('GET_ALLOW_REPLACE');
    const allowMultiple = root.query('GET_ALLOW_MULTIPLE');
    const totalItems = root.query('GET_TOTAL_ITEMS');
    let maxItems = root.query('GET_MAX_FILES');

    // total amount of items being dragged
    const totalBrowseItems = items.length;

    // if does not allow multiple items and dragging more than one item
    if (!allowMultiple && totalBrowseItems > 1) {
        return true;
    }

    // limit max items to one if not allowed to drop multiple items
    maxItems = allowMultiple
        ? maxItems
        : allowReplace ? maxItems : 1;

    // no more room?
    const hasMaxItems = isInt(maxItems);
    if (hasMaxItems && totalItems + totalBrowseItems > maxItems) {
        root.dispatch('DID_THROW_MAX_FILES', {
            source: items,
            error: createResponse(
                'warning', 
                0, 
                'Max files'
            )
        });
        return true;
    }

    return false;
}

const getDragIndex = (list, children, position) => {
    const itemList = list.childViews[0];
    return getItemIndexByPosition(itemList, children, {
        left: position.scopeLeft - itemList.rect.element.left,
        top: position.scopeTop - (list.rect.outer.top + list.rect.element.marginTop + list.rect.element.scrollTop)
    });
}

/**
 * Enable or disable file drop functionality
 */
const toggleDrop = (root) => {
    const isAllowed = root.query('GET_ALLOW_DROP');
    const isDisabled = root.query('GET_DISABLED');
    const enabled = isAllowed && !isDisabled;
    if (enabled && !root.ref.hopper) {
        const hopper = createHopper(
            root.element,
            items => {
                // allow quick validation of dropped items
                const beforeDropFile = root.query('GET_BEFORE_DROP_FILE') || (() => true);

                // all items should be validated by all filters as valid
                const dropValidation = root.query('GET_DROP_VALIDATION');
                return dropValidation ? items.every(
                    item => applyFilters('ALLOW_HOPPER_ITEM', item, { query: root.query }).every(result => result === true)
                    &&
                    beforeDropFile(item)
                ) : true;
            },
            {
                filterItems: items => {
                    const ignoredFiles = root.query('GET_IGNORED_FILES');
                    return items.filter(item => {
                        if (isFile(item)) {
                            return !ignoredFiles.includes(item.name.toLowerCase())
                        }
                        return true;
                    })
                },
                catchesDropsOnPage: root.query('GET_DROP_ON_PAGE'),
                requiresDropOnElement: root.query('GET_DROP_ON_ELEMENT')
            }
        );

        hopper.onload = (items, position) => {

            // get item children elements and sort based on list sort
            const list = root.ref.list.childViews[0];
            const visibleChildren = list.childViews.filter(child => child.rect.element.height);
            const children = root.query('GET_ACTIVE_ITEMS').map(item => visibleChildren.find(child => child.id === item.id)).filter(item => item);

            applyFilterChain('ADD_ITEMS', items, {dispatch: root.dispatch}).then((queue) => {
                // these files don't fit so stop here
                if (exceedsMaxFiles(root, queue)) return false;

                // go
                root.dispatch('ADD_ITEMS', {
                    items: queue,
                    index: getDragIndex(root.ref.list, children, position),
                    interactionMethod: InteractionMethod.DROP
                });
            });

            root.dispatch('DID_DROP', { position });

            root.dispatch('DID_END_DRAG', { position });
        };

        hopper.ondragstart = position => {
            root.dispatch('DID_START_DRAG', { position });
        };

        hopper.ondrag = debounce(position => {
            root.dispatch('DID_DRAG', { position });
        });

        hopper.ondragend = position => {
            root.dispatch('DID_END_DRAG', { position });
        };

        root.ref.hopper = hopper;

        root.ref.drip = root.appendChildView(root.createChildView(drip));
    }
    else if (!enabled && root.ref.hopper) {
        root.ref.hopper.destroy();
        root.ref.hopper = null;
        root.removeChildView(root.ref.drip);
    }
};

/**
 * Enable or disable browse functionality
 */
const toggleBrowse =  (root, props) => {
    const isAllowed = root.query('GET_ALLOW_BROWSE');
    const isDisabled = root.query('GET_DISABLED');
    const enabled = isAllowed && !isDisabled;
    if (enabled && !root.ref.browser) {
        root.ref.browser = root.appendChildView(
            root.createChildView(browser, {
                ...props,
                onload: items => {

                    applyFilterChain('ADD_ITEMS', items, {dispatch: root.dispatch}).then((queue) => {
                        // these files don't fit so stop here
                        if (exceedsMaxFiles(root, queue)) return false;

                        // add items!
                        root.dispatch('ADD_ITEMS', {
                            items: queue,
                            index: -1,
                            interactionMethod: InteractionMethod.BROWSE
                        });
                    });
            
                }
            }),
            0
        );
    }
    else if (!enabled && root.ref.browser) {
        root.removeChildView(root.ref.browser);
        root.ref.browser = null;
    }
}

/**
 * Enable or disable paste functionality
 */
const togglePaste = (root) => {
    const isAllowed = root.query('GET_ALLOW_PASTE');
    const isDisabled = root.query('GET_DISABLED');
    const enabled = isAllowed && !isDisabled;
    if (enabled && !root.ref.paster) {
        root.ref.paster = createPaster();
        root.ref.paster.onload = items => {

            applyFilterChain('ADD_ITEMS', items, {dispatch: root.dispatch}).then(queue => {
                // these files don't fit so stop here
                if (exceedsMaxFiles(root, queue)) return false;

                // add items!
                root.dispatch('ADD_ITEMS', {
                    items: queue,
                    index: -1,
                    interactionMethod: InteractionMethod.PASTE
                });
            });
            
        };
    }
    else if (!enabled && root.ref.paster) {
        root.ref.paster.destroy();
        root.ref.paster = null;
    }
}

/**
 * Route actions
 */
const route = createRoute({
    DID_SET_ALLOW_BROWSE: ({ root, props }) => {
        toggleBrowse(root, props);
    },
    DID_SET_ALLOW_DROP: ({ root }) => {
        toggleDrop(root);
    },
    DID_SET_ALLOW_PASTE: ({ root }) => {
        togglePaste(root);
    },
    DID_SET_DISABLED: ({ root, props }) => {
        toggleDrop(root);
        togglePaste(root);
        toggleBrowse(root, props);
        const isDisabled = root.query('GET_DISABLED');
        if (isDisabled) {
            root.element.dataset.disabled = 'disabled'
        }
        else {
            // delete root.element.dataset.disabled; <= this does not work on iOS 10
            root.element.removeAttribute('data-disabled');
        }
    }
});

export const root = createView({
    name: 'root',
    read: ({ root }) => {
        if (root.ref.measure) {
            root.ref.measureHeight = root.ref.measure.offsetHeight;
        }
    },
    create,
    write,
    destroy: ({ root }) => {
        if (root.ref.paster) {
            root.ref.paster.destroy();
        }
        if (root.ref.hopper) {
            root.ref.hopper.destroy();
        }
        root.element.removeEventListener('touchmove', prevent);
        root.element.removeEventListener('gesturestart', prevent);
    },
    mixins: {
        styles: ['height']
    }
});
