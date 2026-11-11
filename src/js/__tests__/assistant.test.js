import './windowMatchMedia.mock';
import { assistant } from '../app/view/assistant';

const createAssistantView = items => {
    const store = {
        query: (type, query) => {
            switch (type) {
                case 'GET_ITEM':
                    return items.find(item => item.id === query) || null;
                case 'GET_LABEL_FILE_PROCESSING_COMPLETE':
                    return 'processing complete';
                case 'GET_LABEL_FILE_PROCESSING_ABORTED':
                    return 'processing aborted';
                default:
                    return null;
            }
        },
    };

    return assistant(store, { id: 'assistant' });
};

const write = (view, type, data) => {
    view._write(0, [{ type, data }]);
    return view.element;
};

describe('assistant announcements', () => {
    test('announces processing complete', () => {
        const view = createAssistantView([{ id: 'file-1', filename: 'cat.png' }]);
        write(view, 'DID_COMPLETE_ITEM_PROCESSING', { id: 'file-1' });
        expect(view.element.textContent).toBe('cat.png processing complete');
    });

    test('announces processing aborted', () => {
        const view = createAssistantView([{ id: 'file-1', filename: 'cat.png' }]);
        write(view, 'DID_ABORT_ITEM_PROCESSING', { id: 'file-1' });
        expect(view.element.textContent).toBe('cat.png processing aborted');
    });

    test('announces processing reverted', () => {
        const view = createAssistantView([{ id: 'file-1', filename: 'cat.png' }]);
        write(view, 'DID_REVERT_ITEM_PROCESSING', { id: 'file-1' });
        expect(view.element.textContent).toBe('cat.png processing aborted');
    });

    test('announces processing errors', () => {
        const view = createAssistantView([{ id: 'file-1', filename: 'cat.png' }]);
        write(view, 'DID_THROW_ITEM_PROCESSING_ERROR', {
            id: 'file-1',
            status: { main: 'upload failed', sub: 'tap to retry' },
        });
        expect(view.element.textContent).toBe('upload failed cat.png tap to retry');
    });

    test.each([
        ['DID_COMPLETE_ITEM_PROCESSING', { id: 'removed' }],
        ['DID_ABORT_ITEM_PROCESSING', { id: 'removed' }],
        ['DID_REVERT_ITEM_PROCESSING', { id: 'removed' }],
        [
            'DID_THROW_ITEM_REMOVE_ERROR',
            { id: 'removed', status: { main: 'remove failed', sub: 'tap to retry' } },
        ],
        [
            'DID_THROW_ITEM_LOAD_ERROR',
            { id: 'removed', status: { main: 'load failed', sub: 'tap to retry' } },
        ],
        [
            'DID_THROW_ITEM_INVALID',
            { id: 'removed', status: { main: 'invalid file', sub: 'tap to retry' } },
        ],
        [
            'DID_THROW_ITEM_PROCESSING_ERROR',
            { id: 'removed', status: { main: 'upload failed', sub: 'tap to retry' } },
        ],
    ])('skips %s for an item that has already been removed', (type, data) => {
        const view = createAssistantView([]);

        expect(() => write(view, type, data)).not.toThrow();
        expect(view.element.textContent).toBe('');
    });
});
