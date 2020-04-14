import { arrayRemove } from '../../utils/arrayRemove';

const fire = (cb) => {
    if (document.hidden) {
        Promise.resolve(1).then(cb);
    }
    else {
        setTimeout(cb, 0);
    }
}

export const on = () => {
    const listeners = [];
    const off = (event, cb) => {
        arrayRemove(
            listeners,
            listeners.findIndex(
                listener => listener.event === event && (listener.cb === cb || !cb)
            )
        );
    };
    return {
        fire: (event, ...args) => {
                listeners
                    .filter(listener => listener.event === event)
                    .map(listener => listener.cb)
                    .forEach(cb => fire(() => cb(...args)));
        },
        on: (event, cb) => {
            listeners.push({ event, cb });
        },
        onOnce: (event, cb) => {
            listeners.push({
                event,
                cb: (...args) => {
                    off(event, cb);
                    cb(...args);
                }
            });
        },
        off
    };
};
