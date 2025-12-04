import { createTest } from './test.js';

/** Tests if canvas 2d context roundRect method is supported */
export const supportsCanvasRoundRect = createTest(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return ctx ? 'roundRect' in ctx : false;
});

/** Tests if `requestFullscreen` supported */
export const supportsRequestFullscreen = createTest(
    () => 'requestFullscreen' in document.documentElement
);

export const supportsUserAgentData = createTest(() => 'userAgentData' in navigator);

/** Tests if `requestVideoFrameCallback` is supported */
export const supportsRequestVideoFrameCallback = createTest(() => {
    const video = document.createElement('video');
    return 'requestVideoFrameCallback' in video;
});

/** Tests if `scheduler.yield()` is supported */
export const supportsYieldScheduler = createTest(
    // @ts-ignore
    () => !!globalThis.scheduler?.yield
);
