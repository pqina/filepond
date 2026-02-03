import { type EntryListFunctions } from '../types/index.js';
import { type MediaVideoOptions } from '../elements/FilePondEntryList/components/MediaVideo/index.js';
import {
    createButton,
    createSpringPane,
    getExtensionByAction,
    hasExtensionWithStatusCode,
    hasExtensionWithStatusType,
    whenEntryHasAction,
    whenEntryIs,
    whenEntryNotHasStatus,
} from './helpers.js';
import { RangeInput } from '../elements/components/RangeInput/index.js';
import { supportsRequestFullscreen } from '../utils/support.js';
import { toTime } from '../utils/date.js';
import { type NodeContext, type TemplateNode, nodeTree } from '../elements/common/nodeTree.js';
import { boolToAttributeValue } from '../utils/dom.js';
import { MediaVideo } from '../elements/FilePondEntryList/components/MediaVideo/index.js';
import { MediaTimeIndicator } from '../elements/FilePondEntryList/components/MediaTimeIndicator/index.js';
import { EntryActivityIndicator } from '../elements/FilePondEntryList/components/EntryActivityIndicator/index.js';
import {
    type MediaImageOptions,
    MediaImage,
} from '../elements/FilePondEntryList/components/MediaImage/index.js';
import { SpringElement } from '../elements/components/SpringElement/index.js';

export type VideoViewOptions = Omit<MediaVideoOptions, 'class' | 'children'>;

export type ImageViewOptions = Omit<MediaImageOptions, 'class'>;

export function createEditMediaButton(options?: { action?: string }) {
    const { action = 'editMedia' } = options ?? {};

    return {
        key: 'button-media-edit',
        component: EntryActivityIndicator,
        props: ({ id, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
            buttonPart: 'media-button',
            states: [
                {
                    // waiting for transform
                    codes: [
                        'TRANSFORM_IDLE',
                        'TRANSFORM_CANCEL',
                        'TRANSFORM_COMPLETE',
                        'TRANSFORM_BUSY',
                    ],
                    button: createButton('button-transform-activate', {
                        icon: 'mediaEdit',
                        onclick: () => updateEntryState?.(id, { [action]: true }),
                        disabled: hasExtensionWithStatusCode(entry, [
                            'STORE_QUEUED',
                            'STORE_BUSY',
                            'TRANSFORM_BUSY',
                        ]),
                    }),
                },
                {
                    codes: ['TRANSFORM_PREPARE'],
                    progress: true,
                    button: createButton('button-transform-abort', {
                        icon: 'abort',
                        onclick: () =>
                            updateEntryState(id, {
                                [action]: null,
                            }),
                        disabled: hasExtensionWithStatusCode(entry, [
                            'STORE_QUEUED',
                            'STORE_BUSY',
                            'TRANSFORM_BUSY',
                        ]),
                    }),
                },
            ],
        }),
    };
}

export function createResetMediaButton(options?: { action?: string }) {
    const { action = 'editMedia' } = options ?? {};
    return createButton('button-media-reset', {
        props: ({ id, entry }: NodeContext, { updateEntryState }: EntryListFunctions) => ({
            buttonPart: 'media-button',
            disabled:
                hasExtensionWithStatusCode(entry, [
                    'STORE_QUEUED',
                    'STORE_BUSY',
                    'TRANSFORM_PREPARE',
                    'TRANSFORM_BUSY',
                ]) || !getExtensionByAction(entry, action)?.input,
            icon: 'mediaReset',
            label: 'reset',
            title: 'reset',
            onclick: () => updateEntryState?.(id, { [action]: false }),
        }),
    });
}

export function createImageView(options?: ImageViewOptions) {
    const { objectSize = undefined } = options ?? {};

    return {
        key: 'entry-image-spring',
        component: SpringElement,
        props: {
            class: 'entry-media',
            part: 'entry-media',
        },
        children: [
            {
                key: 'entry-image',
                component: MediaImage,
                props: options,
            },
            {
                if: {
                    test: () => objectSize === 'contain',
                    then: createSpringPane({
                        key: 'entry-image-pane',
                        class: 'media-pane',
                    }),
                },
            },
            createSpringPane({
                key: 'entry-image-overlay',
                class: 'media-overlay',
                part: 'media-overlay',
            }),
        ],
    };
}

function getMediaContextReference({ entry }: NodeContext): NodeContext {
    const { media, video } = entry.extension.EntryListView || {};
    return {
        media,
        video,
    };
}

export function createVideoView(options?: VideoViewOptions) {
    const { objectSize = undefined } = options ?? {};
    return {
        key: 'entry-video-spring',
        component: SpringElement,
        props: {
            class: 'entry-media',
            part: 'entry-media',
        },
        children: [
            {
                key: 'entry-video',
                component: MediaVideo,
                props: options,
            },
            {
                if: {
                    test: () => objectSize === 'contain',
                    then: createSpringPane({
                        key: 'entry-video-pane',
                        class: 'media-pane',
                    }),
                },
            },
            createSpringPane({
                key: 'entry-video-overlay',
                class: 'media-overlay',
                part: 'media-overlay',
            }),
        ],
    };
}

export function createMediaControlGroup(options?: {
    key?: string;
    justifyContent?: 'stretch' | 'start' | 'end';
}) {
    const { key, justifyContent } = options || {};

    const klass =
        'media-control-group' + (justifyContent ? ` justify-content-${justifyContent}` : '');

    return nodeTree({
        key,
        component: SpringElement,
        props: {
            subtag: 'element-stack',
            class: klass,
        },
        children: [
            createSpringPane({
                key: 'media-control-group-background',
                class: 'media-control-pane',
            }),
        ],
    });
}

export function createMediaControl(options?: { key?: string }) {
    const { key } = options || {};
    return nodeTree({
        key,
        component: SpringElement,
        props: {
            subtag: 'element-stack',
            class: 'media-control',
        },
        children: [
            createSpringPane({
                key: 'media-control-background',
                class: 'media-control-pane',
            }),
        ],
    });
}

export function createMediaControls(options?: {
    key?: string;
    justifyContent?: 'stretch' | 'start' | 'end';
}) {
    const { key = 'media-controls', justifyContent } = options || {};
    const klass =
        'entry-media-controls' + (justifyContent ? ` justify-content-${justifyContent}` : '');
    return nodeTree({
        if: {
            // don't render media controls if in error state
            test: ({ entry }: NodeContext) => {
                return !hasExtensionWithStatusType(entry, ['error']);
            },
            then: {
                key,
                tag: 'element-stack',
                context: getMediaContextReference,
                attrs: ({ media, video }) => {
                    return {
                        class: klass,
                        part: 'media-controls',
                        'data-media-is-visible': boolToAttributeValue(media?.isVisible),
                        'data-media-is-playing': boolToAttributeValue(video?.isPlaying),
                    };
                },
            },
        },
    });
}

export function createTogglePlaybackButton() {
    return {
        key: 'toggle-playback-spring',
        component: SpringElement,
        props: {
            class: 'toggle-playback',
        },
        children: createButton('toggle-playback', ({ video }: NodeContext) => ({
            icon: video?.isPaused ? 'mediaPlay' : 'mediaPause',
        })),
    };
}

export function createToggleAudioButton() {
    return {
        key: 'toggle-audio-spring',
        component: SpringElement,
        props: {
            class: 'toggle-audio',
        },
        children: createButton('toggle-audio', ({ video }: NodeContext) => ({
            icon: video?.isMute ? 'mediaSilent' : video?.isMuted ? 'mediaUnmute' : 'mediaMute',
            disabled: video?.isMute,
        })),
    };
}

export function createToggleFullscreenButton() {
    return {
        // only added when fullscreen is supported
        if: {
            test: supportsRequestFullscreen,
            then: {
                key: 'toggle-fullscreen-spring',
                component: SpringElement,
                props: {
                    class: 'toggle-fullscreen',
                },
                children: createButton('toggle-fullscreen', {
                    icon: 'mediaFullscreen',
                }),
            },
        },
    };
}

export function createMediaScrubber() {
    return {
        key: 'media-scrubber-spring',
        component: SpringElement,
        props: {
            class: 'media-scrubber',
        },
        children: [
            {
                key: 'media-scrubber',
                component: RangeInput,
                props: ({ video }: NodeContext) => ({
                    step: video?.framesPerSecond,
                    value: video?.time,
                    min: 0,
                    max: video?.duration,
                }),
            },
        ],
    };
}

export function createMediaScrubberTitle() {
    return {
        key: 'media-scrubber-title',
        tag: 'time',
        context: ({ hoverValue }: NodeContext) => ({
            time: toTime(hoverValue),
        }),
        attrs: ({ time }: NodeContext) => ({
            datetime: time,
        }),
        children: `{{time}}`,
    };
}

export function createMediaTimeIndicator() {
    return {
        key: 'media-time-indicator-spring',
        component: SpringElement,
        props: {
            class: 'media-time-indicator',
        },
        children: {
            key: 'media-time-indicator',
            component: MediaTimeIndicator,
            props: ({ video }: NodeContext) => ({
                timeISO: video?.timeISO,
                timeLabel: video?.timeLabel,
                durationISO: video?.durationISO,
                durationLabel: video?.durationLabel,
            }),
        },
    };
}

export function appendEntryImageView(
    template: TemplateNode[],
    options?: { imageViewOptions?: MediaImageOptions }
) {
    const { imageViewOptions } = options ?? {};

    nodeTree(template)
        .find('entry')
        .append(
            whenEntryIs('image').append(
                createImageView(imageViewOptions),
                whenEntryNotHasStatus('error').append(
                    whenEntryHasAction('editMedia').append(
                        createMediaControls({ justifyContent: 'end' }).append(
                            createMediaControl().append(createResetMediaButton()),
                            createMediaControl().append(createEditMediaButton())
                        )
                    )
                )
            )
        );

    return template;
}

export function appendEntryVideoView(
    template: TemplateNode[],
    options?: { videoViewOptions?: VideoViewOptions }
) {
    const { videoViewOptions } = options ?? {};
    nodeTree(template)
        .update('entry', (node: any) => {
            node.routes = {
                'toggle-playback:click': 'entry-video.togglePlayback',
                'toggle-audio:click': 'entry-video.toggleAudio',
                'toggle-fullscreen:click': 'entry-video.toggleFullscreen',
                'media-scrubber:input': 'entry-video.setCurrentTime',
            };
        })
        .append(
            whenEntryIs('video').append(
                createVideoView(videoViewOptions),
                whenEntryNotHasStatus('error').append(
                    createMediaControls().append(
                        createMediaControlGroup({ key: 'video-controls' }).append(
                            createTogglePlaybackButton(),
                            createMediaScrubber(),
                            createMediaTimeIndicator(),
                            createToggleAudioButton()
                        ),
                        whenEntryHasAction('editMedia').append(
                            createMediaControl().append(createResetMediaButton()),
                            createMediaControl().append(createEditMediaButton())
                        )
                    )
                )
            )
        );
    return template;
}
