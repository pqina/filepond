<script lang="ts">
    import { type MediaVideoOptions } from './index.js';
    import { onDestroy, untrack } from 'svelte';
    import { toTime } from '../../../../utils/date.js';
    import { isIOS, isNumber, isSafari } from '../../../../utils/test.js';
    import { videoHasAudioTrack } from '../../../../utils/dom.js';
    import { MediaPane } from '../MediaPane/index.js';
    import { once } from '../../../common/event.js';
    import { createObjectURL } from '../../../../utils/objectURL.js';
    import { getAppContext } from '../../../../elements/FilePondEntryList/contexts/appContext.js';
    import { getEntryContext } from '../../../../elements/FilePondEntryList/contexts/entryContext.js';
    import { Status } from '../../../../common/status.js';
    import { supportsRequestVideoFrameCallback } from '../../../../utils/support.js';

    let {
        class: klass = undefined,
        overflowAmount = undefined,
        enableParallax = undefined,
        objectSize = undefined,
        mute = true,
        children = undefined,
    }: MediaVideoOptions = $props();

    // get app
    const { setEntryExtensionState, pushTask } = getAppContext();

    // get store
    const entryContext = getEntryContext();

    // current file
    const { file } = $derived(entryContext.current) as { file: File | Blob };
    const hasFile = $derived(file !== null);

    // Video src to load
    const useSrcObject = isIOS() && isSafari();
    const src = $derived(useSrcObject ? undefined : hasFile ? createObjectURL(file) : undefined);
    const srcObject = $derived(useSrcObject ? (hasFile ? file : undefined) : undefined);

    // All for video controls
    let videoElement = $state.raw() as HTMLVideoElement;

    /**
     * Holds the video frame rate, hardcoded for now, AFAIK there's no real/fast way to get the
     * actual video fps FPS
     */
    let framesPerSecond: number = 1 / 24;

    /** Holds the video current time location */
    let currentTime: number = $state.raw(0);

    /** Holds The video duration in seconds */
    let duration: number | null = $state.raw(null);

    /** Is true if the video element has an audio track, is false if not, is null when undetermined */
    let isMute: boolean | null = $state.raw(null);

    /** Is true if the video is muted */
    let isMuted: boolean = $derived(mute);

    /** Is true if the video is playing */
    let isPlaying: boolean = $state.raw(false);

    /** Is true if the video is fullscreen */
    let isFullscreen: boolean = $state.raw(false);

    /** In in error state */
    let hasError = $state(false);

    const timeStr = $derived(toTime(currentTime));
    const durationStr = $derived(isNumber(duration) ? toTime(duration) : undefined);
    const durationStrISO = $derived(isNumber(duration) ? `${duration}S` : undefined);

    /* Public API */
    export function togglePlayback() {
        if (!videoElement) {
            return;
        }

        if (videoElement.paused) {
            videoElement
                .play()
                .then(() => {
                    // reset error state
                    setEntryExtensionState(entryContext.current, {
                        status: {
                            type: Status.System,
                            code: 'MEDIA_PLAY_BUSY',
                        },
                    });
                })
                .catch((error) => {
                    // show error state
                    setEntryExtensionState(entryContext.current, {
                        status: {
                            type: Status.Error,
                            code: 'MEDIA_PLAY_ERROR',
                            values: { error },
                        },
                    });
                });
        } else {
            videoElement.pause();

            setEntryExtensionState(entryContext.current, {
                status: {
                    type: Status.System,
                    code: 'MEDIA_PLAY_PAUSED',
                },
            });
        }
    }

    export function toggleAudio() {
        if (!videoElement) {
            return;
        }

        videoElement.muted = !videoElement.muted;
        isMuted = videoElement.muted;
    }

    export function toggleFullscreen() {
        if (!videoElement) {
            return;
        }

        if (isFullscreen) {
            document.exitFullscreen();
            isFullscreen = false;
        } else {
            videoElement.requestFullscreen().then(() => (isFullscreen = true));
        }
    }

    export function setCurrentTime(value: number) {
        if (!videoElement) {
            return;
        }

        // this prevents Chrome from throwing an "PipelineStatus::PIPELINE_ERROR_READ: FFmpegDemuxer: demuxer seek failed" error when trying to set currentTime while it's still seeking
        if (videoElement.seeking) {
            videoElement.onseeked = () => {
                videoElement.onseeked = null;
                setCurrentTime(value);
            };
            return;
        }

        videoElement.currentTime = value;
        currentTime = value;
    }

    // We pass these to MediaPane so it can scale/animate media content
    let videoWidth: number | undefined = $state.raw();
    let videoHeight: number | undefined = $state.raw();
    let videoVisible: boolean = $state.raw(false);
    let videoLoading: boolean = $state.raw(true);

    /** Handle video has something to display */
    function handleVideoLoadedData() {
        videoLoading = false;
        videoWidth = videoElement.videoWidth;
        videoHeight = videoElement.videoHeight;
        duration = videoElement.duration;

        // test if has audio track
        videoHasAudioTrack(videoElement).then((hasAudio) => {
            isMute = !hasAudio;
        });

        // if we couldn't sync with frame draw we expect the video to be ready now
        if (!supportsRequestVideoFrameCallback()) {
            videoVisible = true;
        }
    }

    /** Video control handlers */
    function handleVideoPlay() {
        isPlaying = true;
    }

    function handleVideoPause() {
        isPlaying = false;
    }

    /** Sync media object state with element currentTime */
    let animationFrame: number;
    function startRedrawProgress() {
        // clear current animation just to be sure
        cancelAnimationFrame(animationFrame);

        // sync time when starting (needed for our friend Safari)
        if (isSafari()) {
            videoElement.currentTime = currentTime;
        }

        // syncs current time state with video current time
        const redraw = () => {
            if (!isPlaying) {
                return;
            }

            currentTime = videoElement.currentTime;
            animationFrame = requestAnimationFrame(redraw);
        };

        // start redraw loop
        redraw();
    }

    $effect(() => {
        if (!isPlaying) {
            return;
        }

        // we just want to react to play state once
        untrack(startRedrawProgress);
    });

    /** Routes video errors to an entry status */
    function handleVideoError() {
        const { error } = videoElement;

        console.error(error);

        // load error
        setEntryExtensionState(entryContext.current, {
            status: {
                type: Status.Error,
                code: 'MEDIA_LOAD_ERROR',
                values: { error, fileMainType: 'fileMainTypeVideo' },
            },
        });

        // error
        hasError = true;
    }

    // Specifically to make this work on iOS Safari
    function taskLoadMediaWithSrcObject() {
        // exif if did already load this source
        if (videoElement.srcObject == srcObject) {
            return;
        }

        // we know srcObject is a blob or this function wouldn't be called
        try {
            videoElement.srcObject = srcObject as Blob;
            videoElement.load();
        } catch (error) {
            handleVideoError();
        }
    }

    function observeVideoSrcLoad(element: HTMLVideoElement) {
        return new Promise((resolve, reject) => {
            element.addEventListener('loadeddata', resolve);
            element.addEventListener('error', reject);
        });
    }

    async function taskLoadMediaWithSrc() {
        // exif if did already load this source
        if (videoElement.src === src) {
            return;
        }

        // load source
        videoElement.src = src as string;

        // we test if video loads
        await observeVideoSrcLoad(videoElement);
    }

    $effect(() => {
        // wait for video element and valid source
        if (!videoElement || !(src ?? srcObject)) {
            return;
        }

        // when first frame rendered we show the video
        if (supportsRequestVideoFrameCallback()) {
            // wait for video frame to be presentable
            videoElement.requestVideoFrameCallback(() => {
                videoVisible = true;
            });
        }

        untrack(() => {
            // going to use `src`
            if (src) {
                // let's load media source
                pushTask(entryContext.current.id, taskLoadMediaWithSrc, { parallel: 1 });
                return;
            }

            // load media for iOS Safari
            if (srcObject) {
                pushTask(entryContext.current.id, taskLoadMediaWithSrcObject, { parallel: 1 });
            }
        });
    });

    // add videostate to extension so can be used by UI
    $effect(() => {
        const videoState = {
            isMute: isMute,
            isMuted: isMuted,
            isPaused: !isPlaying,
            isPlaying,
            isFullscreen: isFullscreen,
            timeLabel: timeStr,
            timeISO: timeStr,
            time: currentTime,
            duration: duration,
            durationLabel: durationStr,
            durationISO: durationStrISO,
            framesPerSecond: framesPerSecond,
        };

        untrack(() => {
            setEntryExtensionState(entryContext.current, {
                video: videoState,
            });
        });
    });

    // add media state to extension so can be used by UI
    $effect(() => {
        const mediaState = {
            isVisible: videoVisible,
        };

        untrack(() => {
            setEntryExtensionState(entryContext.current, {
                media: mediaState,
            });
        });
    });

    onDestroy(() => {
        // pause the video so drawing stops
        if (isPlaying) {
            handleVideoPause();
        }

        // release object url if was set
        if (src) {
            URL.revokeObjectURL(src);
        }
    });
</script>

{#if !hasError}
    <media-video class={klass}>
        <MediaPane
            {enableParallax}
            {overflowAmount}
            mediaInitialOpacity={0}
            mediaInitialScalar={0}
            mediaObjectSize={objectSize}
            mediaWidth={videoWidth}
            mediaHeight={videoHeight}
            mediaVisible={videoVisible}
            mediaLoading={videoLoading}
        >
            <video
                bind:this={videoElement}
                playsinline
                muted={isMuted}
                onplay={handleVideoPlay}
                onpause={handleVideoPause}
                onerror={handleVideoError}
                onloadeddata={once(handleVideoLoadedData)}>{@render children?.()}</video
            >
        </MediaPane>
    </media-video>
{/if}
