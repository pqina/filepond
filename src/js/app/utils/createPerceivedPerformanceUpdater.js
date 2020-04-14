import { getRandomNumber } from '../../utils/getRandomNumber';

export const createPerceivedPerformanceUpdater = (
    cb,
    duration = 1000,
    offset = 0,
    tickMin = 25,
    tickMax = 250
) => {
    let timeout = null;
    const start = Date.now();

    const tick = () => {

        let runtime = Date.now() - start;
        let delay = getRandomNumber(tickMin, tickMax);

        if (runtime + delay > duration) {
            delay = runtime + delay - duration;
        }

        let progress = runtime / duration;
        if (progress >= 1 || document.hidden) {
            cb(1);
            return;
        }

        cb(progress);

        timeout = setTimeout(tick, delay);
    };

    tick();

    return {
        clear: () => {
            clearTimeout(timeout);
        }
    };
};
