import { it, describe, expect } from 'vitest';
import { getExtensionFromFilename } from '../../src/utils/file.js';

describe('getExtensionFromFilename', function () {
    it('should parse non string', function () {
        expect(getExtensionFromFilename()).to.equal(undefined);
    });

    it('should parse empty string', function () {
        expect(getExtensionFromFilename('')).to.equal('');
    });

    it('should parse "name.txt"', function () {
        expect(getExtensionFromFilename('name.txt')).to.equal('.txt');
    });

    it('should parse "name.txt.txt"', function () {
        expect(getExtensionFromFilename('name.txt.txt')).to.equal('.txt');
    });

    it('should parse "name"', function () {
        expect(getExtensionFromFilename('name')).to.equal('');
    });
});
