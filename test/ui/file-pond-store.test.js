import { afterEach, beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { defineFilePond } from '../../src/index';
import { SimulatedStore } from '../../src/extensions/simulated-store';
import { generateFile } from '../../src/dev';
import { entryExtensionStatus, event } from '../helpers';
import { sleep } from '../../src/utils/sleep';

let pond;
let form;
let elements;

beforeEach(async () => {
    form = document.createElement('form');
    document.body.append(form);

    pond = document.createElement('file-pond');
    form.append(pond);

    elements = defineFilePond({
        extensions: [[SimulatedStore, { log: false }]],
    });

    await customElements.whenDefined('file-pond');
});

afterEach(() => {
    pond.remove();
    pond = null;
    elements = [];
});

test('stores entry when clicking store button', async () => {
    pond.entries = [
        {
            src: await generateFile(),
        },
    ];

    await page.getByRole('listitem');
    await page.getByRole('button', { name: 'store' }).click();
    await entryExtensionStatus(pond, 'STORE_COMPLETE');
    expect(pond.currentEntries[0].state.value).toBeTypeOf('string');
});

test('resets entry store state when clicking revert button', async () => {
    pond.entries = [
        {
            src: await generateFile(),
        },
    ];

    await page.getByRole('listitem');
    await page.getByRole('button', { name: 'store' }).click();
    await entryExtensionStatus(pond, 'STORE_COMPLETE');
    expect(pond.currentEntries[0].state.value).toBeTypeOf('string');

    await page.getByRole('button', { name: 'revert' }).click();
    await entryExtensionStatus(pond, 'STORE_RELEASE_COMPLETE');

    expect(pond.currentEntries[0].state.value).toBe(null);
});

test('removes entry when clicking revert button if shouldStore is true', async () => {
    pond.SimulatedStore = {
        shouldStore: () => true,
    };

    pond.entries = [
        {
            src: await generateFile(),
        },
    ];

    await page.getByRole('listitem');

    await entryExtensionStatus(pond, 'STORE_COMPLETE');

    expect(pond.currentEntries[0].state.value).toBeTypeOf('string');

    await page.getByRole('button', { name: 'revert' }).click();

    await entryExtensionStatus(pond, 'STORE_RELEASE_COMPLETE');

    expect(pond.currentEntries.length).toBe(0);
});

test('form validity is invalid when entry not stored', async () => {
    expect(form.checkValidity()).toBe(true);

    pond.entries = [
        {
            src: await generateFile(),
        },
    ];

    expect(form.checkValidity()).toBe(false);

    await page.getByRole('listitem');
    await page.getByRole('button', { name: 'store' }).click();

    await entryExtensionStatus(pond, 'STORE_COMPLETE');

    await sleep(10);

    expect(form.checkValidity()).toBe(true);
});
