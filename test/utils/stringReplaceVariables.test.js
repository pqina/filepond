import { it, describe, expect } from 'vitest';
import { stringReplaceVariables } from '../../src/elements/common/string.js';

describe('stringReplaceVariables', () => {
    it('should format a plain label', () => {
        const res = stringReplaceVariables('Hello World');

        expect(res).to.equal('Hello World');
    });

    it('should replace a placeholder in a plain label', () => {
        const res = stringReplaceVariables('Hello {{foo}}', {
            foo: 'World',
        });

        expect(res).to.equal('Hello World');
    });

    it('should replace two placeholders in a plain label', () => {
        const res = stringReplaceVariables('Hello {{foo}} {{bar}}', {
            foo: 'World',
            bar: 'Mars',
        });

        expect(res).to.equal('Hello World Mars');
    });

    it('should replace placeholder with nested object value', () => {
        const res = stringReplaceVariables('Hello {{foo.bar}}', {
            foo: {
                bar: 'World',
            },
        });

        expect(res).to.equal('Hello World');
    });

    it('should replace placeholder with conditional label', () => {
        const res = stringReplaceVariables(
            {
                template: 'Hello {{foo}}',
                variables: {
                    foo: {
                        2: 'Mars',
                        else: 'World',
                    },
                },
            },
            {
                foo: 2,
            }
        );

        expect(res).to.equal('Hello Mars');
    });

    it('should replace placeholder with conditional label fallback', () => {
        const res = stringReplaceVariables(
            {
                template: 'Hello {{foo}}',
                variables: {
                    foo: {
                        2: 'Mars',
                        else: 'World',
                    },
                },
            },
            {
                foo: 3,
            }
        );

        expect(res).to.equal('Hello World');
    });

    it('should replace multiple conditional placeholders', () => {
        const res = stringReplaceVariables(
            {
                template: 'Hello {{foo}} {{bar}}',
                variables: {
                    foo: {
                        2: 'Mars',
                        else: 'World',
                    },
                    bar: {
                        2: 'Test',
                    },
                },
            },
            {
                foo: 3,
                bar: 2,
            }
        );

        expect(res).to.equal('Hello World Test');
    });

    it('should replace multiple conditional placeholders using a context selector', () => {
        const res = stringReplaceVariables(
            {
                template: 'Hello {{a}} {{b}}',
                variables: {
                    a: {
                        context: 'foo',
                        map: {
                            2: 'Mars',
                            else: 'World',
                        },
                    },
                    b: {
                        context: 'bar',
                        map: {
                            2: 'Test',
                        },
                    },
                },
            },
            {
                foo: 3,
                bar: 2,
            }
        );

        expect(res).to.equal('Hello World Test');
    });

    it('should replace multiple conditional placeholders with nested objects', () => {
        const res = stringReplaceVariables(
            {
                template: 'Hello {{foo}}',
                variables: {
                    foo: {
                        context: 'foo.bar',
                        map: {
                            2: 'Mars',
                            else: 'World',
                        },
                    },
                },
            },
            {
                foo: {
                    bar: 2,
                },
            }
        );

        expect(res).to.equal('Hello Mars');
    });

    it('should replace normal placeholders mixed with conditional placeholders', () => {
        const res = stringReplaceVariables(
            {
                template: 'Hello {{foo}} {{baz}}',
                variables: {
                    foo: {
                        context: 'foo.bar',
                        map: {
                            2: 'Mars',
                            else: 'World',
                        },
                    },
                },
            },
            {
                foo: {
                    bar: 2,
                },
                baz: 'Saturn',
            }
        );

        expect(res).to.equal('Hello Mars Saturn');
    });
});
