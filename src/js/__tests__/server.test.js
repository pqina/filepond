import { create } from '../index.js';

describe('setting server property', () => {

    let pond;

    beforeEach(() => {

        // new pond for each test
        if (pond) pond.destroy();
        pond = create();

        // enables draw loop, else it seems that filepond is hidden
        Object.defineProperty(pond.element, 'offsetParent', {
            get: jest.fn(() => 1)
        });

    });

    test('add fetch headers', () => {

        pond.server = {
            headers: {
                foo: 'bar'
            },
            revert: {
                headers: {
                    foo: 'baz'
                }
            }
        }

        expect(pond.server).toMatchObject({
            process: {
                headers: {
                    foo: 'bar'
                }
            },
            revert: {
                headers: {
                    foo: 'baz'
                }
            },
            fetch: {
                headers: {
                    foo: 'bar'
                }
            },
            restore: {
                headers: {
                    foo: 'bar'
                }
            },
            load: {
                headers: {
                    foo: 'bar'
                }
            },
            remove: null
        });

    });

});