import { toNaturalFileSize } from '../utils/toNaturalFileSize';

describe('toNaturalFileSize', () => {
    [
        { bytes: 999, expected: '999 bytes' },
        { bytes: 1000, expected: '1 KB' },
        { bytes: 1000000, expected: '1 MB' },
        { bytes: 1500000, expected: '1.5 MB' },
        { bytes: 1000000000, expected: '1 GB' },
        { bytes: 2000000000, expected: '2 GB' },
        { bytes: 10000000000, expected: '10 GB' },
        { bytes: 1050000000, expected: '1.05 GB' },
        { bytes: 1500000000, expected: '1.50 GB' },
    ].forEach(({ bytes, expected }) => {
        it(`formats ${bytes} bytes as ${expected}`, () => {
            expect(toNaturalFileSize(bytes)).toBe(expected);
        });
    });

    it('uses the given decimal separator', () => {
        expect(toNaturalFileSize(1500000000, ',')).toBe('1,50 GB');
        expect(toNaturalFileSize(2000000000, ',')).toBe('2 GB');
    });

    it('removes zero decimals with base 1024', () => {
        expect(toNaturalFileSize(2 * 1024 * 1024 * 1024, '.', 1024)).toBe('2 GB');
    });
});
