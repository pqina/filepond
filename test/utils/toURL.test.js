import { it, describe, expect, beforeEach, afterEach } from 'vitest';
import { toURL } from '../../src/utils/url.js';

const host = 'http://' + location.host;

describe('toURL', () => {
    it('should return URL if input is already URL', () => {
        const input = new URL('http://localhost');
        const output = toURL(input);
        expect(output).to.equal(input);
    });

    it('should convert string to URL', () => {
        const input = 'http://localhost';
        const output = toURL(input);
        expect(output.href).to.equal('http://localhost/');
    });

    it('should convert string with querystring to URL', () => {
        const input = 'http://localhost/?foo=bar';
        const output = toURL(input);
        expect(output.href).to.equal('http://localhost/?foo=bar');
    });

    it('should convert string with path to URL', () => {
        const input = 'http://localhost/path';
        const output = toURL(input);
        expect(output.href).to.equal('http://localhost/path');
    });

    it('should convert relative ./path to URL', () => {
        const input = './path';
        const output = toURL(input);
        expect(output.href).to.equal(host + '/path');
    });

    it('should convert relative ../path to URL', () => {
        const input = '../path';
        const output = toURL(input);
        expect(output.href).to.equal(host + '/path');
    });

    it('should convert absolute path to URL', () => {
        const input = '/path';
        const output = toURL(input);
        expect(output.href).to.equal(host + '/path');
    });
});
