import { create, OptionTypes, FileStatus } from '../index.js';

describe('adding files', () => {

    const data = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
    let pond = null;

    const createPond = (options) => {
        if (pond) {
            pond.destroy();
        }

        pond = create({...options, server: {
            process: (fieldName, file, metadata, load, error, progress, abort) => {
                let p = 0;
                const interval = setInterval(() => {
                    p+=.01;
                    progress(true, p, 1);
                }, 50);
                const timeout = setTimeout(() => {
                    clearInterval(interval);
                    progress(true, 1, 1);
                    load(Date.now());
                }, 750);
                return {abort:() => {clearTimeout(timeout);abort();}}
            }
        }});

        // enables draw loop, else it seems that filepond is hidden and it won't run
        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1)
        });
    }

    test('oninit', done => {
        createPond({
            oninit: () => {
                done();
            }
        });
    });

    test('onaddfilestart', done => {
        createPond();
        pond.onaddfilestart = () => {
            done();
        }
        pond.addFile(data);
    });

    test('onaddfileprogress', done => {
        createPond();
        pond.onaddfilestart = () => {
            done();
        }
        pond.addFile(data);
    });

    test('onaddfile', done => {
        createPond();
        pond.onaddfilestart = () => {
            done();
        }
        pond.addFile(data);
    });

    test('onremovefile', done => {
        createPond();
        pond.files = [data];
        pond.onremovefile = () => {
            done();
        }
        pond.removeFile();
    });

    test('onprocessfilestart', done => {
        createPond();
        pond.onprocessfilestart = () => {
            done();
        }
        pond.files = [data];
    });

    test('onprocessfileprogress', done => {
        createPond();
        pond.onprocessfileprogress = () => {
            done();
        }
        pond.files = [data];
    });

    test('onprocessfileabort', done => {
        createPond();
        pond.onprocessfileabort = () => {
            done();
        }
        pond.files = [data];
        
        pond.getFile().abortProcessing();
    });

    test('onprocessfile', done => {
        createPond();
        pond.onprocessfile = () => {
            done();
        }
        pond.files = [data];
    });

    test('onprocessfiles', done => {
        createPond();
        pond.onprocessfiles = () => {
            const result = pond.getFiles().every(file => file.status === FileStatus.PROCESSING_COMPLETE)
            expect(result).toBe(true);
            done();
        }
        pond.files = [data, data];
    });

});