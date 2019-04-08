import { arrayRemove } from '../../utils/arrayRemove';

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
                    .forEach(cb => {
                        setTimeout(() => {
                            cb(...args);
                        }, 0);
                    });
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
