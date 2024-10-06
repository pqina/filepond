import { arrayRemove } from '../../utils/arrayRemove';
import { requestDataTransferItems } from './requestDataTransferItems';

let listening = false;
const listeners = [];

const handlePaste = e => {
    // if is pasting in input or textarea and the target is outside of a filepond scope, ignore
    const activeEl = document.activeElement;
    const isActiveElementEditable =
        activeEl &&
        (/textarea|input/i.test(activeEl.nodeName) ||
            activeEl.getAttribute('contenteditable') === 'true');

    if (isActiveElementEditable) {
        // test textarea or input is contained in filepond root
        let inScope = false;
        let element = activeEl;
        while (element !== document.body) {
            if (element.classList.contains('filepond--root')) {
                inScope = true;
                break;
            }
            element = element.parentNode;
        }

        if (!inScope) return;
    }
    
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
