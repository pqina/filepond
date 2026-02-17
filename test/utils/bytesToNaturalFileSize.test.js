import { it, describe, expect } from 'vitest';
import { bytesToNaturalFileSize } from '../../src/utils/file.js';

describe('bytesToNaturalFileSize', () => {
    const tests = [
        [[0], '0 bytes'],
        [[1], '1 byte'],
        [[100], '100 bytes'],
        [[1000 * 1000], '1 MB'],
        [[1200 * 1000], '1 MB'],
        [[1500 * 1000], '2 MB'],
        [
            [
                1500 * 1000,
                false,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
                'us',
            ],
            '1.50 MB',
        ],
        [[1000 * 1000 * 1000], '1 GB'],
        [[1000 * 1000 * 1000 * 1000], '1 TB'],
        [[1500 * 1000, true], '1 MB'],
        [[1600 * 1000, true], '2 MB'],
        [
            [
                1500 * 1000,
                true,
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
                'us',
            ],
            '1.43 MB',
        ],
    ];

    tests.forEach(([input, output]) => {
        it('should return ' + output + ' for arguments ' + input.join(', '), () => {
            expect(bytesToNaturalFileSize(...input)).to.equal(output);
        });
    });
});
