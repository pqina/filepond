<script lang="ts">
    import { type Snippet } from 'svelte';
    import { type Bounds } from '../../../../utils/bounds.js';
    import { type Size } from '../../../../utils/size.js';

    import { rectCreate, rectFromBounds, rectScale, type Rect } from '../../../../utils/rect.js';
    import { Spring } from 'svelte/motion';
    import { measurable } from '../../../attachments/measurable.js';
    import { getAppContext } from '../../../../elements/FilePondEntryList/contexts/appContext.js';
    import { getSpringElementTreeContext } from '../../../../elements/FilePondEntryList/contexts/springElementTreeContext.js';

    interface MediaPaneOptions {
        /** Set to true when loading media */
        mediaLoading?: boolean;
        /** Media width in pixels */
        mediaWidth?: number;
        /** Media height in pixels */
        mediaHeight?: number;
        /** Set to true when ready to show media */
        mediaVisible?: boolean;
        /** Set to true to animate media into view */
        mediaAnimateIn?: boolean;
        /** Set to 'contain' to present image in container instead of covering the container */
        mediaObjectFit?: 'cover' | 'contain';
        /** Initial media scale, defaults to `1` */
        mediaInitialScalar?: number;
        /** Initial media opacity, defaults to `1` */
        mediaInitialOpacity?: number;
        /** Parallax media when dragging / scrolling */
        enableParallax?: boolean;
        /**
         * The overflow in pixels for the parralax and intro animation effect, defaults to `10`, to
         * disable set to `0`
         */
        overflowAmount?: number;
        /** Children to render on top of the media pane */
        children: Snippet<
            [
                {
                    onInitMedia: () => void;
                    onLoadMedia: (size: Size) => void;
                    onRenderMedia: (options?: { instant: boolean }) => void;
                },
            ]
        >;
    }

    let {
        mediaWidth = undefined,
        mediaHeight = undefined,
        mediaVisible = undefined,
        mediaLoading = true,
        mediaObjectFit = 'cover',
        mediaInitialScalar = 1,
        mediaInitialOpacity = 1,
        mediaAnimateIn = true,
        overflowAmount = 10,
        enableParallax = true,
        children,
    }: MediaPaneOptions = $props();

    // animation to reveal media
    const revealConfig = {
        stiffness: 0.1,
        damping: 0.8,
        precision: 0.01,
    };

    // svelte-ignore state_referenced_locally
    const mediaOpacity = new Spring(mediaInitialOpacity, revealConfig);

    // svelte-ignore state_referenced_locally
    const mediaScalar = new Spring(mediaInitialScalar, revealConfig);

    // context variables
    const { springDefaults, enableAnimations } = $derived(getAppContext());
    const springContext = getSpringElementTreeContext();
    const { currentScale } = $derived(springContext);

    // @ts-ignore
    let mediaPaneTargetRect: Rect = $state.raw(null);

    // @ts-ignore
    const mediaPaneCurrentRect: Spring<Rect> = new Spring(undefined);
    $effect(() => {
        if (!springDefaults) {
            return;
        }
        Object.assign(mediaPaneCurrentRect, springDefaults);
    });

    const springUpdateConfig = $derived({
        instant: !enableAnimations,
    });

    // adjust page offset for parralax effect
    let windowWidth: number = $state.raw() as number;
    let windowHeight: number = $state.raw() as number;

    // test if media is ready
    const mediaReady = $derived(!mediaLoading && !!(mediaWidth && mediaHeight));
    const mediaAspectRatio = $derived(
        mediaReady ? (mediaWidth as number) / (mediaHeight as number) : null
    );
    const mediaPaneWidth = $derived(
        mediaPaneCurrentRect.current ? mediaPaneCurrentRect.current.width : null
    );
    const mediaPaneHeight = $derived(
        mediaPaneCurrentRect.current ? mediaPaneCurrentRect.current.height : null
    );

    // center media in panel
    const mediaTranslateX = $derived(
        mediaReady ? (mediaPaneWidth as number) * 0.5 - (mediaWidth as number) * 0.5 : 0
    );
    const mediaTranslateY = $derived(
        mediaReady ? (mediaPaneHeight as number) * 0.5 - (mediaHeight as number) * 0.5 : 0
    );

    function getMathMinOrMaxFunction(objectFit: 'contain' | 'cover') {
        return Math[objectFit === 'cover' ? 'max' : 'min'];
    }

    // scale value covers panel with media
    const mediaScale = $derived(
        mediaReady
            ? getMathMinOrMaxFunction(mediaObjectFit)(
                  (mediaPaneWidth as number) / (mediaWidth as number),
                  (mediaPaneHeight as number) / (mediaHeight as number)
              )
            : null
    );

    const mediaOverflowScale = $derived(
        mediaReady
            ? getMathMinOrMaxFunction(mediaObjectFit)(
                  ((mediaPaneWidth as number) + overflowAmount * 2) / (mediaWidth as number),
                  ((mediaPaneHeight as number) + overflowAmount * 2) / (mediaHeight as number)
              ) - (mediaScale as number)
            : null
    );

    const mediaOffsetX = $derived(
        mediaReady && enableParallax && mediaPaneCurrentRect.current
            ? (mediaPaneCurrentRect.current.x + mediaPaneCurrentRect.current.width) /
                  (windowWidth + mediaPaneCurrentRect.current.width)
            : null
    );

    const mediaOffsetY = $derived(
        mediaReady && enableParallax && mediaPaneCurrentRect.current
            ? (mediaPaneCurrentRect.current.y + mediaPaneCurrentRect.current.height) /
                  (windowHeight + mediaPaneCurrentRect.current.height)
            : null
    );

    $effect(() => {
        mediaOpacity.set(mediaVisible ? 1 : mediaInitialOpacity, {
            instant: mediaAnimateIn ? springUpdateConfig.instant : true,
        });
    });

    $effect(() => {
        mediaScalar.set(mediaVisible ? 1 : mediaInitialScalar, {
            instant: mediaAnimateIn ? springUpdateConfig.instant : true,
        });
    });

    function getOffsetByAspectRatio(
        paneWidth: number,
        paneHeight: number,
        imageAspectRatio: number
    ) {
        let imageWidth = paneWidth;
        let imageHeight = paneWidth / imageAspectRatio;
        if (imageHeight > paneHeight) {
            imageHeight = paneHeight;
            imageWidth = imageHeight * imageAspectRatio;
        }
        return {
            x: (paneWidth - imageWidth) / 2,
            y: (paneHeight - imageHeight) / 2,
            width: imageWidth,
            height: imageHeight,
        };
    }

    const mediaMaskDiff = $derived(
        mediaPaneTargetRect && mediaPaneCurrentRect.current
            ? {
                  width:
                      mediaPaneTargetRect?.width -
                      mediaPaneCurrentRect.current?.width * currentScale,
                  height:
                      mediaPaneTargetRect?.height -
                      mediaPaneCurrentRect.current?.height * currentScale,
              }
            : { width: 0, height: 0 }
    );

    const mediaMaskRect = $derived(
        mediaReady
            ? mediaObjectFit === 'contain'
                ? getOffsetByAspectRatio(
                      mediaPaneWidth as number,
                      mediaPaneHeight as number,
                      mediaAspectRatio as number
                  )
                : rectCreate(0, 0, mediaPaneWidth as number, mediaPaneHeight as number)
            : null
    );

    /* this makes sure the mask never extends beyond its parent bounds (this is useful when media width/height is limited) */
    const mediaMaskCoordinates = $derived(
        mediaMaskRect
            ? {
                  t: mediaMaskRect.y,
                  r: mediaMaskRect.x + mediaMaskDiff.width,
                  b: mediaMaskRect.y + mediaMaskDiff.height,
                  l: mediaMaskRect.x,
              }
            : null
    );

    // compute styles
    const aspectRatio = $derived(mediaAspectRatio ? mediaAspectRatio.toFixed(3) : 'auto');

    /** Handle media pane resized */
    function handleMeasure(bounds: Bounds) {
        const measuredRect = rectFromBounds(bounds);
        if (!measuredRect.width || !measuredRect.height) {
            return;
        }
        updateMediaPaneRect(measuredRect);
    }

    // let updateMediaPaneFrame: number;
    function updateMediaPaneRect(measuredRect: Rect) {
        mediaPaneTargetRect = { ...measuredRect };
        mediaPaneCurrentRect.set(rectScale(measuredRect, 1 / currentScale), springUpdateConfig);
    }
</script>

<!-- So we can slightly offset media inside pane -->
<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<media-pane
    style:--_aspect-ratio={aspectRatio}
    style:--_x={`${mediaTranslateX}px`}
    style:--_y={`${mediaTranslateY}px`}
    style:--_scale={mediaScale}
    style:--_opacity={mediaOpacity.current}
    style:--_scalar={mediaScalar.current}
    style:--_pan-x={mediaOffsetX === null ? 0 : -1 + mediaOffsetX * 2}
    style:--_pan-y={mediaOffsetY === null ? 0 : -1 + mediaOffsetY * 2}
    style:--_overflow-amount={`${overflowAmount}px`}
    style:--_overflow-scale={mediaOverflowScale}
    style:--_mask-top={`${mediaMaskCoordinates?.t ?? 0}px`}
    style:--_mask-right={`${mediaMaskCoordinates?.r ?? 0}px`}
    style:--_mask-bottom={`${mediaMaskCoordinates?.b ?? 0}px`}
    style:--_mask-left={`${mediaMaskCoordinates?.l ?? 0}px`}
    {@attach measurable({
        onmeasure: handleMeasure,
    })}
>
    {@render children({
        onInitMedia: () => {
            mediaLoading = true;
        },
        onLoadMedia: (size) => {
            mediaWidth = size.width;
            mediaHeight = size.height;
            mediaLoading = false;
        },
        onRenderMedia: (options) => {
            const { instant = false } = options || {};
            mediaAnimateIn = !instant;
            mediaVisible = true;
        },
    })}
</media-pane>
