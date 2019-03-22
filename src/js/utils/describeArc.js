import { polarToCartesian } from './polarToCartesian';

export const describeArc = (x, y, radius, startAngle, endAngle, arcSweep) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    return [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        arcSweep,
        0,
        end.x,
        end.y
    ].join(' ');
};
