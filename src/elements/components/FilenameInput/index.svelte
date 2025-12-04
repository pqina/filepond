<script lang="ts">
    import type { Size } from '../../../utils/size.js';
    import { TextInput } from '../TextInput/index.js';
    import { resizable } from '../../attachments/resizable.js';
    import { isNumber } from '../../../utils/test.js';
    import { getExtensionFromFilename, getFilenameWithoutExtension } from '../../../utils/file.js';

    interface TextInputOptions {
        class?: string;
        value?: string;
        type?: string;
        size?: number | 'auto';
        disabled?: boolean;
        oninput?: (detail: string) => void;
        onconfirm?: (detail: string) => void;
        onblur?: (detail: string) => void;
    }

    let { value = '', onblur, onconfirm, ...textInputProps }: TextInputOptions = $props();

    const extension = $derived(getExtensionFromFilename(value));

    let valueWidth = $state();
    let fieldWidth = $state();
    let extensionWidth = $state();

    // is $derived so that when `value` is updated (sanitized) the filename input reflects the actual filename
    let filename = $derived({ current: value });

    let didConfirm = false;

    /** Resets value to original value */
    function reset() {
        filename = { current: value };
    }

    /** We set didConfirm so when the field is blurred we know if we have to reset the value */
    function handleConfirm(newName: string) {
        // test if has value, else reset
        if (newName.trim().length <= 0) {
            reset();
            return;
        }

        didConfirm = true;
        onconfirm?.(`${newName}${extension}`);
    }

    /** Reset didConfirm to original state */
    function handleFocus() {
        didConfirm = false;
    }

    /** If we confirmed we do nothing, else reset */
    function handleBlur() {
        if (didConfirm) {
            return;
        }

        reset();
    }

    /** Update current filename so we can recalc width */
    function handleInput(value: string) {
        filename = { current: value + extension };
    }

    /** Handles size of value */
    function handleValueResize(size: Size) {
        valueWidth = size.width;
    }

    /** Handles size of field */
    function handleFieldResize(size: Size) {
        fieldWidth = size.width;
    }

    /** Handles size of extension */
    function handleExtensionResize(size: Size) {
        extensionWidth = size.width;
    }

    // this syncs the width of the field with the length of the filename
    const styleValueWidth = $derived(isNumber(valueWidth) ? `${valueWidth}px` : undefined);

    // this tests if the field is overflowing, we do this in animationframe so the text in the input doesn't flicker
    const fieldWidthMargin = 1;
    let isOverflowing: string | undefined = $state('');
    $effect(() => {
        isNumber(valueWidth) && isNumber(fieldWidth) && testOverflow(valueWidth, fieldWidth);
    });

    function testOverflow(currentValueWidth: number, currentFieldWidth: number) {
        requestAnimationFrame(() => {
            isOverflowing =
                currentValueWidth > currentFieldWidth + fieldWidthMargin ? '' : undefined;
        });
    }

    // extension
    const styleExtensionWidth = $derived(
        isNumber(extensionWidth) ? `${extensionWidth}px` : undefined
    );
</script>

<filename-input
    data-overflow={isOverflowing}
    {@attach resizable({
        onresize: handleFieldResize,
    })}
    style:--value-width={styleValueWidth}
    style:--extension-width={styleExtensionWidth}
>
    <TextInput
        value={getFilenameWithoutExtension(filename.current)}
        {...textInputProps}
        oninput={handleInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        onconfirm={handleConfirm}
    /><span>{extension}</span><!-- important that there's no white-space -->
    <div class="measure-island">
        <div
            class="measure"
            aria-hidden="true"
            {@attach resizable({ onresize: handleValueResize })}
        >
            {filename.current}
        </div>
        <div
            class="measure"
            aria-hidden="true"
            {@attach resizable({ onresize: handleExtensionResize })}
        >
            {extension}
        </div>
    </div>
</filename-input>
