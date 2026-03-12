<script lang="ts">
    import { type Size } from '../../../../utils/size.js';
    import { type FilePondFileEntry } from '../../../../types/index.js';
    import { type MediaImageOptions } from './index.js';
    import { untrack } from 'svelte';
    import { MediaPane } from '../MediaPane/index.js';
    import { arrayRemoveFalsy } from '../../../../utils/array.js';
    import { isBlobOrFile, isImageFile, isString } from '../../../../utils/test.js';
    import { getAppContext } from '../../../../elements/FilePondEntryList/contexts/appContext.js';
    import { getEntryContext } from '../../../../elements/FilePondEntryList/contexts/entryContext.js';
    import { filesAreProbablyEqual } from '../../../../utils/file.js';
    import { Status } from '../../../../common/status.js';
    import BitmapRenderer from './components/BitmapRenderer.svelte';

    let {
        class: klass = undefined,
        maximumPixels = undefined,
        resizeQuality = undefined,
        objectFit = undefined,
        overflowAmount = undefined,
        enableParallax = undefined,
    }: MediaImageOptions = $props();

    // get app
    const { setEntryExtensionState, getEntryExtensionState } = getAppContext();

    // get store
    const entryContext = getEntryContext() as { current: FilePondFileEntry };

    // quick references
    const file: File | Blob | undefined = $derived(entryContext.current.file);
    const extensionState = $derived(getEntryExtensionState(entryContext.current));
    const poster: string | undefined = $derived(extensionState?.poster);

    interface MediaFile {
        file: File | Blob;
        isComplete: boolean;
        isPoster: boolean;
    }

    // holds the current active file
    let currentFile: MediaFile | null = $state.raw(null);

    $effect(() => {
        // load 'File'
        if (isImageFile(file)) {
            filesAreProbablyEqual(
                // don't want to re-run when currentFile is assigned
                untrack(() => currentFile?.file),

                // newly updated file
                file
            )
                .then((filesAreEqual) => {
                    // files are the same
                    if (filesAreEqual) {
                        return;
                    }

                    // update view with new file
                    currentFile = {
                        file,
                        isComplete: false,
                        isPoster: false,
                    };
                })
                .catch(handleError);
        }

        // load 'poster'
        else if (poster) {
            if (isBlobOrFile(poster)) {
                currentFile = {
                    file: poster,
                    isComplete: false,
                    isPoster: true,
                };
            } else {
                fetch(poster)
                    .then((res) => res.blob())
                    .then((blob) => {
                        currentFile = {
                            file: blob,
                            isComplete: false,
                            isPoster: true,
                        };
                    })
                    .catch(handleError);
            }
        }
    });

    // list of active images, if data changes a new image preview is created and crossfaded
    let currentFiles: MediaFile[] = $state.raw([]);

    // populates the current files array
    $effect(() => {
        // skip if no file or already viewing this file
        if (!currentFile) {
            return;
        }

        // add current file and new file, always make sure poster is not on top
        untrack(() => {
            currentFiles = arrayRemoveFalsy([currentFiles.at(-1), currentFile]).sort((a, b) => {
                if (a.isPoster && !b.isPoster) {
                    return -1;
                }

                if (b.isPoster && !a.isPoster) {
                    return 1;
                }

                return 0;
            });
        });
    });

    function onLoadFile(file: File | Blob) {
        currentFiles = currentFiles.map((item) => {
            if (item.file === file) {
                return {
                    ...item,
                    isComplete: true,
                };
            }
            return item;
        });
    }

    // this makes sure last file is active
    const computedFiles = $derived(
        currentFiles.map(({ file, isPoster, isComplete }, index, arr) => ({
            // use file as draw key
            key: file,

            // file object
            file,

            // previous file was a poster, if this is true we instantly replace the previous image
            replacesPoster: !!currentFiles[index - 1]?.isPoster,

            // always make last file active
            active: index === arr.length - 1 ? '' : undefined,

            // did draw this file to bitmap
            complete: isComplete ? '' : undefined,

            // is this a poster
            poster: isPoster ? '' : undefined,
        }))
    );

    /** Sets load media error state on entry */
    function handleError(error: Error) {
        // show error state
        setEntryExtensionState(entryContext.current, {
            status: {
                type: Status.Error,
                code: 'MEDIA_LOAD_ERROR',
                values: { error, fileMainType: 'fileMainTypeImage' },
            },
        });

        // error
        hasError = true;
    }

    let hasError = $state(false);

    // not yet rendering media
    let mediaVisible = $state(false);

    // add media state to extension so can be used by UI
    $effect(() => {
        const mediaState = {
            isVisible: !!mediaVisible,
        };

        untrack(() => {
            setEntryExtensionState(entryContext.current, {
                media: mediaState,
            });
        });
    });
</script>

{#if !hasError}
    <media-image class={klass}>
        {#each computedFiles as { key, file, active, complete, poster, replacesPoster } (key)}
            <media-image-item class={klass} {active} {complete} {poster}>
                <MediaPane
                    {enableParallax}
                    {overflowAmount}
                    mediaObjectFit={objectFit}
                    mediaInitialOpacity={replacesPoster ? 1 : 0}
                    mediaInitialScalar={replacesPoster ? 1 : computedFiles.length > 1 ? 1 : 0}
                >
                    {#snippet children({ onInitMedia, onLoadMedia, onRenderMedia })}
                        <BitmapRenderer
                            {file}
                            {resizeQuality}
                            {maximumPixels}
                            taskId={entryContext.current.id}
                            oninit={() => {
                                onInitMedia();
                            }}
                            onload={(size: Size) => {
                                // set image file `complete` state
                                onLoadFile(file);

                                // let MediaPane know that we loaded
                                onLoadMedia(size);
                            }}
                            onrender={({ didRestore }) => {
                                // now showing media
                                mediaVisible = true;

                                // media is now visible
                                onRenderMedia({ instant: didRestore });
                            }}
                            onerror={handleError}
                        />
                    {/snippet}
                </MediaPane>
            </media-image-item>
        {/each}
    </media-image>
{/if}
