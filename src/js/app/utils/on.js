import { arrayRemove } from '../../utils/arrayRemove';

const run = (cb, sync) => {
    if (sync) {
        cb();
    }
    else if (document.hidden) {
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
    const fire = (event, args, sync) => {
        listeners
            .filter(listener => listener.event === event)
            .map(listener => listener.cb)
            .forEach(cb => run(() => cb(...args), sync));
    }
    return {
        fireSync: (event, ...args) => {
            fire(event, args, true);
        },
        fire: (event, ...args) => {
            fire(event, args, false);
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
