import { it, describe, expect } from 'vitest';
import { naturalFileSizeToBytes } from '../../src/utils/file.js';

describe('naturalFileSizeToBytes', () => {
    const tests = [
        [['0 B'], 0],
        [['1 B'], 1],
        [['100 B'], 100],
        [['1 KB'], 1000],
        [['1 MB'], 1000 * 1000],
        [['1.5 MB'], 1500 * 1000],
        [['2,000 MB'], 2000000 * 1000],
        [['1,5 MB', { locale: 'nl' }], 1500 * 1000],
        [['1 KiB'], 1024],
        [['1 MiB'], 1024 * 1024],
    ];

    tests.forEach(([input, output]) => {
        it('should return ' + output + ' for arguments ' + input.join(', '), () => {
            expect(naturalFileSizeToBytes(...input)).to.equal(output);
        });
    });
});
