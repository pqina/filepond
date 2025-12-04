import { isBlobOrFile } from '../../src/utils/test.js';

describe('isBlobOrFile', () => {
    it('should return true for File', () => {
        expect(isBlobOrFile(new File([], 'file.txt', { type: 'text/plain' }))).to.equal(true);
    });

    it('should return true for Blob', () => {
        expect(isBlobOrFile(new Blob([], { type: 'text/plain' }))).to.equal(true);
    });
});
