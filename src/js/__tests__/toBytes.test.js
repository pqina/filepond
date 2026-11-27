import { toBytes } from '../utils/toBytes';
import { convertTo } from '../app/utils/convertTo';

describe('toBytes', () => {
    [
        { value: 1000, expected: 1000 },
        { value: '500', expected: 500 },
        { value: '500KB', expected: 500000 },
        { value: '500 kb', expected: 500000 },
        { value: '5MB', expected: 5000000 },
        { value: '5 MB', expected: 5000000 },
        { value: '5mb', expected: 5000000 },
        { value: '2GB', expected: 2000000000 },
        { value: '1 GB', expected: 1000000000 },
        { value: '1gb', expected: 1000000000 },
    ].forEach(({ value, expected }) => {
        test(`Can convert: ${JSON.stringify(value)}`, () => {
            expect(toBytes(value)).toBe(expected);
        });
    });

    test('Uses the given base', () => {
        expect(toBytes('1KB', 1024)).toBe(1024);
        expect(toBytes('1MB', 1024)).toBe(1024 * 1024);
        expect(toBytes('1GB', 1024)).toBe(1024 * 1024 * 1024);
    });

    test('Converts size strings assigned to int options', () => {
        expect(convertTo('2GB', 'int')).toBe(2000000000);
        expect(convertTo('5MB', 'int')).toBe(5000000);
    });
});
