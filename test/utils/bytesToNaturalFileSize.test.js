import { it, describe, expect } from 'vitest';
import { bytesToNaturalFileSize } from '../../src/utils/file.js';

describe('bytesToNaturalFileSize', () => {
    const tests = [
        [[0], '0 B'],
        [[1], '1 B'],
        [[100], '100 B'],
        [[1000], '1 KB'],
        [[1000 * 1000], '1 MB'],
        [[1200 * 1000], '1 MB'],
        [[1500 * 1000], '2 MB'],
        [
            [
                1500 * 1000,
                {
                    locale: 'us',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
            ],
            '1.50 MB',
        ],
        [[1000 * 1000 * 1000], '1 GB'],
        [[1000 * 1000 * 1000 * 1000], '1 TB'],
        [[1024 * 1024, { format: 'mebi' }], '1 MiB'],
        [[1024 * 1024 * 1024, { format: 'mebi' }], '1 GiB'],
        [
            [
                1500 * 1000,
                {
                    locale: 'us',
                    format: 'mebi',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                },
            ],
            '1.43 MiB',
        ],
    ];

    tests.forEach(([input, output]) => {
        it('should return ' + output + ' for arguments ' + input.join(', '), () => {
            expect(bytesToNaturalFileSize(...input)).to.equal(output);
        });
    });
});
