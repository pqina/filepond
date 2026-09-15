<script lang="ts">
    import type { CameraInputOptions } from './index.js';
    import type { Bounds } from '../../../utils/bounds.js';
    import type { Size } from '../../../utils/size.js';
    import { onDestroy } from 'svelte';
    import { blobToFile, getExtensionFromMimeType } from '../../../utils/file.js';
    import { measurable } from '../../attachments/measurable.js';
    import { rectFromBounds, type Rect } from '../../../utils/rect.js';
    import { ProgressIndicator } from '../../components/ProgressIndicator/index.js';
    import { canvasToBlob } from '../../../utils/canvasToBlob.js';
    import { isFunction } from '../../../utils/test.js';
    import {
        dispatchCustomEvent,
        filesToFileList,
        resetFileInput,
        setFileInputFilesFromEntries,
    } from '../../../utils/dom.js';

    // props
    let {
        springOptions,
        reduceMotion = false,

        name,
        required,

        filename = 'Untitled',
        blobOptions,

        onerror,
        oncapture,

        labelCapture = 'capture',
        labelReset = 'reset',
    }: CameraInputOptions = $props();

    // reference to camera root
    let root: HTMLElement = $state() as HTMLElement;

    // reference to file input which will hold value
    let fileInput: HTMLInputElement;

    // sets the value of the file input
    function setFileInputValue(input: HTMLInputElement, file: File) {
        input.files = filesToFileList([file]);
    }

    // state
    let output: File | null = $state(null);
    let videoRef: HTMLVideoElement | null = $state(null);
    let previewRef: HTMLCanvasElement | null = $state(null);

    let statusMessage = $state();
    let hasUserMedia = $state(false);

    let cameraState = $state(['load']);
    function handleFeedReady() {
        cameraState = ['ready'];
    }

    // methods
    export const requestCameraAccess = function (constraints?: MediaStreamConstraints) {
        if (videoRef) {
            return requestAccess(constraints);
        }

        return new Promise((resolve, reject) => {
            waitForMount = () => {
                requestAccess().then(resolve).catch(reject);
            };
        });
    };

    // internals
    const requestAccess = function (constraints?: MediaStreamConstraints): Promise<MediaStream> {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false, ...constraints })
                .then((stream) => {
                    if (!videoRef) {
                        return;
                    }

                    videoRef.srcObject = stream;

                    hasUserMedia = true;

                    resolve(stream);
                })
                .catch((err) => {
                    statusMessage = err.message;
                    reject(err);
                });
        });
    };

    // we wait for the video element to be mounted
    let waitForMount: () => void;
    $effect(() => {
        if (videoRef) {
            waitForMount?.();
        }
    });

    /** Resets camera state */
    function handleReset() {
        if (!previewRef) {
            return;
        }

        const ctx = previewRef.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.clearRect(0, 0, previewRef.width, previewRef.height);

        cameraState = cameraState.filter((state) => state !== 'preview');

        output = null;

        resetFileInput(fileInput);
        fileInput.dispatchEvent(new CustomEvent('change', { bubbles: true }));

        dispatchCustomEvent(root, 'reset');
    }

    let videoSize = $state<Size | null>(null);
    function handleFeedMetadata() {
        if (!videoRef) {
            return;
        }

        videoSize = {
            width: videoRef.videoWidth,
            height: videoRef.videoHeight,
        };

        videoRef.play();
    }

    // capture photo
    async function handleCapture() {
        if (!videoRef || !previewRef) {
            return;
        }

        cameraState = [...cameraState, 'processing'];

        // resize canvas
        previewRef.width = videoRef.videoWidth;
        previewRef.height = videoRef.videoHeight;
        const ctx = previewRef.getContext('2d');
        if (!ctx) {
            return;
        }

        // draw the image to the canvas so user can see the preview
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef, previewRef.width * -1, 0);
        ctx.restore();
        canvasToBlob(previewRef, { ...blobOptions })
            .then((blob) => {
                const extension = getExtensionFromMimeType(blob.type);

                // turn into File object
                output = blobToFile(
                    blob,
                    `${isFunction(filename) ? filename(blob) : filename}${extension}`
                );

                // set file
                setFileInputValue(fileInput, output);
                fileInput.dispatchEvent(new CustomEvent('change', { bubbles: true }));

                oncapture?.(output);
                dispatchCustomEvent(root, 'capture', { detail: output });

                // done processing
                cameraState = ['ready', 'preview'];
            })
            .catch((err) => {
                onerror?.(err);
                dispatchCustomEvent(root, 'error', { detail: err });
            });
    }

    let cameraRect = $state<Rect | null>(null);
    function handleMeasureCamera(bounds: Bounds) {
        if (!videoSize) {
            return;
        }

        cameraRect = rectFromBounds(bounds);
    }

    const cameraTranslation = $derived(
        cameraRect && videoSize
            ? {
                  x: (cameraRect.width - videoSize.width) * 0.5,
                  y: (cameraRect.height - videoSize.height) * 0.5,
              }
            : {
                  x: 0,
                  y: 0,
              }
    );

    const cameraScalar = $derived(
        cameraRect && videoSize
            ? Math.min(cameraRect.width / videoSize.width, cameraRect.height / videoSize.height)
            : 1
    );

    // clean up when unmounted
    onDestroy(() => {
        if (!videoRef) {
            return;
        }

        // stop stream
        const stream = videoRef.srcObject as MediaStream | null;
        stream?.getTracks().forEach((track) => {
            track.stop();
        });

        // clean up
        videoRef.pause();
        videoRef.srcObject = null;
    });
</script>

<camera-input>
    <div
        bind:this={root}
        class="camera"
        data-state={cameraState.join(' ')}
        style:--scalar={cameraScalar}
        style:--translate-x={`${cameraTranslation.x}px`}
        style:--translate-y={`${cameraTranslation.y}px`}
        style:--progress-opacity={hasUserMedia ? 0 : 1}
        {@attach measurable({
            onmeasure: handleMeasureCamera,
        })}
    >
        {#if statusMessage}
            <!-- error state -->
            <p class="status">{statusMessage}</p>
        {:else}
            <!-- Waiting state -->
            <ProgressIndicator value={Infinity}></ProgressIndicator>
        {/if}

        <!-- Live video feed -->
        <video
            class="feed"
            bind:this={videoRef}
            onloadedmetadata={handleFeedMetadata}
            onloadeddata={handleFeedReady}
        ></video>

        <!-- Resulting image -->
        <canvas class="preview" bind:this={previewRef}></canvas>

        <div class="camera-footer">
            <!-- Resulting file -->
            <input class="implicit" bind:this={fileInput} type="file" {name} {required} />

            <!-- Capture buttons -->
            {#if hasUserMedia}
                <button
                    title={labelCapture}
                    class="capture"
                    type="button"
                    disabled={!!output}
                    onclick={handleCapture}>{labelCapture}</button
                >
                <button
                    class="reset"
                    type="button"
                    disabled={!output}
                    onclick={handleReset}
                    title={labelReset}
                    aria-label={labelReset}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1"
                        />
                        <path
                            d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005z"
                        />
                    </svg>
                </button>
            {/if}
        </div>
    </div>
</camera-input>
