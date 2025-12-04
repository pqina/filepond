import { createEntryTree } from '../../src/core/entryTree.js';

describe('entryTree', function () {
    let a;
    let b;
    let c;
    let d;
    let e;
    let tree = undefined;

    beforeEach(function () {
        a = {
            id: '1',
        };

        b = {
            id: '2',
        };

        c = {
            id: '3',
        };

        d = {
            id: '4',
            file: new File(['d'], 'name.txt', { type: 'text/plain' }),
            meta: { value: 'foo' },
        };

        tree = createEntryTree({
            beforeAddEntry(entry) {
                return entry;
            },
        });
    });

    it('should set entries', function () {
        tree.entries = [a, b];

        expect(tree.entries.length).to.equal(2);
    });

    it('should get entries', function () {
        tree.entries = [a, b];

        expect(tree.entries[1].id).to.equal(b.id);
    });

    it('should reorder entries when setting existing items in different order', function () {
        tree.entries = [a, b, c];

        tree.entries = [c, b, a];

        expect(tree.entries[0].id).to.equal(c.id);
        expect(tree.entries[2].id).to.equal(a.id);
    });

    it('should remove entries when removing an entry from the set array', function () {
        tree.entries = [a, b, c, d];

        let removed = [];
        tree.on('removeEntry', (entry) => {
            removed.push(entry);
        });

        tree.entries = [a, c];

        expect(tree.entries[0].id).to.equal(a.id);
        expect(tree.entries[1].id).to.equal(c.id);
        expect(removed[0].entry.id).to.equal(b.id);
        expect(removed[1].entry.id).to.equal(d.id);
    });

    it('should update entries when their objects are updated', function () {
        tree.entries = [a, b, c];
        tree.entries = [a, b, { id: '3', foo: 'bar' }];

        expect(tree.entries[0].id).to.equal(a.id);
        expect(tree.entries[1].id).to.equal(b.id);
        expect(tree.entries[2].foo).to.equal('bar');
    });

    it('should add item', function () {
        tree.entries = [b];
        tree.insertEntries(a);

        expect(tree.entries.length).to.equal(2);
        expect(tree.entries[1]).to.equal(a);
    });

    it('should add items', function () {
        tree.entries = [b];
        tree.insertEntries([a, c]);

        expect(tree.entries.length).to.equal(3);
        expect(tree.entries[1]).to.equal(a);
        expect(tree.entries[2]).to.equal(c);
    });

    it('should add item before item', function () {
        tree.entries = [a, b];
        tree.insertEntries(c, 1);
        expect(tree.entries.length).to.equal(3);
        expect(tree.entries[1].id).to.equal(c.id);
        expect(tree.entries[2].id).to.equal(b.id);
    });

    it('should add item to item', function () {
        tree.entries = [a, { id: 'group', entries: [c] }, b];

        tree.insertEntries(d, [1, 1]);

        expect(tree.entries.length).to.equal(3);
        expect(tree.entries[2].id).to.equal(b.id);
        expect(tree.entries[1].entries[1].id).to.equal(d.id);
    });

    it('should add multiple entries', function () {
        tree.insertEntries([a, b]);
        expect(tree.entries.length).to.equal(2);
        expect(tree.entries[0]).to.equal(a);
        expect(tree.entries[1]).to.equal(b);
    });

    it('should find item by index', function () {
        tree.entries = [a, b, c];
        const result = tree.findEntries(1);
        expect(result.id).to.equal(b.id);
    });

    it('should return undefined for missing index', function () {
        tree.entries = [a, b, c];
        const results = tree.findEntries(4);
        expect(results).to.equal(undefined);
    });

    it('should find items by indexes', function () {
        tree.entries = [a, b, c, d];
        const results = tree.findEntries(2, 3);
        expect(results[0].id).to.equal(c.id);
        expect(results[1].id).to.equal(d.id);
    });

    it('should return undefined for missing indexes', function () {
        tree.entries = [a, b, c, d];
        const results = tree.findEntries(5, 3);
        expect(results[0]).to.equal(undefined);
        expect(results[1].id).to.equal(d.id);
    });

    it('should find item by nested index', function () {
        tree.entries = [a, { id: 'group', entries: [b, d] }, c];
        const result = tree.findEntries([1, 0]);
        expect(result.id).to.equal(b.id);
    });

    it('should find item by nested index when item is directory', function () {
        tree.entries = [
            a,
            {
                id: 'group',
                entries: [b, { id: 'subgroup', entries: [c] }, a],
            },
            c,
        ];
        const results = tree.findEntries([1, 1]);
        expect(results).to.not.be.undefined;
        expect(results.id).to.equal('subgroup');
    });

    it('should return undefined for missing nested index', function () {
        tree.entries = [a, { id: 'group', entries: [b, d] }, c];
        const results = tree.findEntries([1, 3]);
        expect(results).to.equal(undefined);
    });

    it('should find items by id', function () {
        tree.entries = [a, b, c];
        const result = tree.findEntries('2');
        expect(result.id).to.equal(b.id);
    });

    it('should find items by id when item nested', function () {
        tree.entries = [a, { id: 'group', entries: [b, d] }, c];
        const needle = tree.findEntries('2');
        expect(needle.id).to.equal(b.id);
    });

    it('should find items by id property', function () {
        tree.entries = [a, b, c, d];
        const needle = tree.findEntries({
            id: '2',
        });
        expect(needle.id).to.equal(b.id);
    });

    it('should remove all entries when no arguments supplied', function () {
        tree.entries = [a, b];

        tree.removeEntries();

        expect(tree.entries.length).to.equal(0);
    });

    it('should remove all entries when an undefined argument supplied', function () {
        tree.entries = [a, b];

        const index = undefined;
        tree.removeEntries(index);

        expect(tree.entries.length).to.equal(0);
    });

    it('should remove an entry by id property', function () {
        tree.entries = [a, b];

        tree.removeEntries(a);

        expect(tree.entries[0].id).to.equal(b.id);
    });

    it('should remove an entry by id', function () {
        tree.entries = [a, b];

        tree.removeEntries('1');

        expect(tree.entries[0].id).to.equal(b.id);
    });

    it('should remove an entry by index', function () {
        tree.entries = [a, b];

        tree.removeEntries(0);

        expect(tree.entries[0].id).to.equal(b.id);
    });

    it('should remove entries', function () {
        tree.entries = [a, b, c];
        tree.removeEntries(a, b);

        expect(tree.entries[0].id).to.equal(c.id);
    });

    it('should return undefined for missing entries', function () {
        tree.entries = [a, b, c];
        tree.removeEntries(a, d, b);

        expect(tree.entries[0].id).to.equal(c.id);
    });

    it('should remove entry from entry', function () {
        tree.entries = [a, b, { id: 'group', entries: [c] }];

        tree.removeEntries(c);

        expect(tree.entries[2].entries.length).to.equal(0);
    });

    it('should replace item', function () {
        tree.entries = [a, b];

        tree.replaceEntry(a, c);

        expect(tree.entries[0].id).to.equal(c.id);
        expect(tree.entries[1].id).to.equal(b.id);
    });

    it('should not throw when source item not found', function () {
        tree.entries = [a, b];

        tree.replaceEntry(d, c);

        expect(tree.entries[0].id).to.equal(a.id);
        expect(tree.entries[1].id).to.equal(b.id);
    });

    it('should replace item with multiple items', function () {
        tree.entries = [a, b];

        tree.replaceEntry(1, c, d);

        expect(tree.entries[1].id).to.equal(c.id);
        expect(tree.entries[2].id).to.equal(d.id);
    });

    it('should replace nested item', function () {
        tree.entries = [a, { id: 'group', entries: [b] }];

        tree.replaceEntry(b, c);

        expect(tree.entries[1].entries[0].id).to.equal(c.id);
    });

    it('should move item', function () {
        tree.entries = [a, b, c];

        tree.moveEntry(a, 2);

        expect(tree.entries[0].id).to.equal(b.id);
        expect(tree.entries[1].id).to.equal(c.id);
        expect(tree.entries[2].id).to.equal(a.id);
    });

    it('should move item to group', function () {
        tree.entries = [a, b, { name: 'foo', entries: [c] }];

        tree.moveEntry(a, [2, 1]);

        expect(tree.entries[0].id).to.equal(b.id);
        expect(tree.entries[1].entries[1].id).to.equal(a.id);
    });

    it('should sort items', function () {
        tree.entries = [a, b, c];

        tree.sortEntries((entryA, entryB) => {
            if (entryA.id < entryB.id) return 1;
            if (entryA.id > entryB.id) return -1;
            return 0;
        });

        expect(tree.entries[0].id).to.equal(c.id);
        expect(tree.entries[1].id).to.equal(b.id);
        expect(tree.entries[2].id).to.equal(a.id);
    });

    it('should update entry', function () {
        tree.entries = [a];

        // update at first index
        tree.updateEntry(0, { name: 'bar' });

        expect(tree.entries[0].name).to.equal('bar');
    });

    it('should update item state', function () {
        tree.entries = [a];

        tree.updateEntry(a, {
            state: {
                foo: 'bar',
            },
        });

        expect(tree.entries[0]?.state?.foo).to.equal('bar');
    });

    it('should update item with file', function () {
        tree.entries = [a];

        const newFile = new File([], 'hello.world', { type: 'text/plain' });

        tree.updateEntry(a, { file: newFile });

        expect(tree.entries[0].file).to.equal(newFile);
    });

    it('should update item property updated with object', function () {
        tree.entries = [d];

        tree.updateEntry(d, { name: 'renamed.txt' });

        expect(tree.entries[0].name).to.equal('renamed.txt');
    });

    it('should update item file if updated with file', function () {
        tree.entries = [d];

        const newFile = new File(['a'], 'renamed.txt', { type: 'text/plain' });

        tree.updateEntry(d, { file: newFile });

        expect(tree.entries[0].file).to.equal(newFile);
    });

    it('should update item file name if updated with a file that has similar props', function () {
        tree.entries = [d];

        tree.updateEntry(d, {
            file: new File(['a'], 'bar', { type: 'text/plain' }),
            meta: { value: 'bar' },
        });

        expect(tree.entries[0].meta.value).to.equal('bar');
    });
});
