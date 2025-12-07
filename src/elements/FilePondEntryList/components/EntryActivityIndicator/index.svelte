<script lang="ts">
    import { untrack } from 'svelte';
    import { Spring } from 'svelte/motion';
    import { getUniqueId } from '../../../../utils/string.js';
    import { getExtensionStateByStatusCode } from '../../../../common/entry.js';
    import { isObjectValuesEqual } from '../../../../utils/object.js';
    import { getValueByKeyFromData, withResources } from '../../../common/string.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { getEntryContext } from '../../contexts/entryContext.js';
    import { gate } from '../../../common/store.svelte.js';
    import { SpringElement } from '../../../components/SpringElement/index.js';
    import { Button } from '../../../components/Button/index.js';
    import { ProgressIndicator } from '../../../components/ProgressIndicator/index.js';
    import type { ExtensionState } from '../../../../types/index.js';

    interface EntryActivityIndicatorOptions {
        /** Class to set on the entry-activity-indicator element */
        class?: string;

        /** The part name to assign to this component */
        part?: string;

        /** The part name to assign to buttons inside this component */
        buttonPart?: string;

        /** Disable inner controls */
        disabled?: boolean;

        states: any;
    }

    let {
        class: klass = undefined,
        part = undefined,
        buttonPart = undefined,
        disabled = false,
        states = [],
    }: EntryActivityIndicatorOptions = $props();

    // get locale and assets
    const { resources, locale, propResourceMap, enableAnimations } = $derived(getAppContext());

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

    const currentButton = $derived(getButtonComponent(currentState?.button, resources));

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

    function getButtonComponent(button: any, resources: any) {
        if (!button) {
            return;
        }

        let styles = undefined;
        if (button.transforms) {
            const { intro, idle, outro } = button.transforms;
            const key = '--indicator-button-';
            styles = {
                [`${key}intro`]: intro,
                [`${key}idle`]: idle,
                [`${key}outro`]: outro,
            };
        }

        return {
            component: Button,
            props: withResources(
                {
                    ...button,
                    icon: button.icon,
                    title: button.title ?? button.icon,
                    label: button.label ?? button.icon,
                    styles,
                },
                propResourceMap,
                resources
            ),
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

    function lastButtonControlHasSameIcon(nextButton: any) {
        const willReplaceButton = !!buttonControls.at(-1);
        if (!willReplaceButton) {
            return false;
        }
        return (buttonControls.at(-1) as any)?.props.icon !== nextButton.props.icon;
    }

    function lastButtonIsSameButton(nextButton: any) {
        if (!buttonControls.length) {
            return false;
        }
        const currentButton = buttonControls.at(-1);

        return (
            currentButton.props.icon === nextButton.props.icon &&
            currentButton.props.title === nextButton.props.title &&
            currentButton.props.label === nextButton.props.label &&
            currentButton.props.onclick.toString() === nextButton.props.onclick.toString()
        );
    }

    let buttonControls: any[] = $state.raw([]);
    $effect(() => {
        // no control, no need to update
        if (!activeButton.current && !buttonControls.length) {
            return;
        }

        // no more controls
        if (!activeButton.current) {
            buttonControls = [];
            return;
        }

        // set outro states for existing buttons, add new button in "idle" state
        untrack(() => {
            if (lastButtonIsSameButton(activeButton.current)) {
                return;
            }

            // if last button icon is the same as new button icon, we don't crossfade
            const shouldCrossfade = lastButtonControlHasSameIcon(activeButton.current);

            buttonControls = buttonControls
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
            buttonControls = [
                ...buttonControls,
                {
                    ...activeButton.current,
                    key: getUniqueId(),
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
                    buttonControls = buttonControls.map((control, index, arr) => ({
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
</script>

<SpringElement
    tag="entry-activity-indicator"
    class={klass}
    subtag="element-stack"
    subattrs={{ layout: 'pile' }}
    {part}
>
    {#if buttonControls.length}
        <element-stack class="button-pile" layout="pile" part={buttonPart}>
            {#each buttonControls as { component: Component, props, key } (key)}
                <Component {...props} {disabled} />
            {/each}
        </element-stack>
    {/if}<!-- no return here as we use element-pile:empty in css -->{#if currentProgressIndicatorControlOpacity.current > 0}
        <div style:opacity={currentProgressIndicatorControlOpacity.current} part={buttonPart}>
            <ProgressIndicator {...lastProgressIndicatorControlState} {enableAnimations} />
        </div>
    {/if}
</SpringElement>
