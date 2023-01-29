const fps = 60;
const interval = 1000 / fps;
let last = null;
let isTicking = false;
let state = null;

function tick(ts) {

    // queue next tick
    const scheduleTick = () => {
        if (state.activeCount === 0) {
            console.log("STOP")
            isTicking = false;
        } else if (document.hidden) {
            console.log("TIMEOUT")
            setTimeout(() => tick(performance.now()), interval);
        } else {
            console.log("ANIMATION")
            window.requestAnimationFrame(tick);
        }
    }

    const name = '__framePainter';

    const painter = window[name];

    // limit fps
    if (!last) {
        last = ts;
    } else {
        const delta = ts - last;
        last = ts - delta % interval;
        console.log({ delta, interval })
        if (delta <= interval) {
            scheduleTick()
            return;
        }
    }

    // update view
    painter.readers.forEach(read => read());
    painter.writers.forEach(write => write(ts));

    scheduleTick();

};

export const triggerTick = (outterState) => {
    state = outterState
    if (isTicking) return;
    isTicking = true;
    tick(performance.now());
}