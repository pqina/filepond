import { xhr } from '../../src/utils/xhr.js';

describe('xhr', function () {
    beforeEach(function () {
        this.xmlHttpRequest = sinon.useFakeXMLHttpRequest();
    });

    afterEach(function () {
        this.xmlHttpRequest.restore();
    });

    it('should kebab case request header name', function (done) {
        this.xmlHttpRequest.onCreate = (xhr) => {
            setTimeout(() => {
                const { requestHeaders } = xhr;

                expect(requestHeaders['foo-bar']).to.equal('baz');

                done();
            }, 0);
        };

        xhr('./', {
            headers: {
                fooBar: 'baz',
            },
        });
    });
});
