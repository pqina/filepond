import { it, describe, expect } from 'vitest';
import { withNodeTree } from '../../src/elements/common/nodeTree.js';

describe('nodeTree', () => {
    it('should unwrap nodes', () => {
        const nodes = [{}];
        expect(withNodeTree(nodes).unwrap()).to.equal(nodes);
    });

    it('should append node', () => {
        const nodes = [
            {
                key: 'foo',
            },
        ];

        const node = {
            key: 'bar',
        };

        const unwrapped = withNodeTree(nodes).append(node).unwrap();

        expect(unwrapped[1]).to.equal(node);
    });

    it('should prepend node', () => {
        const nodes = [
            {
                key: 'foo',
            },
        ];

        const node = {
            key: 'bar',
        };

        const unwrapped = withNodeTree(nodes).prepend(node).unwrap();

        expect(unwrapped[0]).to.equal(node);
    });

    it('should unwrap nodes after append', () => {
        const nodes = [];

        const unwrapped = withNodeTree(nodes)
            .append({
                key: 'foo',
            })
            .unwrap();

        expect(unwrapped).to.equal(nodes);
    });

    it('should append nodeTree', () => {
        const nodes = [
            {
                key: 'foo',
            },
        ];

        const node = {
            key: 'bar',
        };

        const unwrapped = withNodeTree(nodes).append(withNodeTree(node)).unwrap();

        expect(unwrapped[1]).to.equal(node);
    });

    it('should append multiple nodes', () => {
        const nodes = [
            {
                key: 'foo',
            },
        ];

        const bar = {
            key: 'bar',
        };

        const baz = {
            key: 'baz',
        };

        const unwrapped = withNodeTree(nodes).append(bar, baz).unwrap();

        expect(unwrapped[1]).to.equal(bar);
        expect(unwrapped[2]).to.equal(baz);
    });

    it('should find nodes', () => {
        const nodes = [
            {
                key: 'foo',
                children: [
                    {
                        key: 'bar',
                    },
                    {
                        key: 'baz',
                    },
                    {
                        key: 'boz',
                    },
                ],
            },
        ];

        expect(withNodeTree(nodes).find('boz').unwrap()?.key).to.equal('boz');
    });

    it('should update node props', () => {
        const nodes = [
            {
                key: 'foo',
                children: [
                    {
                        key: 'bar',
                    },
                    {
                        key: 'baz',
                    },
                ],
            },
        ];

        withNodeTree(nodes).update('bar', (node) => {
            node.hello = 'world';
        });

        expect(nodes[0].children[0].hello).to.equal('world');
    });

    it('should append to updated node', () => {
        const nodes = [
            {
                key: 'foo',
                children: [
                    {
                        key: 'bar',
                    },
                    {
                        key: 'baz',
                    },
                ],
            },
        ];

        withNodeTree(nodes)
            .update('bar', (node) => {
                node.hello = 'world';
            })
            .append({
                key: 'subbar',
            });

        expect(nodes[0].children[0].children[0].key).to.equal('subbar');
    });

    it('should insert a node', () => {
        const nodes = [
            {
                key: 'foo',
            },
            {
                key: 'bar',
            },
        ];

        withNodeTree(nodes).insert(1, {
            key: 'baz',
        });

        expect(nodes[1].key).to.equal('baz');
    });

    it('should append nodes to original level', () => {
        const nodes = [];

        withNodeTree(nodes)
            .append({
                key: 'foo',
            })
            .append({
                key: 'bar',
            })
            .append({
                key: 'baz',
            });

        expect(nodes[0].key).to.equal('foo');
        expect(nodes[1].key).to.equal('bar');
        expect(nodes[2].key).to.equal('baz');
    });

    it('should append nodes to sub level', () => {
        const nodes = [];

        withNodeTree(nodes)
            .append({
                key: 'foo',
            })
            .append(
                withNodeTree({
                    key: 'bar',
                }).append({
                    key: 'baz',
                })
            );

        expect(nodes[0].key).to.equal('foo');
        expect(nodes[1].key).to.equal('bar');
        expect(nodes[1].children[0].key).to.equal('baz');
    });

    it('should remove a node', () => {
        const nodes = [
            {
                key: 'foo',
            },
            {
                key: 'bar',
            },
        ];

        withNodeTree(nodes).remove('bar');

        expect(nodes.length).to.equal(1);
        expect(nodes[0].key).to.equal('foo');
    });

    it('should remove a nested node', () => {
        const nodes = [
            {
                key: 'foo',
            },
            {
                // an item node can only be set on a component so we set a stub component prop here
                key: 'baz',
                component: null,
                item: {
                    key: 'item',
                    children: [
                        {
                            key: 'faa',
                        },
                        {
                            key: 'fii',
                        },
                        {
                            key: 'foo',
                        },
                    ],
                },
            },
            {
                key: 'bar',
            },
        ];

        withNodeTree(nodes).remove('fii');
        expect(nodes.length).to.equal(3);
        expect(nodes[1].item.children.length).to.equal(2);
    });
});
