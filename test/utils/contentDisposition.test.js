import { getFilenameFromResponseHeaders } from '../../src/utils/xhr.js';

describe('getFilenameFromResponseHeaders', function () {
    [
        { headerValue: ``, expectedFilename: null },
        { headerValue: `foo-bar`, expectedFilename: null },
        { headerValue: `attachment;`, expectedFilename: null },
        { headerValue: `attachment; filename=`, expectedFilename: null },
        { headerValue: `attachment; filename.jpg`, expectedFilename: null },
        {
            headerValue: `attachment; filename=filename.jpg`,
            expectedFilename: 'filename.jpg',
        },
        {
            headerValue: `attachment; filename=filename.jpg;`,
            expectedFilename: 'filename.jpg',
        },
        {
            headerValue: `attachment; filename="filename.jpg"`,
            expectedFilename: 'filename.jpg',
        },
        {
            headerValue: `attachment; filename="filename.jpg";`,
            expectedFilename: 'filename.jpg',
        },
        {
            headerValue: `attachment; filename=file name.jpg`,
            expectedFilename: 'file name.jpg',
        },
        {
            headerValue: `attachment; filename*=UTF-8''file%20name.jpg`,
            expectedFilename: 'file name.jpg',
        },
        {
            headerValue: `attachment; filename=filename.jpg; filename*=UTF-8''filename.jpg`,
            expectedFilename: 'filename.jpg',
        },
        {
            headerValue: `attachment; filename="filename.jpg"; filename*=UTF-8''filename.jpg`,
            expectedFilename: 'filename.jpg',
        },
        {
            headerValue: `attachment; filename="file name.jpg"; filename*=UTF-8''file%20name.jpg`,
            expectedFilename: 'file name.jpg',
        },
    ].forEach(({ headerValue, expectedFilename }) => {
        it('should parse `' + headerValue + '`', function () {
            const filename = getFilenameFromResponseHeaders({
                contentDisposition: headerValue,
            });
            expect(filename).to.equal(expectedFilename);
        });
    });
});
