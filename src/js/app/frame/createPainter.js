export const createPainter = (read, write, fps = 60) => {

    const name = '__framePainter';

    // set global painter
    if (window[name]) {
        window[name].readers.push(read);
        window[name].writers.push(write);
        return;
    }
    
    window[name] = {
        readers:[read],
        writers:[write]
    }

    const painter = window[name];

    const interval = 1000 / fps;
    let last = null;
    let id = null;
    let requestTick = null;
    let cancelTick = null;

    const setTimerType = () => {
        if (document.hidden) {
            requestTick = () => window.setTimeout(() => tick(performance.now()), interval);
            cancelTick = () => window.clearTimeout(id);
        }
        else {
            requestTick = () => window.requestAnimationFrame(tick);
            cancelTick = () => window.cancelAnimationFrame(id);
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (cancelTick) cancelTick();
        setTimerType();
        tick(performance.now());
    });

    const tick = ts => {

        // queue next tick
        id = requestTick(tick);

        // limit fps
        if (!last) {
            last = ts;
        }

        const delta = ts - last;

        if (delta <= interval) {
            // skip frame
            return;
        }

        // align next frame
        last = ts - delta % interval;

        // update view
        painter.readers.forEach(read => read());
        painter.writers.forEach(write => write(ts));
    };

    setTimerType();
    tick(performance.now());

    return {
        pause: () => {
            cancelTick(id);
        }
    };
};
