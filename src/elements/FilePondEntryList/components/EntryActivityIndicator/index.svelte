<script lang="ts">
    import { untrack } from 'svelte';
    import { Spring } from 'svelte/motion';
    import { getUniqueId } from '../../../../utils/string.js';
    import { getExtensionStateByStatusCode } from '../../../../common/entry.js';
    import { isObjectValuesEqual } from '../../../../utils/object.js';
    import { getValueByKeyFromData } from '../../../common/string.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { getEntryContext } from '../../contexts/entryContext.js';
    import { gate } from '../../../common/store.svelte.js';
    import { SpringElement } from '../../../components/SpringElement/index.js';
    import { Button } from '../../../components/Button/index.js';
    import { ProgressIndicator } from '../../../components/ProgressIndicator/index.js';
    import { type ExtensionState } from '../../../../types/index.js';
    import { NodeList, type NodeListOptions } from '../../../components/NodeList/index.js';

    interface EntryActivityIndicatorOptions {
        /** Class to set on the entry-activity-indicator element */
        class?: string;

        /** The part name to assign to this component */
        part?: string;

        states: any;

        /** The part name to assign to buttons inside this component */
        buttonPart?: string;

        /** Context for the local nodelist */
        nodeContext: Omit<NodeListOptions, 'nodes'>;
    }

    let {
        class: klass = undefined,
        part = undefined,
        buttonPart = undefined,
        states = [],
        nodeContext,
    }: EntryActivityIndicatorOptions = $props();

    // get locale and assets
    const { locale, enableAnimations } = $derived(getAppContext());

    // get store
    const entryContext = getEntryContext();

    // list of extension objects
    const extensions = $derived(Object.values(entryContext.current.extension)) as ExtensionState[];

    function getState(states: any[], extensions: ExtensionState[]) {
        // no states to check
        if (!states.length) {
            return;
        }

        for (const state of states) {
            // get matching extension state from list of extension, we'll match the extension status with the list of codes
            const extensionStatus = getExtensionStateByStatusCode(extensions, state.codes);

            // none found, skip to continue to next possible state
            if (!extensionStatus) {
                continue;
            }

            // test if no state change current state
            const button = state.button;
            const progress = state.progress
                ? { ...state.progress, value: extensionStatus.progress }
                : null;

            return {
                button,
                progress,
            };
        }

        // no current state
        return null;
    }

    // get current state
    const currentState = $derived(getState(states, extensions));

    // get progress value
    const currentProgress = $derived(currentState?.progress);

    const currentButton = $derived(getButtonComponent(currentState?.button));

    // current button, we only update if props change
    const activeButton: { current: any } = gate(
        // should update value?
        (prev: any, curr: any) => {
            if (prev && curr) {
                return !isObjectValuesEqual(prev, curr);
            }
            return prev !== curr;
        },
        // $derived
        () => {
            return currentButton;
        }
    );

    function getButtonComponent(button: any) {
        if (!button) {
            return;
        }

        const props = { part: buttonPart, ...button.props };
        return {
            component: Button,
            ...button,
            props,
        };
    }

    function getProgressIndicatorProps(progressIndicator: any, locale: { [key: string]: string }) {
        if (!progressIndicator) {
            return;
        }
        const { label } = progressIndicator;
        return {
            ...progressIndicator,
            label: getValueByKeyFromData(label, locale, locale['busy']),
        };
    }

    const currentProgressIndicatorControl = $derived(
        getProgressIndicatorProps(currentProgress, locale as { [key: string]: string })
    );

    const currentProgressIndicatorControlOpacity = new Spring(0);
    $effect(() => {
        currentProgressIndicatorControlOpacity.set(currentProgressIndicatorControl ? 1 : 0, {
            instant: !enableAnimations,
        });
    });

    let lastProgressIndicatorControlState: any = $state.raw();
    $effect(() => {
        if (currentProgressIndicatorControl) {
            lastProgressIndicatorControlState = { ...currentProgressIndicatorControl };
        }
    });

    function lastButtonNodeHasSameIcon(nextButton: any) {
        const willReplaceButton = !!buttonNodes.at(-1);
        if (!willReplaceButton) {
            return false;
        }

        return (buttonNodes.at(-1) as any)?.props.icon !== nextButton.props.icon;
    }

    function lastButtonIsSameButton(nextButton: any) {
        if (!buttonNodes.length) {
            return false;
        }

        const { props: currentProps } = buttonNodes.at(-1);
        const { props: nextProps } = nextButton;

        return (
            currentProps.icon === nextProps.icon &&
            currentProps.title === nextProps.title &&
            currentProps.label === nextProps.label &&
            currentProps.onclick.toString() === nextProps.onclick.toString()
        );
    }

    let buttonNodes: any[] = $state.raw([]);
    $effect(() => {
        // no control, no need to update
        if (!activeButton.current && !buttonNodes.length) {
            return;
        }

        // no more controls
        if (!activeButton.current) {
            buttonNodes = [];
            return;
        }

        // set outro states for existing buttons, add new button in "idle" state
        untrack(() => {
            if (lastButtonIsSameButton(activeButton.current)) {
                // only update button props
                return (buttonNodes = buttonNodes.map((control) => {
                    if (control.key === activeButton.current.key) {
                        return activeButton.current;
                    }
                    return control;
                }));
            }

            // if last button icon is the same as new button icon, we don't crossfade
            const shouldCrossfade = lastButtonNodeHasSameIcon(activeButton.current);

            buttonNodes = buttonNodes
                // old controls now inert
                .map((control) => ({
                    ...control,
                    props: {
                        ...control.props,
                        inert: true,
                        dataset: { state: shouldCrossfade ? 'outro' : 'idle' },
                    },
                }))
                // remove old controls
                .filter((_, index, arr) => index > arr.length - 2);

            // add new control
            buttonNodes = [
                ...buttonNodes,
                {
                    ...activeButton.current,
                    props: {
                        ...activeButton.current.props,
                        inert: shouldCrossfade,
                        dataset: { state: shouldCrossfade ? 'intro' : 'idle' },
                    },
                },
            ];

            // else don't animate
            if (shouldCrossfade) {
                // this triggers intro animation on newly added control
                requestAnimationFrame(() => {
                    buttonNodes = buttonNodes.map((control, index, arr) => ({
                        ...control,
                        props: {
                            ...control.props,
                            inert: index < arr.length - 1,
                            dataset: { state: index < arr.length - 1 ? 'outro' : 'idle' },
                        },
                    }));
                });
            }
        });
    });

    const buttonsTemplate = $derived.by(() => {
        if (!buttonNodes.length) {
            return [];
        }
        return [
            {
                tag: 'element-stack',
                attrs: {
                    layout: 'pile',
                    class: 'button-pile',
                    part: `${buttonPart}-pile`,
                },
                children: buttonNodes,
            },
        ];
    });
</script>

<SpringElement
    tag="entry-activity-indicator"
    class={klass}
    subtag="element-stack"
    subattrs={{ layout: 'pile' }}
    {part}
>
    {#if buttonsTemplate.length}
        <NodeList nodes={buttonsTemplate} {...nodeContext}></NodeList>
    {/if}<!-- no return here as we use element-pile:empty in css -->{#if currentProgressIndicatorControlOpacity.current > 0}
        <div
            style:opacity={currentProgressIndicatorControlOpacity.current}
            part={`${buttonPart}-pile`}
        >
            <ProgressIndicator {...lastProgressIndicatorControlState} {enableAnimations} />
        </div>
    {/if}
</SpringElement>
