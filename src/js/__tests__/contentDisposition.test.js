import { getFileNameFromHeader } from '../utils/getFileInfoFromHeaders';

describe('parse filename', () => {
    [
        { value: `Content-Disposition: attachment; filename=filename.jpg`, expected: 'filename.jpg'},
        { value: `Content-Disposition: attachment; filename=filename.jpg;`, expected: 'filename.jpg'},
        { value: `Content-Disposition: attachment; filename="filename.jpg"`, expected: 'filename.jpg'},
        { value: `Content-Disposition: attachment; filename="filename.jpg";`, expected: 'filename.jpg'},
        { value: `Content-Disposition: attachment; filename=filename.jpg; filename*=UTF-8''filename.jpg`, expected: 'filename.jpg'},
        { value: `Content-Disposition: attachment; filename="filename.jpg"; filename*=UTF-8''filename.jpg`, expected: 'filename.jpg'},
        { value: `foo-bar`, expected: null},
        { value: `filename=filename.jpg`, expected: null}
    ].forEach(header => {
        test(header.value, () => {
            const name = getFileNameFromHeader(header.value);
            expect(name).toBe(header.expected);
        });
    })

});