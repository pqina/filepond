import { sendRequest } from '../utils/sendRequest.js';

describe('sendRequest url encoding', () => {
    let openedUrl;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    beforeEach(() => {
        openedUrl = null;
        XMLHttpRequest.prototype.open = function(method, url) {
            openedUrl = url;
        };
        XMLHttpRequest.prototype.send = function() {};
    });

    afterEach(() => {
        XMLHttpRequest.prototype.open = originalOpen;
        XMLHttpRequest.prototype.send = originalSend;
    });

    test('keeps percent-encoded characters of a pre-signed url', () => {
        const url =
            'https://bucket.s3.amazonaws.com/upload?X-Amz-Credential=AKIA%2F20220627%2Fus-east-1&X-Amz-Signature=ab%3Dcd';
        sendRequest(new FormData(), url, { method: 'PUT' });
        expect(openedUrl).toBe(url);
    });

    test('still encodes characters that are not valid in a url', () => {
        sendRequest(null, 'https://example.com/a file/ü?name=a b', { method: 'POST' });
        expect(openedUrl).toBe('https://example.com/a%20file/%C3%BC?name=a%20b');
    });

    test('encodes a percent sign that does not start an escape', () => {
        sendRequest(null, 'https://example.com/100%?done=50%zz', { method: 'POST' });
        expect(openedUrl).toBe('https://example.com/100%25?done=50%25zz');
    });

    test('appends encoded data to a GET url', () => {
        sendRequest('a/b c', 'https://example.com/fetch?id=x%2Fy&load=', { method: 'GET' });
        expect(openedUrl).toBe('https://example.com/fetch?id=x%2Fy&load=a%2Fb%20c');
    });
});
