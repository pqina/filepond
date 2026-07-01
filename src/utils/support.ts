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

/** Tests if this browser supports URL patterns */
export const supportsURLPattern = createTest(() => 'URLPattern' in window);

/** Tests if this browser supports invoker commands */
export const supportsInvokerCommands = createTest(() => 'CommandEvent' in window);

/** Tests if this browser supports display transitions with allow-discrete (https://bugzilla.mozilla.org/show_bug.cgi?id=1882408#c5) */
export const supportsDisplayTransition = createTest(() => {
    const div = document.createElement('div');
    div.style.transition = 'display 1s allow-discrete';
    document.body.append(div);
    const cs = getComputedStyle(div);
    cs.display;
    div.style.display = 'none';
    const res = cs.display !== 'none';
    div.remove();
    return res;
});
