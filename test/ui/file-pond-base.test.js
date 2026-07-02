import { afterEach, beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { defineFilePond } from '../../src/index';
import { generateFile } from '../../src/dev';

let pond;
let elements;
beforeEach(async () => {
    pond = document.createElement('file-pond');
    document.body.append(pond);

    elements = defineFilePond();
    await customElements.whenDefined('file-pond');
});

afterEach(() => {
    pond.remove();
    pond = null;
    elements = [];
});

test('defines <file-pond> elements', async () => {
    expect(document.querySelector('file-pond')).toBe(pond);
    expect(elements).toHaveLength(1);
    expect(elements[0]).toBe(pond);
    expect(pond).toBeInstanceOf(customElements.get('file-pond'));

    const { shadowRoot } = pond;
    expect(shadowRoot).toBeInstanceOf(ShadowRoot);
    expect(shadowRoot.querySelector('file-pond-frame')).toBeInstanceOf(HTMLElement);
    expect(shadowRoot.querySelector('file-pond-drop-indicator')).toBeInstanceOf(HTMLElement);
    expect(shadowRoot.querySelector('file-pond-entry-list')).toBeInstanceOf(HTMLElement);
    expect(shadowRoot.querySelector('file-pond-source-description')).toBeInstanceOf(HTMLElement);
    expect(shadowRoot.querySelector('file-pond-source-list')).toBeInstanceOf(HTMLElement);
});

test('renders entry', async () => {
    pond.entries = [
        {
            src: await generateFile(),
        },
    ];

    await expect.element(page.getByRole('listitem')).toBeVisible();
});

test('deletes entry when clicking remove button', async () => {
    pond.entries = [
        {
            src: await generateFile(),
        },
    ];

    expect(pond.currentEntries.length).toBe(1);

    // page.getByRole('listitem');
    await page.getByRole('button', { name: 'Remove' }).click();

    expect(pond.currentEntries.length).toBe(0);
});
