import { it, describe, expect } from 'vitest';
import { getFilenameWithoutExtension } from '../../src/utils/file.js';

describe('getFilenameWithoutExtension', function () {
    it('should parse none string', function () {
        expect(getFilenameWithoutExtension()).to.equal(undefined);
    });

    it('should parse empty string', function () {
        expect(getFilenameWithoutExtension('')).to.equal('');
    });

    it('should parse "name.txt"', function () {
        expect(getFilenameWithoutExtension('name.txt')).to.equal('name');
    });

    it('should parse "name.txt.txt"', function () {
        expect(getFilenameWithoutExtension('name.txt.txt')).to.equal('name.txt');
    });

    it('should parse "name"', function () {
        expect(getFilenameWithoutExtension('name')).to.equal('name');
    });
});
