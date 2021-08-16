import './windowMatchMedia.mock';
import { create, isSupported } from '../index.js';

const server = {
    process: (fieldName, file, metadata, load, error, progress, abort) => {
        let p = 0;
        const interval = setInterval(() => {
            p += 0.01;
            progress(true, p, 1);
        }, 50);
        setTimeout(() => {
            clearInterval(interval);
            progress(true, 1, 1);
            load(Date.now());
        }, 750);
    },
};

describe('removing files', () => {
    let pond = null;

    const DUMMY_FILE = new File(['Hello World!'], 'text_file_a.txt', {
        type: 'text/plain',
        lastModified: new Date(),
    });
    const LOCAL_FILE = {
        source: '12345',
        options: {
            type: 'local',
            file: {
                name: 'my-file.png',
                size: 12345,
                type: 'image/png',
            },
        },
    };

    beforeEach(() => {
        if (pond) {
            pond.destroy();
        }

        pond = create({
            instantUpload: false,
            server,
        });

        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1),
        });
    });

    test('remove file object', () => {
        pond.files = [DUMMY_FILE];
        pond.removeFile();
        expect(pond.getFiles().length).toBe(0);
    });

    test('process, then remove file object', done => {
        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        };
        pond.onaddfile = () => {
            pond.processFile().then(() => {
                pond.removeFile();
            });
        };
        pond.files = [DUMMY_FILE];
    });

    test('remove file object from client and from server', done => {
        pond.server = {
            ...server,
            remove: (source, load, error) => {
                setTimeout(() => {
                    load();
                }, 10);
            },
        };

        pond.onremovefile = (error, file) => {
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        };

        pond.onaddfile = () => {
            pond.removeFile();
        };

        pond.files = [LOCAL_FILE];
    });

    test('remove file object from client and fail to remove from server', done => {
        pond.server = {
            ...server,
            remove: (source, load, error) => {
                setTimeout(() => {
                    error('fail');
                }, 10);
            },
        };

        const onremovefile = jest.fn();
        pond.onremovefile = onremovefile;

        pond.onremovefile = (error, file) => {
            expect(error.type).toBe('error');
            expect(onremovefile).not.toHaveBeenCalled();
            expect(pond.getFiles().length).toBe(1);
            done();
        };

        pond.onaddfile = () => {
            pond.removeFile();
        };

        pond.files = [LOCAL_FILE];
    });
});
