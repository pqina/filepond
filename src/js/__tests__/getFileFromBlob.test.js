import { getFileFromBlob } from '../utils/getFileFromBlob';

const blob = (type) => new Blob(['x'], { type });

describe('getFileFromBlob filename/extension handling', () => {
    test('appends a guessed extension when the filename has none', () => {
        // e.g. loading https://example.com/files/avatar that responds with image/png
        const file = getFileFromBlob(blob('image/png'), 'avatar');
        expect(file.name).toBe('avatar.png');
    });

    test('keeps the filename untouched when it already has an extension', () => {
        const file = getFileFromBlob(blob('image/png'), 'avatar.gif');
        expect(file.name).toBe('avatar.gif');
    });

    test('keeps dotfile names as-is', () => {
        const file = getFileFromBlob(blob('text/plain'), '.env');
        expect(file.name).toBe('.env');
    });

    test('honours an explicitly passed extension over the blob type', () => {
        const file = getFileFromBlob(blob('image/png'), 'avatar', null, 'webp');
        expect(file.name).toBe('avatar.webp');
    });
});
