import { it, describe, expect } from 'vitest';
import { getExtensionFromMimeType } from '../../src/utils/file.js';

describe('getExtensionFromMimeType', function () {
    it('should parse non string', function () {
        expect(getExtensionFromMimeType()).to.equal(undefined);
    });

    it('should parse empty string', function () {
        expect(getExtensionFromMimeType('')).to.equal(undefined);
    });

    it('should parse "image/jpeg"', function () {
        expect(getExtensionFromMimeType('image/jpeg')).to.equal('.jpeg');
    });

    it('should ignore "+xml" postfix', function () {
        expect(getExtensionFromMimeType('image/svg+xml')).to.equal('.svg');
    });

    it('should ignore "x-" prefix', function () {
        expect(getExtensionFromMimeType('application/x-csh')).to.equal('.csh');
    });

    it('should ignore "-compressed" postfix', function () {
        expect(getExtensionFromMimeType('application/x-rar-compressed')).to.equal('.rar');
    });
});
