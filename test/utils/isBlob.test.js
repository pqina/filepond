import { isBlob } from '../../src/utils/test.js';

describe('isBlob', () => {
    it('should return false for File', () => {
        expect(isBlob(new File([], 'file.txt', { type: 'text/plain' }))).to.equal(false);
    });

    it('should return true for Blob', () => {
        expect(isBlob(new Blob([], { type: 'text/plain' }))).to.equal(true);
    });
});
