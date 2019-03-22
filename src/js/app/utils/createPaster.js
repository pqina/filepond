import { arrayRemove } from '../../utils/arrayRemove';
import { InteractionMethod } from '../enum/InteractionMethod';
import { requestDataTransferItems } from './requestDataTransferItems';

let listening = false;
const listeners = [];

const handlePaste = e => {
    requestDataTransferItems(e.clipboardData).then(files => {
        // no files received
        if (!files.length) {
            return;
        }

        // notify listeners of received files
        listeners.forEach(listener => listener(files));
    });
};

const listen = cb => {
    // can't add twice
    if (listeners.includes(cb)) {
        return;
    }

    // add initial listener
    listeners.push(cb);

    // setup paste listener for entire page
    if (listening) {
        return;
    }

    listening = true;
    document.addEventListener('paste', handlePaste);
};

const unlisten = listener => {
    arrayRemove(listeners, listeners.indexOf(listener));

    // clean up
    if (listeners.length === 0) {
        document.removeEventListener('paste', handlePaste);
        listening = false;
    }
};

export const createPaster = () => {
    const cb = files => {
        api.onload(files);
    };

    const api = {
        destroy: () => {
            unlisten(cb);
        },
        onload: () => {}
    };

    listen(cb);

    return api;
};
