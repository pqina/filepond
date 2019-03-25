import { create } from '../index.js';

const next = (cb) => {
    setTimeout(() => {
        cb()
    }, 20);
}

describe('setting the files property', () => {

    let pond = null;

    const TEXT_DATAURI_A = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    const TEXT_FILE_A = new File(['Hello World!'], 'text_file_a.txt', {type: 'text/plain', lastModified: new Date()});
    const TEXT_FILE_B = new File(['Hello World!'], 'text_file_b.txt', {type: 'text/plain', lastModified: new Date()});

    beforeEach(() => {
        if (pond) {
            pond.destroy();
        }
        pond = create({
            allowMultiple: true
        });

        // enables draw loop, else it seems that filepond is hidden
        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1)
        });
    });

    test('set single file object', () => {
        pond.files = [TEXT_FILE_A];
        expect(pond.getFiles().length).toBe(1);
    });

    test('remove single file object', () => {
        pond.files = [TEXT_FILE_A];
        pond.files = [];
        expect(pond.getFiles().length).toBe(0);
    });

    test('replace single file object', () => {
        pond.files = [TEXT_FILE_A];
        pond.files = [TEXT_FILE_B];
        expect(pond.getFile().filename).toBe('text_file_b.txt');
    });

    test('re-add own file object', (done) => {
        
        // set data uri
        pond.files = [TEXT_DATAURI_A];

        // set marker
        pond.getFile().setMetadata('marker', 'hello');
        
        next(() => {
            
            // update files array with created file object from input file
            pond.files = [pond.getFile().file];

            // expect FilePond to find that this file already exists in array
            expect(pond.getFile().getMetadata('marker')).toBe('hello');

            done();
            
        });

    });
    
    test('replace file in list of multiple files', (done) => {

        // set data uri
        pond.files = [TEXT_DATAURI_A, TEXT_FILE_A];

        // set marker
        pond.getFile().setMetadata('marker', 'hello');

        next(() => {
            
            // update files array with created file object from input file
            pond.files = [TEXT_FILE_B, pond.getFile().file];
            
            // expect FilePond to find that this file already exists in array
            expect(pond.getFile(1).getMetadata('marker')).toBe('hello');

            done();

        });

    })

});