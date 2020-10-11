import { createDragNDropClient } from '../utils/dnd';

export const createHopper = (scope, validateItems, options) => {
    // is now hopper scope
    scope.classList.add('filepond--hopper');

    // shortcuts
    const { catchesDropsOnPage, requiresDropOnElement, filterItems = items => items } = options;

    // create a dnd client
    const client = createDragNDropClient(
        scope,
        catchesDropsOnPage ? document.documentElement : scope,
        requiresDropOnElement
    );

    // current client state
    let lastState = '';
    let currentState = '';

    // determines if a file may be dropped
    client.allowdrop = items => {
        // TODO: if we can, throw error to indicate the items cannot by dropped

        return validateItems(filterItems(items));
    };

    client.ondrop = (position, items) => {

        const filteredItems = filterItems(items);

        if (!validateItems(filteredItems)) {
            api.ondragend(position);
            return;
        }

        currentState = 'drag-drop';

        api.onload(filteredItems, position);
    };

    client.ondrag = position => {
        api.ondrag(position);
    };

    client.onenter = position => {
        currentState = 'drag-over';

        api.ondragstart(position);
    };

    client.onexit = position => {
        currentState = 'drag-exit';

        api.ondragend(position);
    };

    const api = {
        updateHopperState: () => {
            if (lastState !== currentState) {
                scope.dataset.hopperState = currentState;
                lastState = currentState;
            }
        },
        onload: () => {},
        ondragstart: () => {},
        ondrag: () => {},
        ondragend: () => {},
        destroy: () => {
            // destroy client
            client.destroy();
        }
    };

    return api;
};
