<script lang="ts">
    import type { ExtensionState, ExtensionStatus, Locale } from '../../../../types/index.js';
    import { getExtensionStatusItems } from '../../../../common/entry.js';
    import { statusToLabel, statusToIcon } from '../../../common/string.js';
    import { arrayRemoveFalsy } from '../../../../utils/array.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { getEntryContext } from '../../contexts/entryContext.js';
    import { SpringElement } from '../../../components/SpringElement/index.js';
    import { ElementPane } from '../../../components/ElementPane/index.js';

    interface EntryStatusOptions {
        class?: string;

        part?: string;
    }

    let { class: klass = undefined, part = undefined }: EntryStatusOptions = $props();

    // get locale and assets
    const appContext = getAppContext();
    const assets = $derived(appContext.assets);
    const locale = $derived(appContext.locale);

    // get store
    const entryContext = getEntryContext();

    // list of extension objects
    const extensions: ExtensionState[] = $derived(Object.values(entryContext.current.extension));

    const StatusWeights: { [key: string]: number } = {
        error: 5,
        warning: 4,
        success: 3,
        info: 2,
        system: 1,
    };

    function mapStatusProps(
        { code, subcode, type, values }: ExtensionStatus,
        locale: Locale,
        assets: { [key: string]: string }
    ) {
        const text = statusToLabel({ code, subcode, values }, locale);
        const icon = statusToIcon({ type }, locale, assets);

        // no status to show
        if (!text || !icon) {
            return;
        }

        return {
            weight: StatusWeights[type],
            code,
            type,
            icon,
            text,
        };
    }

    const messages = $derived(
        arrayRemoveFalsy(
            arrayRemoveFalsy(getExtensionStatusItems(extensions)).map((status) =>
                mapStatusProps(status, locale, assets)
            )
        ).sort((a, b) => {
            return a.weight < b.weight ? 1 : -1;
        })
    );
</script>

{#if messages.length}
    <entry-status class={klass} {part}>
        <ul>
            <!-- we don't use a key because it's fine if status is overwritten -->
            {#each messages as { icon, text, type }}
                <SpringElement
                    tag="li"
                    class="entry-status-message"
                    subclass="entry-status-message-content"
                    dataset={{ type }}
                >
                    {#snippet children({ visualRect })}
                        {#if icon}{@html icon}{/if}
                        <span>{text}</span>
                        {#if visualRect}
                            <ElementPane width={visualRect.width} height={visualRect.height} />
                        {/if}
                    {/snippet}
                </SpringElement>
            {/each}
        </ul>
    </entry-status>
{/if}
