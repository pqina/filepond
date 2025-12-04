export function toTimeParts(seconds: number): [number, number, number] {
    const rs = Math.round(seconds);
    const hoursPart = Math.floor(rs / 3600);
    const minutesPart = Math.floor((rs - hoursPart * 3600) / 60);
    const secondsPart = Math.round(rs - hoursPart * 3600 - minutesPart * 60);
    return [hoursPart, minutesPart, secondsPart];
}

export function toTime(seconds: number): string {
    return toTimeParts(seconds)
        .filter((v, i) => {
            if (i === 0) {
                return v > 0;
            }
            return true;
        })
        .map((v, i) => {
            return i > 0 ? `${v}`.padStart(2, '0') : v;
        })
        .join(':');
}
