import { forin } from '../../utils/forin';
import { getRootNode } from '../../utils/getRootNode';
import { requestDataTransferItems } from './requestDataTransferItems';

const dragNDropObservers = [];

const eventPosition = e => ({
    pageLeft: e.pageX,
    pageTop: e.pageY,
    scopeLeft: e.offsetX || e.layerX,
    scopeTop: e.offsetY || e.layerY
});

export const createDragNDropClient = (
    element,
    scopeToObserve,
    filterElement
) => {
    const observer = getDragNDropObserver(scopeToObserve);

    const client = {
        element,
        filterElement,
        state: null,
        ondrop: () => {},
        onenter: () => {},
        ondrag: () => {},
        onexit: () => {},
        onload: () => {},
        allowdrop: () => {}
    };

    client.destroy = observer.addListener(client);

    return client;
};

const getDragNDropObserver = element => {
    // see if already exists, if so, return
    const observer = dragNDropObservers.find(item => item.element === element);
    if (observer) {
        return observer;
    }

    // create new observer, does not yet exist for this element
    const newObserver = createDragNDropObserver(element);
    dragNDropObservers.push(newObserver);
    return newObserver;
};

const createDragNDropObserver = element => {
    const clients = [];

    const routes = {
        dragenter,
        dragover,
        dragleave,
        drop
    };

    const handlers = {};

    forin(routes, (event, createHandler) => {
        handlers[event] = createHandler(element, clients);
        element.addEventListener(event, handlers[event], false);
    });

    const observer = {
        element,
        addListener: client => {
            // add as client
            clients.push(client);

            // return removeListener function
            return () => {
                // remove client
                clients.splice(clients.indexOf(client), 1);

                // if no more clients, clean up observer
                if (clients.length === 0) {
                    dragNDropObservers.splice(
                        dragNDropObservers.indexOf(observer),
                        1
                    );

                    forin(routes, event => {
                        element.removeEventListener(
                            event,
                            handlers[event],
                            false
                        );
                    });
                }
            };
        }
    };

    return observer;
};

const elementFromPoint = (root, point) => {
    if (!('elementFromPoint' in root)) {
        root = document;
    }
    return root.elementFromPoint(point.x, point.y);
}

const isEventTarget = (e, target) => {
    // get root
    const root = getRootNode(target);

    // get element at position
    // if root is not actual shadow DOM and does not have elementFromPoint method, use the one on document
    const elementAtPosition = elementFromPoint(root,{
        x: e.pageX - window.pageXOffset,
        y: e.pageY - window.pageYOffset
    });

    // test if target is the element or if one of its children is
    return elementAtPosition === target || target.contains(elementAtPosition);
};

let initialTarget = null;

const setDropEffect = (dataTransfer, effect) => {
    // is in try catch as IE11 will throw error if not
    try {
        dataTransfer.dropEffect = effect;
    } catch (e) {}
};

const dragenter = (root, clients) => e => {
    e.preventDefault();

    initialTarget = e.target;

    clients.forEach(client => {
        const { element, onenter } = client;

        if (isEventTarget(e, element)) {
            client.state = 'enter';

            // fire enter event
            onenter(eventPosition(e));
        }
    });
};

const dragover = (root, clients) => e => {
    e.preventDefault();

    const dataTransfer = e.dataTransfer;

    requestDataTransferItems(dataTransfer).then(items => {

        let overDropTarget = false;

        clients.some(client => {
            const {
                filterElement,
                element,
                onenter,
                onexit,
                ondrag,
                allowdrop
            } = client;

            // by default we can drop
            setDropEffect(dataTransfer, 'copy');

            // allow transfer of these items
            const allowsTransfer = allowdrop(items);

            // only used when can be dropped on page
            if (!allowsTransfer) {
                setDropEffect(dataTransfer, 'none');
                return;
            }

            // targetting this client
            if (isEventTarget(e, element)) {
                
                overDropTarget = true;

                // had no previous state, means we are entering this client
                if (client.state === null) {
                    client.state = 'enter';
                    onenter(eventPosition(e));
                    return;
                }

                // now over element (no matter if it allows the drop or not)
                client.state = 'over';

                // needs to allow transfer
                if (filterElement && !allowsTransfer) {
                    setDropEffect(dataTransfer, 'none');
                    return;
                }

                // dragging
                ondrag(eventPosition(e));
            } else {

                // should be over an element to drop
                if (filterElement && !overDropTarget) {
                    setDropEffect(dataTransfer, 'none');
                }

                // might have just left this client?
                if (client.state) {
                    client.state = null;
                    onexit(eventPosition(e));
                }
            }
        });

    });

};

const drop = (root, clients) => e => {
    e.preventDefault();

    const dataTransfer = e.dataTransfer;

    requestDataTransferItems(dataTransfer).then(items => {
        clients.forEach(client => {
            const {
                filterElement,
                element,
                ondrop,
                onexit,
                allowdrop
            } = client;

            client.state = null;

            // if we're filtering on element we need to be over the element to drop
            if (filterElement && !isEventTarget(e, element)) return;

            // no transfer for this client
            if (!allowdrop(items)) return onexit(eventPosition(e));

            // we can drop these items on this client
            ondrop(eventPosition(e), items);
        });
    });
};

const dragleave = (root, clients) => e => {
    if (initialTarget !== e.target) {
        return;
    }

    clients.forEach(client => {
        const { onexit } = client;

        client.state = null;

        onexit(eventPosition(e));
    });
};
