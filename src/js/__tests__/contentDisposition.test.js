import { getFileNameFromHeader } from '../utils/getFileInfoFromHeaders';

describe('parse filename', () => {
    [
        { value: ``, expected: null },
        { value: `foo-bar`, expected: null },
        { value: `Content-Disposition: attachment;`, expected: null },
        { value: `Content-Disposition: attachment; filename=`, expected: null },
        { value: `Content-Disposition: attachment; filename.jpg`, expected: null },
        {
            value: `Content-Disposition: attachment; filename=filename.jpg`,
            expected: 'filename.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename=filename.jpg;`,
            expected: 'filename.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename="filename.jpg"`,
            expected: 'filename.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename="filename.jpg";`,
            expected: 'filename.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename=file name.jpg`,
            expected: 'file name.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename=filename.jpg; filename*=UTF-8''filename.jpg`,
            expected: 'filename.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename="filename.jpg"; filename*=UTF-8''filename.jpg`,
            expected: 'filename.jpg',
        },
        {
            value: `Content-Disposition: attachment; filename="file name.jpg"; filename*=UTF-8''file%20name.jpg`,
            expected: 'file name.jpg',
        },
    ].forEach(header => {
        test(`Can parse: "${header.value}"`, () => {
            const name = getFileNameFromHeader(header.value);
            expect(name).toBe(header.expected);
        });
    });
});
