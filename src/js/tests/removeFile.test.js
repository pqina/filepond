import { create } from '../index.js';

describe('removing files', () => {

    let pond = null;

    const DUMMY_FILE = new File(['Hello World!'], 'text_file_a.txt', {type: 'text/plain', lastModified: new Date()});

    beforeEach(() => {

        if (pond) {
            pond.destroy();
        }

        pond = create({
            server: {
                process: (fieldName, file, metadata, load, error, progress, abort) => {
                    let p = 0;
                    const interval = setInterval(() => {
                        p+=.01;
                        progress(true, p, 1);
                    }, 50);
                    setTimeout(() => {
                        clearInterval(interval);
                        progress(true, 1, 1);
                        load(Date.now());
                    }, 750);
                }
            }
        });

        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1)
        });

    });

    test('remove file object', () => {
        pond.files = [DUMMY_FILE];
        pond.removeFile();
        expect(pond.getFiles().length).toBe(0);
    });

    test('process and then remove file object', () => {
        pond.files = [DUMMY_FILE];
        pond.processFile().then(() => {
            pond.removeFile();
            expect(pond.getFiles().length).toBe(0);
            done();
        });
    });
    
});