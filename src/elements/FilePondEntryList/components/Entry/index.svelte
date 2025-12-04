<script lang="ts">
    import type { Size } from '../../../../utils/size.js';
    import { ElementPane } from '../../../components/ElementPane/index.js';
    import { getAppContext } from '../../contexts/appContext.js';
    import { getEntryContext } from '../../contexts/entryContext.js';
    import { getSpringElementTreeContext } from '../../contexts/springElementTreeContext.js';
    import { toClassName } from '../../../common/string.js';
    import { updateDataset } from '../../../../utils/dom.js';

    // props
    const { children, part = undefined, class: klass = undefined, dataset } = $props();

    let root: HTMLFieldSetElement;

    // so we can update root dataset
    $effect(() => {
        updateDataset(root, dataset);
    });

    // combined classes
    const currentClass = $derived(klass);
    const entryClass = $derived(toClassName('entry', currentClass));

    // get spring context
    const springContext = getSpringElementTreeContext();
    const { currentSize, targetSize } = $derived(springContext) as {
        currentSize: Size;
        targetSize: Size;
    };

    // get entry context
    const entryContext = getEntryContext();
    const name = $derived(entryContext.current.name);

    // file disabled overlay opacity
    const { disabledState: isDisabled } = $derived(getAppContext());

    // calculate clip mask so we can nicely scale content
    const hasSize = $derived(currentSize && targetSize);
    const maskRight = $derived(hasSize ? targetSize!.width - currentSize!.width : 0);
    const maskBottom = $derived(hasSize ? targetSize!.height - currentSize!.height : 0);
    const maskStyle = $derived(`0px ${maskRight}px ${maskBottom}px 0px`);

    // CSS classes
    const additionalFrontPaneClass = $derived(isDisabled ? 'entry-disabled' : undefined);
    const frontPaneClass = $derived(toClassName('entry-front', additionalFrontPaneClass));
</script>

<!-- Render entry item-->
<fieldset class={entryClass} bind:this={root} style:--mask={maskStyle} {part}>
    <legend class="implicit">{name}</legend>
    {@render children()}
</fieldset>

<!-- Draw panels outside mask -->
<ElementPane class="entry-back" {...currentSize} />
<ElementPane class={frontPaneClass} {...currentSize} />
