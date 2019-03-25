import { create } from '../index.js';

describe('adding files', () => {

    let pond = null;

    beforeEach(() => {
        if (pond) {
            pond.destroy();
        }
        pond = create();

        // enables draw loop, else it seems that filepond is hidden
        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1)
        });
    });

    test('add file', done => {
        const data = new File(['Hello World!'], 'dummy.txt', {type: 'text/plain', lastModified: new Date()})
        pond.addFile(data).then(item => {
            done();
        });
    });

    test('add blob', done => {
        const data = new Blob(['Hello World!'], {type: 'text/plain'});
        pond.addFile(data).then(item => {
            done();
        });
    });

    test('add base64 string', done => {
        const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
        pond.addFile(data).then(item => {
            done();
        });
    });

});