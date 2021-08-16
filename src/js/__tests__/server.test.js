import './windowMatchMedia.mock';
import { create } from '../index.js';

describe('setting server property', () => {
    let pond;

    beforeEach(() => {
        // new pond for each test
        if (pond) pond.destroy();
        pond = create();

        // enables draw loop, else it seems that filepond is hidden
        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1),
        });
    });

    test('add fetch headers', () => {
        pond.server = {
            headers: {
                foo: 'bar',
            },
            revert: {
                headers: {
                    foo: 'baz',
                },
            },
        };

        expect(pond.server).toMatchObject({
            url: '',
            timeout: 0,
            process: null,
            patch: {
                url: '?patch=',
                method: 'PATCH',
                headers: { foo: 'bar' },
                withCredentials: false,
                timeout: 0,
                onload: null,
                ondata: null,
                onerror: null,
            },
            revert: {
                url: '',
                method: 'DELETE',
                headers: { foo: 'baz' },
                withCredentials: false,
                timeout: 0,
                onload: null,
                ondata: null,
                onerror: null,
            },
            fetch: {
                url: '?fetch=',
                method: 'GET',
                headers: { foo: 'bar' },
                withCredentials: false,
                timeout: 0,
                onload: null,
                ondata: null,
                onerror: null,
            },
            restore: {
                url: '?restore=',
                method: 'GET',
                headers: { foo: 'bar' },
                withCredentials: false,
                timeout: 0,
                onload: null,
                ondata: null,
                onerror: null,
            },
            load: {
                url: '?load=',
                method: 'GET',
                headers: { foo: 'bar' },
                withCredentials: false,
                timeout: 0,
                onload: null,
                ondata: null,
                onerror: null,
            },
            remove: null,
        });
    });
});
