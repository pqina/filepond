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
    let frame = null;

    const tick = ts => {
        // queue next tick
        frame = window.requestAnimationFrame(tick);

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

    tick(performance.now());

    return {
        pause: () => {
            window.cancelAnimationFrame(frame);
        }
    };
};
