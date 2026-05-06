<script lang="ts">
    import { type MediaResizeQuality } from '../index.js';

    interface BitmapRendererOptions {
        /** Image file to render */
        file: Blob;

        /** The id to use for tasks */
        taskId: string;

        /** Should we still run task if other tasks are in soft failure mode */
        taskIgnoreSoftFailure: boolean;

        /** Limit size of image, defaults to `1024 * 1024` */
        maximumPixels?: number;

        /** Quality to resize the image with, defaults to `'medium'` */
        resizeQuality?: MediaResizeQuality;

        /** Where to find web workers */
        workersURL?: URL;

        /** Event handlers */
        oninit?: () => void;
        onload?: (size: { width: number; height: number }) => void;
        onrender?: (options: { didRestore: boolean }) => void;
        onerror?: (error: Error) => void;
    }

    import { onDestroy, onMount } from 'svelte';
    import { isFirefox } from '../../../../../utils/test.js';
    import { createObjectURL } from '../../../../../utils/objectURL.js';
    import { getImageSize } from '../../../../../utils/media.js';
    import { getAppContext } from '../../../contexts/appContext.js';
    import { setBitmapCacheItem, getBitmapCacheItem } from './BitmapRendererCache.js';
    import { createThreadWorker, thread } from '../../../../../utils/thread.js';
    import { type Size } from '../../../../../utils/size.js';
    import { transformImage } from '../../../../../workers/transformImage.js';
    import type { TaskFnOptions } from '../../../../../core/taskScheduler.js';

    let {
        file,
        taskId,
        taskIgnoreSoftFailure = false,
        maximumPixels = 1024 * 1024,
        resizeQuality = 'medium',
        workersURL = undefined,
        oninit = undefined,
        onload = undefined,
        onrender = undefined,
        onerror = undefined,
    }: BitmapRendererOptions = $props();

    // so we only generate one object url
    const getObjectURL = () => createObjectURL(file);

    // so we can skip decoding in worker
    const isBitmap = () => file.type !== 'image/svg+xml';

    // read cache on init
    // svelte-ignore state_referenced_locally
    const { size: cachedSize, canvas: cachedCanvas } = getBitmapCacheItem(file) ?? {};

    // we pass these to MediaPane so it can scale/animate media content
    let width = cachedSize?.width as number;
    let height = cachedSize?.height as number;

    // state changes
    let didRequestImageSize = $state.raw(!!cachedSize);
    let didReceiveImageSize = $state.raw(!!cachedSize);
    let didRequestDisplayImage = $state.raw(!!cachedCanvas);

    let didRender: boolean = $state.raw(false);
    $effect(() => {
        if (!didRender) {
            return;
        }

        onrender?.({ didRestore: !!cachedCanvas });
    });

    // get app methods
    const { pushTask, abortTask } = getAppContext();

    // elements
    let image = $state.raw() as HTMLImageElement;
    let canvas = $state.raw() as HTMLCanvasElement;

    // store that returns true when canvas is set
    const hasCanvas = $derived(!!canvas);

    // is true when we're ready to request the image size
    const shouldRequestImageSize = $derived(hasCanvas && !didRequestImageSize);

    // is true when we're ready to display an image
    const shouldDisplayImage = $derived(
        hasCanvas && didReceiveImageSize && !didRequestDisplayImage
    );

    /** Load image bitmap with webworker */
    async function drawImageInWorker(_: any, { signal }: TaskFnOptions) {
        // we did load this image
        didRequestDisplayImage = true;

        // draw image on offscreen canvas
        try {
            // we need to run this in a thread
            // - Chrome will automatically run `createImageBitmap` in a thread
            // - Firefox and Safari won't
            const bitmap = (await thread(
                createThreadWorker(workersURL, transformImage),
                [
                    file,
                    null,
                    {
                        resizeWidth: width,
                        resizeHeight: height,
                        resizeQuality,
                        imageOrientation: 'from-image',
                    },
                ],
                {
                    signal,
                }
            )) as ImageBitmap;

            // now render bitmap
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('bitmaprenderer')?.transferFromImageBitmap(bitmap);

            // store canvas
            setBitmapCacheItem(file, {
                size: { width, height },
                canvas,
            });

            // reveal image
            didRender = true;
        } catch (error) {
            onerror?.(error as Error);
        }
    }

    /**
     * Draws the image in the main thread using the decode() function We have this method because
     * Firefox doesn't createImageBitmap in a separate thread
     */
    async function drawImageInMainThread() {
        // we did already request to display this image
        didRequestDisplayImage = true;

        // create image
        image = new Image();
        image.src = getObjectURL();

        // decode this image as fast as possible
        await image.decode();

        // now draw it to the canvas and animate it into view
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);

        // store canvas
        setBitmapCacheItem(file, {
            size: { width, height },
            canvas,
        });

        // reveal image
        didRender = true;
    }

    /** Determine which image drawing function to run */
    const taskDrawImage = isFirefox() || !isBitmap() ? drawImageInMainThread : drawImageInWorker;

    /** Need to read the image size so we can scale the media container */
    async function taskLoadImageSize() {
        // we did load this image
        didRequestImageSize = true;

        let size: Size;
        try {
            size = (await getImageSize(file)) as Size;
        } catch (error) {
            // show in console for debugging
            onerror?.(error as Error);
            throw error;
        }

        // calculated image scalar
        let imageScalar = 1;

        // scale the image size to fit to the maximum allowed pixels
        const requiredPixels = size.width * size.height;
        if (maximumPixels && (requiredPixels > maximumPixels || !isBitmap())) {
            imageScalar = Math.sqrt(maximumPixels) / Math.sqrt(requiredPixels);
        }

        // so we can center image
        width = Math.floor(size.width * imageScalar);
        height = Math.floor(size.height * imageScalar);

        onload?.({
            width,
            height,
        });

        // draw image on offscreen canvas
        canvas.width = width;
        canvas.height = height;

        // store canvas
        setBitmapCacheItem(file, {
            size: { width, height },
            canvas: null,
        });

        // we did load this image
        didReceiveImageSize = true;
    }

    // should always first get size, because then we can determine if the image is visible
    $effect(() => {
        if (!shouldRequestImageSize) {
            return;
        }

        pushTask(taskId, taskLoadImageSize, {
            parallel: 1,
            ignoreSoftFailure: taskIgnoreSoftFailure,
        });
    });

    // when should display image
    $effect(() => {
        if (!shouldDisplayImage) {
            return;
        }

        pushTask(taskId, taskDrawImage, { parallel: 1, ignoreSoftFailure: taskIgnoreSoftFailure });
    });

    // replace canvas if we have a cached canvas
    onMount(() => {
        oninit?.();

        if (!cachedSize) {
            return;
        }

        // tell parent how big we are
        onload?.({ width, height });

        // replace the canvas with the cached one
        if (!cachedCanvas) {
            return;
        }

        // use the cached canvas
        canvas.replaceWith(cachedCanvas);

        // ready to be drawn
        didRender = true;
    });

    // clean up after ourselves
    onDestroy(() => {
        // we could still have running or queued tasks
        abortTask(taskId, taskLoadImageSize);
        abortTask(taskId, taskDrawImage);

        // no image reference to release
        if (!image) {
            return;
        }

        URL.revokeObjectURL(image.src);
    });
</script>

<canvas width="0" height="0" bind:this={canvas}></canvas>
