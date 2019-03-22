import { describeArc } from './describeArc';

export const percentageArc = (x, y, radius, from, to) => {
    let arcSweep = 1;
    if (to > from && to - from <= 0.5) {
        arcSweep = 0;
    }
    if (from > to && from - to >= 0.5) {
        arcSweep = 0;
    }
    return describeArc(
        x,
        y,
        radius,
        Math.min(0.9999, from) * 360,
        Math.min(0.9999, to) * 360,
        arcSweep
    );
};
