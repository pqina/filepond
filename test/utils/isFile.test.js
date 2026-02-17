import { it, describe, expect } from 'vitest';
import { isFile } from '../../src/utils/test.js';

describe('isFile', () => {
    it('should return true for File', () => {
        expect(isFile(new File([], 'file.txt', { type: 'text/plain' }))).to.equal(true);
    });

    it('should return false for Blob', () => {
        expect(isFile(new Blob([], { type: 'text/plain' }))).to.equal(false);
    });
});
