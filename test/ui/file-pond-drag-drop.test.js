import { afterEach, beforeEach, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { defineFilePond } from '../../src/index';
import { SimulatedStore } from '../../src/extensions/simulated-store';
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

test('re-order entries with drag and drop', async () => {
    pond.EntryListView = {
        dragGrabTimeout: 0,
    };

    pond.entries = [
        { src: await generateFile({ name: 'a.txt' }) },
        { src: await generateFile({ name: 'b.txt' }) },
        { src: await generateFile({ name: 'c.txt' }) },
    ];

    await expect.element(page.getByRole('listitem').nth(2)).toBeVisible();

    await userEvent.dragAndDrop(
        page.getByRole('listitem').first(),
        page.getByRole('listitem').last()
    );

    await expect
        .poll(() => pond.currentEntries.map(({ name }) => name))
        .toEqual(['b.txt', 'c.txt', 'a.txt']);
});

test('removes entry when dragging and dropping outside of file-pond', async () => {
    pond.EntryListView = {
        dragGrabTimeout: 0,
    };

    pond.entries = [{ src: await generateFile({ name: 'a.txt' }) }];

    await expect.element(page.getByRole('listitem')).toBeVisible();

    const dropTarget = document.createElement('div');
    Object.assign(dropTarget.style, {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        width: '32px',
        height: '32px',
    });
    document.body.append(dropTarget);

    try {
        await userEvent.dragAndDrop(page.getByRole('listitem'), dropTarget);

        await expect.poll(() => pond.currentEntries.length).toBe(0);
    } finally {
        dropTarget.remove();
    }
});

test('adds new entry with drop', async () => {
    const file = await generateFile({ name: 'a.txt' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const waitForFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

    const dropArea = pond.shadowRoot.querySelector('file-pond-frame');
    const dropAreaRect = dropArea.getBoundingClientRect();
    const dropPoint = {
        x: dropAreaRect.x + dropAreaRect.width / 2,
        y: dropAreaRect.y + dropAreaRect.height / 2,
    };

    const dispatchDragEvent = (type) => {
        document.elementFromPoint(dropPoint.x, dropPoint.y).dispatchEvent(
            new DragEvent(type, {
                bubbles: true,
                clientX: dropPoint.x,
                clientY: dropPoint.y,
                dataTransfer,
            })
        );
    };

    await waitForFrame();
    await waitForFrame();
    dispatchDragEvent('dragenter');
    await waitForFrame();
    dispatchDragEvent('dragover');
    await waitForFrame();
    dispatchDragEvent('drop');

    await expect.poll(() => pond.currentEntries.map(({ name }) => name)).toEqual(['a.txt']);
});
