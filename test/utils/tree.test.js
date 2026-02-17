import { it, describe, expect } from 'vitest';
import { eachTree, mapTree, filterTree } from '../../src/utils/tree.js';

describe('tree', () => {
    describe('eachTree', () => {
        it('should call function on each item in the tree', () => {
            const hits = [];

            eachTree(
                [
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                        entries: [
                            {
                                id: '3',
                            },
                        ],
                    },
                ],
                (entry) => {
                    hits.push(entry.id);
                }
            );

            expect(hits).to.have.members(['1', '2', '3']);
        });
    });
    describe('mapTree', () => {
        it('should call map function on each item in the tree and return a new mapped tree structure', () => {
            const tree = [
                {
                    id: '1',
                },
                {
                    id: '2',
                    entries: [
                        {
                            id: '3',
                            entries: [
                                {
                                    id: '5',
                                },
                            ],
                        },
                        {
                            id: '4',
                        },
                    ],
                },
            ];

            const res = mapTree(tree, (entry) => {
                return {
                    ...entry,
                    foo: 'bar',
                };
            });

            expect(tree[0].foo).to.equal(undefined);
            expect(tree[1].foo).to.equal(undefined);
            expect(tree[1].entries[0].foo).to.equal(undefined);

            expect(res[0].foo).to.equal('bar');
            expect(res[1].foo).to.equal('bar');
            expect(res[1].entries[0].foo).to.equal('bar');
        });
    });
    describe('filterTree', () => {
        it('should filter items in the tree and return a new filtered tree structure', () => {
            const tree = [
                {
                    id: '1',
                },
                {
                    id: '2',
                    entries: [
                        {
                            id: '3',
                        },
                        {
                            id: '4',
                        },
                    ],
                },
            ];

            const res = filterTree(tree, (entry) => {
                return entry.id !== '4';
            });

            expect(tree[1].entries[1].id).to.equal('4');
            expect(res[1].entries[0].id).to.equal('3');
            expect(res[1].entries[1]).to.equal(undefined);
        });
    });
});
