import { it, describe, expect } from 'vitest';
import { naturalFileSizeToBytes } from '../../src/utils/file.js';

describe('naturalFileSizeToBytes', () => {
    const tests = [
        [['0 bytes'], 0],
        [['1 byte'], 1],
        [['100 bytes'], 100],
        [['1 MB'], 1000 * 1000],
        [['1.5 MB'], 1500 * 1000],
        [['2,000 MB'], 2000000 * 1000],
        [['1 MB', true], 1024 * 1024],
        [['1,5 MB', false, 'nl'], 1500 * 1000],
    ];

    tests.forEach(([input, output]) => {
        it('should return ' + output + ' for arguments ' + input.join(', '), () => {
            expect(naturalFileSizeToBytes(...input)).to.equal(output);
        });
    });
});
