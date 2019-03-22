import { addEvent } from '../utils/addEvent';
import { removeEvent } from '../utils/removeEvent';

// mixin
export const listeners = ({
    mixinConfig,
    viewProps,
    viewInternalAPI,
    viewExternalAPI,
    viewState,
    view
}) => {
    const events = [];

    const add = addEvent(view.element);
    const remove = removeEvent(view.element);

    viewExternalAPI.on = (type, fn) => {
        events.push({
            type,
            fn
        });
        add(type, fn);
    };

    viewExternalAPI.off = (type, fn) => {
        events.splice(
            events.findIndex(event => event.type === type && event.fn === fn),
            1
        );
        remove(type, fn);
    };

    return {
        write: () => {
            // not busy
            return true;
        },
        destroy: () => {
            events.forEach(event => {
                remove(event.type, event.fn);
            });
        }
    };
};
