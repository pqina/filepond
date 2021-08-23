import "./windowMatchMedia.mock";
import { create } from '../index.js';
import { actions } from '../app/actions.js';

/**
 * These tests verify that revert calls are made to revert uploads on removal of
 * files from the UI in certain circumstances. Reverting of uploads is generally
 * handled directly through the REVERT_ITEM_PROCESSING action which is triggered
 * when clicking the 'x' button that appears to the right hand side of a successful
 * file upload entry in the filepond UI. There are some cases, such as with
 * failed chunked uploads, where it's necessary to call revert in response to
 * a REMOVE_ITEM action, triggered through the remove button the 'x' that appears
 * to the left hand side of a failed file upload entry. In these cases, the
 * REVERT_ITEM_PROCESSING action is not triggered and reverting is handled within
 * REMOVE_ITEM.
 */
describe('reverting file uploads on remove', () => {

    const server = {
        remove: (source, load, error) => { }
    };

    let pond = null;
    let item = null;

    // Create 16k of random data to test chunked uploads
    const fileData = [];
    for (let i = 0; i < 16384; i++) {
        fileData.push(Math.floor(Math.random() * 128));
    }

    const TEXT_FILE = new File(['Hello World!'], 'text_file_a.txt', { type: 'text/plain', lastModified: new Date() });
    const TEXT_FILE_LARGE = new File(fileData, 'text_file_b.txt', { type: 'text/plain', lastModified: new Date() });

    const setupPond = (options, file, fileType = 'input') => {
        pond = create({
            ...options,
            allowMultiple: false,
            server
        });

        // Set up an uploaded file with FileOrigin set to INPUT
        pond.files = [{ source: file, options: { type: fileType } }];
        item = pond.getFiles()[0];
        // Mock the revert function on item so we can check it's been called
        item.revert = jest.fn();

        // enables draw loop, else it seems that filepond is hidden
        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1)
        });

        return pond;
    };

    beforeEach(() => {
        item = null;
        if (pond) {
            pond.destroy();
        }
    });

    test('no revert on removal of standard upload with chunks disabled', done => {
        pond = setupPond({ chunkUploads: false }, TEXT_FILE);
        pond.onremovefile = (error, file) => {
            expect(item.revert).not.toHaveBeenCalled();
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);

    });

    test('no revert on removal of single chunk upload with chunks enabled', done => {
        pond = setupPond({ chunkUploads: true, chunkSize: 1024 }, TEXT_FILE);
        pond.onremovefile = (error, file) => {
            expect(item.revert).not.toHaveBeenCalled();
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);
    });

    test('revert on removal of single chunk upload with chunkForce set', done => {
        pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024}, TEXT_FILE);
        pond.onremovefile = (error, file) => {
            expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);
    });

    test('revert on removal of chunked upload without chunkForce', done => {
        pond = setupPond({ chunkUploads: true, chunkForce: false, chunkSize: 1024 }, TEXT_FILE_LARGE);
        pond.onremovefile = (error, file) => {
            expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);
    });

    test('revert on removal of chunked upload with chunkForce set', () => {
        pond = setupPond({ chunkUploads: true, chunkForce: true, chunkSize: 1024 }, TEXT_FILE_LARGE);
        pond.onremovefile = (error, file) => {
            expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);
    });

    test('revert limbo with serverId set', () => {
        const fileId = 'abcdefghijklmnop';
        pond = setupPond({ chunkUploads: false }, fileId, 'limbo');
        // Check that serverId is not null (anything accepts values that are not null or undefined)
        expect(item.serverId).toBe(fileId);
        pond.onremovefile = (error, file) => {
            expect(item.revert).toHaveBeenCalledWith(expect.any(Function), false);
            expect(error).toBe(null);
            expect(pond.getFiles().length).toBe(0);
            done();
        }
        pond.removeFile(item);
    });
});
