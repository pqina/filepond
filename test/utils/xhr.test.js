import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { xhr } from '../../src/utils/xhr.js';
import { MockXhr } from 'mock-xmlhttprequest';

describe('xhr', function () {
    let mockXhr;

    beforeEach(function () {
        mockXhr = MockXhr;
        globalThis.XMLHttpRequest = mockXhr;
    });

    afterEach(function () {
        delete globalThis.XMLHttpRequest;
        mockXhr.onSend = null;
    });

    it('should kebab case request header name', () =>
        new Promise((done) => {
            mockXhr.onSend = (req) => {
                expect(
                    req.requestHeaders
                        .getAll()
                        .split(':')
                        .map((s) => s.trim())
                        .pop()
                ).to.equal('baz');
                done();
            };

            xhr('http://test', {
                headers: {
                    fooBar: 'baz',
                },
            });
        }));
});
