/** Clamps value between min and max */
export function clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
}

export function roundPrecision(number: number, precision: number) {
    const f = Math.pow(10, precision);
    return Math.round(number * f) / f;
}

/** Random number between min and max */
export function randomNumberBetween(min = 0, max = 1, random = Math.random) {
    return min + random() * (max - min);
}

/** Generates random-ish numbers with a seed, useful for generating test data in sequence */
export function createRandomish(seed = 1) {
    return function () {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
}

export function elastify(translation: number, dist: number) {
    return dist
        ? dist * Math.sign(translation) * Math.log10(1 + Math.abs(translation) / dist)
        : translation;
}
