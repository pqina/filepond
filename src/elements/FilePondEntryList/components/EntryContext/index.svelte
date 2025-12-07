<script lang="ts">
    import { type FilePondEntry } from '../../../../types/index.js';
    import { type Snippet } from 'svelte';

    interface EntryContextOptions {
        entry: FilePondEntry;
        children: Snippet<[{ id: string; entry: FilePondEntry }]>;
    }

    import { setEntryContext } from '../../contexts/entryContext.js';

    let { entry, children }: EntryContextOptions = $props();

    // set context so children can all access current entry
    setEntryContext({
        get current() {
            return entry;
        },
    });
</script>

{@render children({ id: entry.id, entry })}
