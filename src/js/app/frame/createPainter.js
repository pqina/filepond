export const createPainter = (read, write) => {

    const name = '__framePainter';

    // set global painter
    if (window[name]) {
        window[name].readers.push(read);
        window[name].writers.push(write);
        return;
    }

    window[name] = {
        readers: [read],
        writers: [write]
    };

    return {
        pause: () => { }
    };
};
