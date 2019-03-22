import { getItemIndexByQuery } from './getItemIndexByQuery';

export const getItemById = (items, itemId) => {
    const index = getItemIndexByQuery(items, itemId);
    if (index < 0) {
        return;
    }
    return items[index] || null;
};
